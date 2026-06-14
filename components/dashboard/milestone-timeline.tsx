"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_ORDER, STAGE_META, stageIndex } from "@/lib/stages";
import type { ProjectStage } from "@/lib/supabase/database.types";

/**
 * Horizontal, scrollable stage timeline.
 *  - completed stages: filled + check
 *  - current stage: accent ring with an animated pulse halo
 *  - upcoming stages: muted
 * The connecting line fills up to the current stage.
 */
export function MilestoneTimeline({ stage }: { stage: ProjectStage }) {
  const current = stageIndex(stage);
  const fillPct =
    STAGE_ORDER.length > 1
      ? (current / (STAGE_ORDER.length - 1)) * 100
      : 0;

  return (
    <div className="no-scrollbar overflow-x-auto pb-1">
      <div className="relative flex min-w-[560px] items-start justify-between px-1">
        {/* Base track */}
        <div className="absolute left-5 right-5 top-[18px] h-[2px] rounded-full bg-line" />
        {/* Animated fill */}
        <motion.div
          className="absolute left-5 top-[18px] h-[2px] rounded-full bg-gradient-to-r from-accent to-accent-hover"
          initial={{ width: 0 }}
          animate={{
            width: `calc(${fillPct}% - ${fillPct > 0 ? "0px" : "0px"})`,
          }}
          style={{ maxWidth: "calc(100% - 2.5rem)" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />

        {STAGE_ORDER.map((s, i) => {
          const done = i < current;
          const isCurrent = i === current;
          return (
            <div
              key={s}
              className="relative z-10 flex w-[88px] flex-col items-center gap-2"
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.3 + i * 0.08,
                  type: "spring",
                  stiffness: 300,
                  damping: 18,
                }}
                className={cn(
                  "relative grid size-9 place-items-center rounded-full border-2 bg-canvas transition-colors",
                  done && "border-accent bg-accent text-white",
                  isCurrent && "border-accent bg-surface text-accent",
                  !done && !isCurrent && "border-line bg-surface text-ink-ghost",
                )}
              >
                {isCurrent && (
                  <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-accent" />
                )}
                {done ? (
                  <Check className="size-4" strokeWidth={3} />
                ) : (
                  <span className="size-2 rounded-full bg-current" />
                )}
              </motion.div>

              <div className="text-center">
                <p
                  className={cn(
                    "text-[11px] font-semibold leading-tight",
                    done || isCurrent ? "text-ink" : "text-ink-faint",
                  )}
                >
                  {STAGE_META[s].label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
