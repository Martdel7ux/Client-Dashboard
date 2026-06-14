"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./animated-counter";

/**
 * Admin stat tile — animated figure, icon chip, optional sub-label.
 * `tone` colours the icon chip to signal category.
 */
export function StatCard({
  label,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  icon,
  sub,
  tone = "accent",
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon: ReactNode;
  sub?: string;
  tone?: "accent" | "review" | "completed" | "live";
}) {
  const toneClass = {
    accent: "text-accent",
    review: "text-status-review",
    completed: "text-status-completed",
    live: "text-status-live",
  }[tone];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card-premium noise relative overflow-hidden p-5"
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
          {label}
        </p>
        <span
          className={cn(
            "grid size-9 place-items-center rounded-lg border border-line bg-surface-sunken",
            toneClass,
          )}
        >
          {icon}
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <AnimatedCounter
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          className="text-3xl font-extrabold tracking-tight text-ink"
        />
      </div>
      {sub && <p className="mt-1 text-xs text-ink-faint">{sub}</p>}
    </motion.div>
  );
}
