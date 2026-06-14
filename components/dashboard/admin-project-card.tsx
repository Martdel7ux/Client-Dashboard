"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn, getInitials, workingDaysUntil } from "@/lib/utils";
import { STAGE_META, STATUS_META } from "@/lib/stages";
import { ProgressBar } from "./progress-bar";
import type {
  ProjectStage,
  ProjectStatus,
} from "@/lib/supabase/database.types";

export interface AdminProjectCardData {
  id: string;
  title: string;
  clientName: string;
  stage: ProjectStage;
  status: ProjectStatus;
  progress: number;
  estimatedEndDate: string | null;
}

export function AdminProjectCard({
  project,
  href,
}: {
  project: AdminProjectCardData;
  href: string;
}) {
  const status = STATUS_META[project.status];
  const days = workingDaysUntil(project.estimatedEndDate);

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="group card-premium noise flex h-full flex-col p-5 transition-colors hover:border-line-strong"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full border border-line bg-surface-raised text-xs font-semibold text-ink-muted">
              {getInitials(project.clientName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {project.title}
              </p>
              <p className="truncate text-xs text-ink-faint">
                {project.clientName}
              </p>
            </div>
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-ink-ghost transition-colors group-hover:text-accent" />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className={cn("size-2 rounded-full", status.dot)} />
          <span className="text-xs font-medium text-ink-muted">
            {STAGE_META[project.stage].label}
          </span>
          <span className="text-ink-ghost">·</span>
          <span className="text-xs text-ink-faint">
            {project.estimatedEndDate
              ? `${days} working ${days === 1 ? "day" : "days"} left`
              : "Not scheduled"}
          </span>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-ink-faint">
            <span>Progress</span>
            <span className="tabular text-ink-muted">{project.progress}%</span>
          </div>
          <ProgressBar value={project.progress} height="sm" shimmer={false} />
        </div>
      </motion.div>
    </Link>
  );
}
