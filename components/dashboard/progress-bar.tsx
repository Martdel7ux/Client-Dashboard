"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0–100
  className?: string;
  /** Adds a moving shimmer sweep while in progress. */
  shimmer?: boolean;
  height?: "sm" | "md" | "lg";
}

const HEIGHTS = { sm: "h-1.5", md: "h-2.5", lg: "h-3.5" };

export function ProgressBar({
  value,
  className,
  shimmer = true,
  height = "md",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-surface-sunken shadow-inset",
        HEIGHTS[height],
        className,
      )}
    >
      <motion.div
        className="relative h-full rounded-full bg-gradient-to-r from-accent to-accent-hover"
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      >
        {shimmer && clamped > 0 && clamped < 100 && (
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute inset-y-0 -left-full w-full animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </div>
        )}
      </motion.div>
    </div>
  );
}
