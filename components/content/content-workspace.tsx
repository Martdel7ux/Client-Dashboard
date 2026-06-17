"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { itemsBySection, progressFor } from "@/lib/content";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { AnimatedCounter } from "@/components/dashboard/animated-counter";
import { ContentItemCard } from "./content-item-card";
import type {
  ContentItem,
  ContentSection,
} from "@/lib/supabase/database.types";

export function ContentWorkspace({
  sections,
  initialItems,
  demo = false,
}: {
  sections: ContentSection[];
  initialItems: ContentItem[];
  demo?: boolean;
}) {
  const [items, setItems] = useState<ContentItem[]>(initialItems);
  const [selectedId, setSelectedId] = useState<string>(sections[0]?.id ?? "");

  const grouped = useMemo(() => itemsBySection(items), [items]);
  const overall = useMemo(() => progressFor(items), [items]);

  const selected = sections.find((s) => s.id === selectedId) ?? sections[0];
  const selectedItems = grouped[selected?.id] ?? [];

  function updateItem(updated: ContentItem) {
    setItems((prev) =>
      prev.map((it) => (it.id === updated.id ? updated : it)),
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      {/* Sections rail */}
      <aside className="space-y-4">
        <div className="rounded-lg border border-line bg-surface p-4 shadow-inset-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-ink-faint">
              Overall
            </span>
            <span className="text-sm font-bold text-ink">
              <AnimatedCounter value={overall.pct} suffix="%" />
            </span>
          </div>
          <ProgressBar value={overall.pct} height="sm" className="mt-2.5" />
          <p className="mt-2 text-xs text-ink-faint">
            {overall.done} of {overall.total} items complete
          </p>
        </div>

        <nav className="space-y-1.5">
          {sections.map((section) => {
            const p = progressFor(grouped[section.id] ?? []);
            const active = section.id === selected?.id;
            const done = p.total > 0 && p.done === p.total;
            return (
              <button
                key={section.id}
                onClick={() => setSelectedId(section.id)}
                className={cn(
                  "group w-full rounded-lg border p-3 text-left transition-colors",
                  active
                    ? "border-accent/40 bg-accent/5"
                    : "border-line bg-surface hover:border-line-strong hover:bg-surface-raised",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "truncate text-sm font-semibold",
                      active ? "text-ink" : "text-ink-muted",
                    )}
                  >
                    {section.section_name}
                  </span>
                  {done ? (
                    <CheckCircle2 className="size-4 shrink-0 text-status-completed" />
                  ) : (
                    <span className="shrink-0 text-xs tabular text-ink-faint">
                      {p.done}/{p.total}
                    </span>
                  )}
                </div>
                <ProgressBar
                  value={p.pct}
                  height="sm"
                  shimmer={false}
                  className="mt-2"
                />
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Section detail */}
      <section>
        <AnimatePresence mode="wait">
          <motion.div
            key={selected?.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-5">
              <h2 className="text-xl font-extrabold tracking-tight text-ink">
                {selected?.section_name}
              </h2>
              {selected?.description && (
                <p className="mt-1 text-sm text-ink-muted">
                  {selected.description}
                </p>
              )}
            </div>

            {selectedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface-sunken/40 px-6 py-12 text-center">
                <FileText className="mb-3 size-6 text-ink-ghost" />
                <p className="text-sm text-ink-muted">
                  No items in this section yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedItems.map((item) => (
                  <ContentItemCard
                    key={item.id}
                    item={item}
                    demo={demo}
                    onChange={updateItem}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
