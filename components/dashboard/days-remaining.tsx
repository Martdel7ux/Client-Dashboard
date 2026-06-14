"use client";

import { useEffect, useState } from "react";
import { workingDaysUntil } from "@/lib/utils";
import { AnimatedCounter } from "./animated-counter";

/**
 * Live working-day countdown (Mon–Fri only).
 * Recomputes on mount and at every local midnight so the figure never goes stale.
 */
export function DaysRemaining({
  estimatedEndDate,
}: {
  estimatedEndDate: string | null;
}) {
  const [days, setDays] = useState(() => workingDaysUntil(estimatedEndDate));

  useEffect(() => {
    setDays(workingDaysUntil(estimatedEndDate));
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 5, 0);
    const timer = setTimeout(
      () => setDays(workingDaysUntil(estimatedEndDate)),
      nextMidnight.getTime() - now.getTime(),
    );
    return () => clearTimeout(timer);
  }, [estimatedEndDate]);

  if (!estimatedEndDate) {
    return <span className="text-ink-faint">Not scheduled yet</span>;
  }

  return (
    <span className="inline-flex items-baseline gap-1.5">
      <AnimatedCounter
        value={days}
        className="text-2xl font-extrabold tracking-tight text-ink"
      />
      <span className="text-sm font-medium text-ink-muted">
        working {days === 1 ? "day" : "days"} left
      </span>
    </span>
  );
}
