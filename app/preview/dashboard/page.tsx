import Link from "next/link";
import {
  FolderUp,
  GitPullRequestArrow,
  MessageSquare,
  CalendarClock,
  TrendingUp,
} from "lucide-react";
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
import {
  FadeIn,
  StaggerGroup,
  StaggerItem,
} from "@/components/dashboard/motion-primitives";

export const metadata = { title: "Dashboard Preview — Atelier" };

// ── Sample data ─────────────────────────────────────────────
const PROJECT = {
  title: "Acme Studio Website",
  stage: "design" as const,
  status: "in_progress" as const,
  progress_percent: 72,
  estimated_end_date: new Date(Date.now() + 21 * 86400000)
    .toISOString()
    .slice(0, 10),
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

const EVENTS: ActivityEvent[] = [
  {
    id: "1",
    kind: "stage_advanced",
    text: "Milestone completed — Homepage visual direction",
    at: hoursAgo(3),
  },
  {
    id: "2",
    kind: "message",
    text: "New message — Loving the new hero section, one small tweak…",
    at: hoursAgo(7),
  },
  {
    id: "3",
    kind: "file_uploaded",
    text: "Content uploaded — About page copy",
    at: hoursAgo(26),
  },
  {
    id: "4",
    kind: "change_request",
    text: "Change request — Swap testimonial photos",
    at: hoursAgo(50),
  },
  {
    id: "5",
    kind: "project_live",
    text: "Design stage kicked off",
    at: hoursAgo(73),
  },
];

export default function DashboardPreview() {
  return (
    <div>
      <FadeIn>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-[34px]">
          Good afternoon, Martina
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
          Your {PROJECT.title} is{" "}
          <span className="font-semibold text-ink">
            {PROJECT.progress_percent}% complete
          </span>{" "}
          — you&apos;re in the{" "}
          <span className="font-semibold text-accent">
            {STAGE_META[PROJECT.stage].label}
          </span>{" "}
          stage. {STAGE_META[PROJECT.stage].blurb}.
        </p>
      </FadeIn>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <FadeIn delay={0.05}>
            <Card className="noise overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-4 p-6 pb-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
                    Current Project
                  </p>
                  <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink">
                    {PROJECT.title}
                  </h2>
                </div>
                <StagePill status={PROJECT.status} />
              </div>

              <div className="grid grid-cols-2 divide-x divide-line border-y border-line bg-surface-sunken/40">
                <div className="flex items-center gap-3 p-5">
                  <span className="grid size-10 place-items-center rounded-lg border border-line bg-surface text-accent">
                    <TrendingUp className="size-5" />
                  </span>
                  <div>
                    <AnimatedCounter
                      value={PROJECT.progress_percent}
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
                      estimatedEndDate={PROJECT.estimated_end_date}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 p-6">
                <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
                  <span>Overall progress</span>
                  <span className="tabular text-ink">
                    {PROJECT.progress_percent}%
                  </span>
                </div>
                <ProgressBar value={PROJECT.progress_percent} height="lg" />
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">
                  Project Timeline
                </h3>
                <span className="text-xs text-ink-faint">
                  {STAGE_META[PROJECT.stage].label} stage
                </span>
              </div>
              <MilestoneTimeline stage={PROJECT.stage} />
            </Card>
          </FadeIn>

          <FadeIn delay={0.15}>
            <StaggerGroup className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StaggerItem>
                <QuickAction
                  href="/preview/dashboard"
                  label="Upload Content"
                  icon={<FolderUp className="size-[18px]" />}
                />
              </StaggerItem>
              <StaggerItem>
                <QuickAction
                  href="/preview/dashboard"
                  label="Submit Change Request"
                  icon={<GitPullRequestArrow className="size-[18px]" />}
                />
              </StaggerItem>
              <StaggerItem>
                <QuickAction
                  href="/preview/dashboard"
                  label="View Messages"
                  icon={<MessageSquare className="size-[18px]" />}
                />
              </StaggerItem>
            </StaggerGroup>
          </FadeIn>
        </div>

        <FadeIn delay={0.2} className="lg:col-span-1">
          <Card className="sticky top-8 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Recent Activity</h3>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link href="/preview/dashboard">View all</Link>
              </Button>
            </div>
            <ActivityFeed events={EVENTS} />
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
