"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Check, Trash2, Flag } from "lucide-react";
import {
  addMilestone,
  toggleMilestone,
  deleteMilestone,
} from "@/app/(admin)/admin/actions";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Milestone } from "@/lib/supabase/database.types";

export function MilestonesManager({
  projectId,
  milestones,
}: {
  projectId: string;
  milestones: Milestone[];
}) {
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();

  const sorted = [...milestones].sort((a, b) => a.order_index - b.order_index);
  const done = sorted.filter((m) => m.completed).length;

  function add() {
    if (!title.trim()) return;
    const t = title.trim();
    setTitle("");
    startTransition(async () => {
      const res = await addMilestone(projectId, t);
      if (!res.ok) toast.error(res.error ?? "Failed to add");
    });
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Milestones</h2>
        <span className="text-xs text-ink-faint">
          {done}/{sorted.length} complete
        </span>
      </div>

      <div className="mb-4 flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="Add a milestone…"
        />
        <Button onClick={add} disabled={pending || !title.trim()}>
          <Plus /> Add
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line py-8 text-center">
          <Flag className="size-5 text-ink-ghost" />
          <p className="text-sm text-ink-muted">No milestones yet.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {sorted.map((m) => (
              <motion.li
                key={m.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 rounded-lg border border-line bg-surface-sunken/50 px-3 py-2.5"
              >
                <button
                  onClick={() =>
                    startTransition(async () => {
                      await toggleMilestone(projectId, m.id, !m.completed);
                    })
                  }
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                    m.completed
                      ? "border-accent bg-accent text-white"
                      : "border-line text-transparent hover:border-accent",
                  )}
                  aria-label="Toggle complete"
                >
                  <Check className="size-3" strokeWidth={3} />
                </button>
                <span
                  className={cn(
                    "flex-1 text-sm",
                    m.completed ? "text-ink-faint line-through" : "text-ink",
                  )}
                >
                  {m.title}
                </span>
                <button
                  onClick={() =>
                    startTransition(async () => {
                      await deleteMilestone(projectId, m.id);
                    })
                  }
                  className="text-ink-ghost transition-colors hover:text-red-400"
                  aria-label="Delete milestone"
                >
                  <Trash2 className="size-4" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Card>
  );
}
