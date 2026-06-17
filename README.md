# Tamplo · Client Project Management Dashboard

A premium, dark-mode-first portal for a design/development agency. Two sides:
an **admin panel** for the agency owner and a **client portal** for clients.
Built with Next.js 14 (App Router), TypeScript, Supabase, Tailwind, shadcn-style
primitives, and Framer Motion.

> **Status — foundation pass.** Scaffold, design system, Supabase schema + types,
> auth flow, route protection, and the client **dashboard home** are complete and
> the production build is green. `/content`, `/changes`, `/messages`, `/settings`,
> and the admin area render on-brand placeholders ready to be filled in.

---

## Design system

- **Surfaces** `#0A0A0A` canvas · `#111111` cards · `#1F1F1F` borders (1px borders +
  inner shadows, never drop shadows)
- **Accent** a single electric indigo `#6366F1`, used sparingly
- **Type** Inter, with `font-extrabold` (800) headings for hierarchy
- **Motion** page/section fades, staggered card entrances, animated number counters,
  the milestone timeline progress fill, and a pulse ring on the active stage
- **Empty states** custom animated icon clusters — never "no data found"

Tokens live in [`tailwind.config.ts`](tailwind.config.ts) and
[`app/globals.css`](app/globals.css).

---

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev                  # http://localhost:3000
```

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run [`supabase/schema.sql`](supabase/schema.sql). This
   creates every table, all enums, Row Level Security policies, the `is_admin()` /
   `owns_project()` helpers, the `handle_new_user()` trigger, the realtime
   publication for `messages` + `notifications`, and a public `content` storage
   bucket.
3. Copy your Project URL, anon key, and service-role key into `.env.local`.

The TypeScript `Database` type in
[`lib/supabase/database.types.ts`](lib/supabase/database.types.ts) is kept in sync
with the SQL by hand; regenerate any time with:

```bash
supabase gen types typescript --project-id <id> > lib/supabase/database.types.ts
```

### 2. Create your admin user

Sign up a user in the Supabase Auth dashboard, then promote it:

```sql
update public.profiles set role = 'admin' where email = 'you@agency.com';
```

Admins land on `/admin/dashboard`; clients land on `/dashboard`. Clients are
created by the admin via `supabase.auth.admin.createUser` (welcome email via
Resend) — that flow lives in the admin panel build-out.

### 3. Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (browser + server) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role — **server only**, bypasses RLS |
| `RESEND_API_KEY` | Transactional email (stage updates, welcome) |
| `STRIPE_SECRET_KEY` | Change-request invoices |
| `STRIPE_WEBHOOK_SECRET` | Verify Stripe webhook signatures |
| `NEXT_PUBLIC_APP_URL` | Base URL for links in emails |

---

## Architecture

```
app/
  (auth)/login/        login page + server actions (sign in / out)
  (client)/            client portal — minimal icon sidebar shell
    dashboard/         greeting · project card · timeline · activity feed
    content/ changes/ messages/ settings/
  (admin)/admin/       admin panel (role-gated)
  auth/callback/       Supabase code → session exchange
  api/                 (Stripe webhooks, send email, create user — next)
components/
  ui/                  shadcn-style primitives (button, card, badge, …)
  dashboard/           animated counter, progress bar, milestone timeline,
                       stage pill, activity feed, empty state, motion helpers
  layout/              client sidebar
  brand/               logo
lib/
  supabase/            client · server · admin instances · middleware · types
  queries.ts           server-side auth/profile/project helpers
  stages.ts            stage/status/content metadata + ordering
  utils.ts             cn, working-days countdown, euros, password gen
supabase/schema.sql    full Postgres schema + RLS
middleware.ts          session refresh + route protection
```

### Route protection

[`middleware.ts`](middleware.ts) refreshes the Supabase session on every request,
redirects unauthenticated users to `/login`, gates `/admin/*` to `role === 'admin'`,
and bounces already-signed-in users away from `/login`.

### Key logic implemented

- **Working-day countdown** — Mon–Fri only, recomputed at local midnight
  ([`lib/utils.ts`](lib/utils.ts) · [`days-remaining.tsx`](components/dashboard/days-remaining.tsx)).
- **Stage model** — ordered stages with labels/blurbs and a fill-to-current
  timeline ([`lib/stages.ts`](lib/stages.ts) · [`milestone-timeline.tsx`](components/dashboard/milestone-timeline.tsx)).
- **Activity feed** — merges recent milestones, messages, content, and change
  requests into the last five events.

---

## Build & checks

```bash
npm run typecheck   # tsc --noEmit
npm run build       # next build
npm run lint
```

---

## Roadmap (next build passes)

- Content sections + drag-and-drop uploads to Supabase Storage
- Change requests with Stripe payment links for post-launch (€45) requests
- Realtime chat (`messages`) + notification subscriptions
- Admin: project detail (stage/progress/milestones/content), client creation with
  Resend welcome email, invoices
- Resend email templates per stage; "Mark project as Live" flow
