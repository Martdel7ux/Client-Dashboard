import Link from "next/link";
import {
  FolderUp,
  GitPullRequestArrow,
  MessageSquare,
  Rocket,
  Sparkles,
  CalendarClock,
  TrendingUp,
} from "lucide-react";
import { requireProfile, getClientProject } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { firstName } from "@/lib/utils";
import { STAGE_META } from "@/lib/stages";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StagePill } from "@/components/dashboard/stage-pill";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { AnimatedCounter } from "@/components/dashboard/animated-counter";
import { DaysRemaining } from "@/components/dashboard/days-remaining";
import { MilestoneTimeline } from "@/components/dashboard/milestone-timeline";
import { QuickAction } from "@/components/dashboard/quick-action";
import {
  ActivityFeed,
  type ActivityEvent,
} from "@/components/dashboard/activity-feed";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  FadeIn,
  StaggerGroup,
  StaggerItem,
} from "@/components/dashboard/motion-primitives";

export const metadata = { title: "Dashboard · Tamplo" };

export default async function DashboardPage() {
  const profile = await requireProfile();
  const project = await getClientProject(profile.id);

  if (!project) {
    return (
      <FadeIn>
        <Header name={profile.full_name} />
        <Card className="mt-8">
          <EmptyState
            icon={<Sparkles className="size-6" />}
            satellites={[
              <Rocket key="r" className="size-3.5" />,
              <FolderUp key="f" className="size-3.5" />,
              <MessageSquare key="m" className="size-3.5" />,
            ]}
            title="Your project is being set up"
            description="We're putting the finishing touches on your workspace. You'll see your project timeline here the moment it's ready."
          />
        </Card>
      </FadeIn>
    );
  }

  const supabase = createClient();
  const events = await buildActivity(supabase, project.id);
  const stageBlurb = STAGE_META[project.stage].blurb;

  return (
    <div>
      {/* Greeting */}
      <FadeIn>
        <Header name={profile.full_name} />
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
          Your {project.title} is{" "}
          <span className="font-semibold text-ink">
            {project.progress_percent}% complete
          </span>
          , and you&apos;re now in the{" "}
          <span className="font-semibold text-accent">
            {STAGE_META[project.stage].label}
          </span>{" "}
          stage. {stageBlurb}.
        </p>
      </FadeIn>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Project card */}
          <FadeIn delay={0.05}>
            <Card className="noise overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-4 p-6 pb-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
                    Current Project
                  </p>
                  <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink">
                    {project.title}
                  </h2>
                </div>
                <StagePill status={project.status} />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 divide-x divide-line border-y border-line bg-surface-sunken/40">
                <div className="flex items-center gap-3 p-5">
                  <span className="grid size-10 place-items-center rounded-lg border border-line bg-surface text-accent">
                    <TrendingUp className="size-5" />
                  </span>
                  <div>
                    <AnimatedCounter
                      value={project.progress_percent}
                      suffix="%"
                      className="text-2xl font-extrabold tracking-tight text-ink"
                    />
                    <p className="text-xs text-ink-faint">Complete</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-5">
                  <span className="grid size-10 place-items-center rounded-lg border border-line bg-surface text-status-review">
                    <CalendarClock className="size-5" />
                  </span>
                  <div>
                    <DaysRemaining
                      estimatedEndDate={project.estimated_end_date}
                    />
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2.5 p-6">
                <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
                  <span>Overall progress</span>
                  <span className="tabular text-ink">
                    {project.progress_percent}%
                  </span>
                </div>
                <ProgressBar value={project.progress_percent} height="lg" />
              </div>
            </Card>
          </FadeIn>

          {/* Milestone timeline */}
          <FadeIn delay={0.1}>
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">
                  Project Timeline
                </h3>
                <span className="text-xs text-ink-faint">
                  {STAGE_META[project.stage].label} stage
                </span>
              </div>
              <MilestoneTimeline stage={project.stage} />
            </Card>
          </FadeIn>

          {/* Quick actions */}
          <FadeIn delay={0.15}>
            <StaggerGroup className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StaggerItem>
                <QuickAction
                  href="/content"
                  label="Upload Content"
                  icon={<FolderUp className="size-[18px]" />}
                />
              </StaggerItem>
              <StaggerItem>
                <QuickAction
                  href="/changes"
                  label="Submit Change Request"
                  icon={<GitPullRequestArrow className="size-[18px]" />}
                />
              </StaggerItem>
              <StaggerItem>
                <QuickAction
                  href="/messages"
                  label="View Messages"
                  icon={<MessageSquare className="size-[18px]" />}
                />
              </StaggerItem>
            </StaggerGroup>
          </FadeIn>
        </div>

        {/* Activity sidebar */}
        <FadeIn delay={0.2} className="lg:col-span-1">
          <Card className="sticky top-8 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Recent Activity</h3>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link href="/messages">View all</Link>
              </Button>
            </div>
            <ActivityFeed events={events} />
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}

function Header({ name }: { name: string | null }) {
  const hour = new Date().getHours();
  const salute =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-[34px]">
      {salute}, {firstName(name)}
    </h1>
  );
}

/** Builds the last-5 activity feed from recent rows across tables. */
async function buildActivity(
  supabase: ReturnType<typeof createClient>,
  projectId: string,
): Promise<ActivityEvent[]> {
  const [milestones, messages, content, changes] = await Promise.all([
    supabase
      .from("milestones")
      .select("id,title,completed_at")
      .eq("project_id", projectId)
      .eq("completed", true)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(5),
    supabase
      .from("messages")
      .select("id,content,created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("content_items")
      .select("id,label,created_at,status")
      .eq("project_id", projectId)
      .neq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("change_requests")
      .select("id,title,created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const events: ActivityEvent[] = [];

  for (const m of milestones.data ?? [])
    events.push({
      id: `m-${m.id}`,
      kind: "stage_advanced",
      text: `Milestone completed: ${m.title}`,
      at: m.completed_at!,
    });
  for (const msg of messages.data ?? [])
    events.push({
      id: `msg-${msg.id}`,
      kind: "message",
      text:
        msg.content.length > 60
          ? `New message: ${msg.content.slice(0, 60)}…`
          : `New message: ${msg.content}`,
      at: msg.created_at,
    });
  for (const c of content.data ?? [])
    events.push({
      id: `c-${c.id}`,
      kind: "file_uploaded",
      text: `Content ${c.status}: ${c.label}`,
      at: c.created_at,
    });
  for (const cr of changes.data ?? [])
    events.push({
      id: `cr-${cr.id}`,
      kind: "change_request",
      text: `Change request: ${cr.title}`,
      at: cr.created_at,
    });

  return events
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 5);
}
