"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

/** Icon is a rendered element so this is safe to call from Server Components. */
export function QuickAction({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="group flex items-center gap-3 rounded-lg border border-line bg-surface p-3.5 shadow-inset transition-colors hover:border-accent/40"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-surface-raised text-ink-muted transition-colors group-hover:border-accent/40 group-hover:text-accent">
          {icon}
        </span>
        <span className="text-sm font-medium text-ink">{label}</span>
      </motion.div>
    </Link>
  );
}
