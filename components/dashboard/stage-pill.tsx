"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { STATUS_META } from "@/lib/stages";
import type { ProjectStatus } from "@/lib/supabase/database.types";

/** Animated status pill with a soft pulsing status dot. */
export function StagePill({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <motion.span
      key={status}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
        meta.bg,
        meta.text,
        className,
      )}
    >
      <span className="relative flex size-1.5">
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
            meta.dot,
          )}
        />
        <span className={cn("relative inline-flex size-1.5 rounded-full", meta.dot)} />
      </span>
      {meta.label}
    </motion.span>
  );
}
