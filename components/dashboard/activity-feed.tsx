"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpRight,
  FileUp,
  GitPullRequestArrow,
  MessageSquare,
  Rocket,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { EmptyState } from "./empty-state";
import { Activity } from "lucide-react";

export type ActivityKind =
  | "stage_advanced"
  | "file_uploaded"
  | "message"
  | "change_request"
  | "project_live";

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  text: string;
  at: string;
}

const ICONS: Record<ActivityKind, { icon: LucideIcon; tint: string }> = {
  stage_advanced: { icon: ArrowUpRight, tint: "text-accent" },
  file_uploaded: { icon: FileUp, tint: "text-status-onboarding" },
  message: { icon: MessageSquare, tint: "text-status-live" },
  change_request: { icon: GitPullRequestArrow, tint: "text-status-review" },
  project_live: { icon: Rocket, tint: "text-status-completed" },
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={<Activity className="size-6" />}
        satellites={[
          <Sparkles key="s" className="size-3.5" />,
          <MessageSquare key="m" className="size-3.5" />,
          <FileUp key="f" className="size-3.5" />,
        ]}
        title="Nothing yet"
        description="Project activity like stage changes, uploads and messages will appear here as things move."
      />
    );
  }

  return (
    <ul className="space-y-1">
      {events.map((e, i) => {
        const { icon: Icon, tint } = ICONS[e.kind];
        return (
          <motion.li
            key={e.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
            className="group flex gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-surface-raised"
          >
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border border-line bg-surface-sunken">
              <Icon className={`size-3.5 ${tint}`} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-ink">{e.text}</p>
              <p className="mt-0.5 text-xs text-ink-faint">
                {formatDistanceToNow(new Date(e.at), { addSuffix: true })}
              </p>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
