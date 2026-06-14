"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Custom empty state — an animated cluster of icons inside a dashed orbit,
 * never a bare "no data" line.
 *
 * Icons are passed as rendered elements (ReactNode) rather than component
 * types so this client component can be used directly from Server Components.
 */
export function EmptyState({
  icon,
  satellites = [],
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  satellites?: ReactNode[];
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-14 text-center",
        className,
      )}
    >
      <div className="relative mb-6 grid size-24 place-items-center">
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-full border border-dashed border-line"
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          {satellites.slice(0, 3).map((sat, i) => {
            const angle = (i / Math.max(satellites.length, 1)) * Math.PI * 2;
            const r = 48;
            return (
              <span
                key={i}
                className="absolute grid size-7 place-items-center rounded-lg border border-line bg-surface-raised text-ink-faint shadow-inset"
                style={{
                  left: `calc(50% + ${Math.cos(angle) * r}px - 14px)`,
                  top: `calc(50% + ${Math.sin(angle) * r}px - 14px)`,
                }}
              >
                {sat}
              </span>
            );
          })}
        </motion.div>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="relative grid size-14 place-items-center rounded-2xl border border-line bg-surface text-accent shadow-inset-md"
        >
          {icon}
          <span className="pointer-events-none absolute inset-0 rounded-2xl bg-accent/10 blur-lg" />
        </motion.div>
      </div>

      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-ink-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
