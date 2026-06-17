import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { STAGE_META } from "@/lib/stages";
import { StagePill } from "@/components/dashboard/stage-pill";
import { FadeIn } from "@/components/dashboard/motion-primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectControls } from "@/components/admin/project-controls";
import { MilestonesManager } from "@/components/admin/milestones-manager";
import { ContentManager } from "@/components/admin/content-manager";
import { ChangeRequestsAdmin } from "@/components/admin/change-requests-admin";
import { Chat, type Participant } from "@/components/messages/chat";

export const metadata = { title: "Project · Tamplo" };

export default async function AdminProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const admin = await requireAdmin();
  const supabase = createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!project) notFound();

  const [
    { data: client },
    { data: milestones },
    { data: sections },
    { data: items },
    { data: requests },
    { data: messages },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .eq("id", project.client_id)
      .single(),
    supabase.from("milestones").select("*").eq("project_id", project.id),
    supabase.from("content_sections").select("*").eq("project_id", project.id),
    supabase.from("content_items").select("*").eq("project_id", project.id),
    supabase
      .from("change_requests")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("messages")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true }),
  ]);

  const participants: Record<string, Participant> = {
    [admin.id]: { full_name: admin.full_name, avatar_url: admin.avatar_url },
  };
  if (client)
    participants[client.id] = {
      full_name: client.full_name,
      avatar_url: client.avatar_url,
    };

  const openRequests = (requests ?? []).filter(
    (r) => r.status !== "completed" && r.status !== "rejected",
  ).length;

  return (
    <div>
      <FadeIn>
        <Link
          href="/admin/dashboard"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" /> All projects
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              {project.title}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {client?.full_name ?? "Client"} · {client?.email} ·{" "}
              {STAGE_META[project.stage].label} stage
            </p>
          </div>
          <StagePill status={project.status} />
        </div>
      </FadeIn>

      <Tabs defaultValue="overview" className="mt-7">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {openRequests > 0 && (
              <span className="ml-1 grid size-4 place-items-center rounded-full bg-accent text-[10px] font-bold text-white">
                {openRequests}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ProjectControls project={project} />
        </TabsContent>

        <TabsContent value="milestones">
          <MilestonesManager
            projectId={project.id}
            milestones={milestones ?? []}
          />
        </TabsContent>

        <TabsContent value="content">
          <ContentManager
            projectId={project.id}
            sections={sections ?? []}
            items={items ?? []}
          />
        </TabsContent>

        <TabsContent value="requests">
          <ChangeRequestsAdmin
            projectId={project.id}
            requests={requests ?? []}
          />
        </TabsContent>

        <TabsContent value="messages">
          <Chat
            projectId={project.id}
            meId={admin.id}
            participants={participants}
            initialMessages={messages ?? []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
