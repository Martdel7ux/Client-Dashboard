-- ============================================================================
-- Tamplo · Client Project Management Dashboard
-- Full Postgres schema + Row Level Security for Supabase.
-- Run in the Supabase SQL editor (or `supabase db push`).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------- Enums ----------------------------------------------------------
do $$ begin
  create type user_role          as enum ('admin', 'client');
  create type project_type        as enum ('webdesign','branding','webapp','ecommerce','other');
  create type project_status       as enum ('onboarding','in_progress','review','completed','live');
  create type project_stage        as enum ('discovery','wireframes','design','development','review','launched');
  create type content_item_type    as enum ('image','text','url','file');
  create type content_item_status  as enum ('pending','uploaded','approved');
  create type change_status        as enum ('submitted','reviewing','in_progress','completed','rejected');
  create type invoice_status       as enum ('unpaid','paid');
  create type notification_type    as enum ('stage_advanced','file_uploaded','message','change_request','invoice','project_live');
exception when duplicate_object then null; end $$;

-- ---------- profiles -------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  role          user_role not null default 'client',
  avatar_url    text,
  last_login_at timestamptz,
  created_at    timestamptz not null default now()
);

-- ---------- projects -------------------------------------------------------
create table if not exists public.projects (
  id                 uuid primary key default gen_random_uuid(),
  client_id          uuid not null references public.profiles(id) on delete cascade,
  title              text not null,
  description        text,
  type               project_type not null default 'webdesign',
  status             project_status not null default 'onboarding',
  stage              project_stage not null default 'discovery',
  progress_percent   int not null default 0 check (progress_percent between 0 and 100),
  start_date         date,
  estimated_end_date date,
  launched_at        timestamptz,
  created_at         timestamptz not null default now()
);
create index if not exists projects_client_idx on public.projects(client_id);

-- ---------- milestones -----------------------------------------------------
create table if not exists public.milestones (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  title        text not null,
  description  text,
  order_index  int not null default 0,
  completed    boolean not null default false,
  completed_at timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists milestones_project_idx on public.milestones(project_id);

-- ---------- content_sections ----------------------------------------------
create table if not exists public.content_sections (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  section_name text not null,
  description  text,
  order_index  int not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists content_sections_project_idx on public.content_sections(project_id);

-- ---------- content_items --------------------------------------------------
create table if not exists public.content_items (
  id          uuid primary key default gen_random_uuid(),
  section_id  uuid not null references public.content_sections(id) on delete cascade,
  project_id  uuid not null references public.projects(id) on delete cascade,
  type        content_item_type not null default 'text',
  label       text not null,
  value       text,
  file_url    text,
  file_name   text,
  notes       text,
  status      content_item_status not null default 'pending',
  order_index int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists content_items_section_idx on public.content_items(section_id);

-- ---------- change_requests ------------------------------------------------
create table if not exists public.change_requests (
  id                        uuid primary key default gen_random_uuid(),
  project_id                uuid not null references public.projects(id) on delete cascade,
  client_id                 uuid not null references public.profiles(id) on delete cascade,
  title                     text not null,
  description               text,
  status                    change_status not null default 'submitted',
  is_post_launch            boolean not null default false,
  fee_euros                 int not null default 45,
  invoice_status            invoice_status not null default 'unpaid',
  stripe_payment_intent_id  text,
  stripe_payment_link       text,
  file_url                  text,
  created_at                timestamptz not null default now()
);
create index if not exists change_requests_project_idx on public.change_requests(project_id);

-- ---------- messages -------------------------------------------------------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sender_id  uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists messages_project_idx on public.messages(project_id, created_at);

-- ---------- notifications --------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  type       notification_type not null,
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id, read);

-- ============================================================================
-- Helper: is the current user an admin?
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper: does the current user own this project (as the client)?
create or replace function public.owns_project(pid uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.projects
    where id = pid and client_id = auth.uid()
  );
$$;

-- ============================================================================
-- Trigger: create a profile row when an auth user is created.
-- (Admin-created users carry full_name + role in raw_user_meta_data.)
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'client')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles         enable row level security;
alter table public.projects         enable row level security;
alter table public.milestones       enable row level security;
alter table public.content_sections enable row level security;
alter table public.content_items    enable row level security;
alter table public.change_requests  enable row level security;
alter table public.messages         enable row level security;
alter table public.notifications    enable row level security;

-- profiles: self read/update; admins read all
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- projects: client sees own; admin sees/does all
drop policy if exists projects_read on public.projects;
create policy projects_read on public.projects
  for select using (client_id = auth.uid() or public.is_admin());
drop policy if exists projects_admin_write on public.projects;
create policy projects_admin_write on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

-- milestones / content_sections: read if owns project or admin; write admin only
do $$
declare t text;
begin
  foreach t in array array['milestones','content_sections'] loop
    execute format('drop policy if exists %1$s_read on public.%1$s;', t);
    execute format('create policy %1$s_read on public.%1$s for select using (public.owns_project(project_id) or public.is_admin());', t);
    execute format('drop policy if exists %1$s_admin_write on public.%1$s;', t);
    execute format('create policy %1$s_admin_write on public.%1$s for all using (public.is_admin()) with check (public.is_admin());', t);
  end loop;
end $$;

-- content_items: client may read + update/insert their own project's items; admin all
drop policy if exists content_items_read on public.content_items;
create policy content_items_read on public.content_items
  for select using (public.owns_project(project_id) or public.is_admin());
drop policy if exists content_items_client_write on public.content_items;
create policy content_items_client_write on public.content_items
  for update using (public.owns_project(project_id)) with check (public.owns_project(project_id));
drop policy if exists content_items_admin_write on public.content_items;
create policy content_items_admin_write on public.content_items
  for all using (public.is_admin()) with check (public.is_admin());

-- change_requests: client reads/creates own; admin all
drop policy if exists change_requests_read on public.change_requests;
create policy change_requests_read on public.change_requests
  for select using (client_id = auth.uid() or public.is_admin());
drop policy if exists change_requests_client_insert on public.change_requests;
create policy change_requests_client_insert on public.change_requests
  for insert with check (client_id = auth.uid());
drop policy if exists change_requests_admin_write on public.change_requests;
create policy change_requests_admin_write on public.change_requests
  for all using (public.is_admin()) with check (public.is_admin());

-- messages: participants of the project (client owner or admin) read/send
drop policy if exists messages_read on public.messages;
create policy messages_read on public.messages
  for select using (public.owns_project(project_id) or public.is_admin());
drop policy if exists messages_send on public.messages;
create policy messages_send on public.messages
  for insert with check (
    sender_id = auth.uid()
    and (public.owns_project(project_id) or public.is_admin())
  );
drop policy if exists messages_update on public.messages;
create policy messages_update on public.messages
  for update using (public.owns_project(project_id) or public.is_admin());

-- notifications: user reads/updates their own
drop policy if exists notifications_read on public.notifications;
create policy notifications_read on public.notifications
  for select using (user_id = auth.uid());
drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update using (user_id = auth.uid());

-- ============================================================================
-- Realtime publication for live messages + notifications
-- ============================================================================
do $$ begin
  alter publication supabase_realtime add table public.messages;
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; end $$;

-- ============================================================================
-- Storage bucket for client content uploads
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('content', 'content', true)
on conflict (id) do nothing;
