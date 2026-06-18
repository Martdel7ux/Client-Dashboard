"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Check,
  FolderPlus,
  Type,
  Link2,
  Image as ImageIcon,
  Paperclip,
  type LucideIcon,
} from "lucide-react";
import {
  addSection,
  deleteSection,
  addContentItem,
  deleteContentItem,
  approveContentItem,
  seedProjectContent,
} from "@/app/(admin)/admin/actions";
import { CONTENT_STATUS_META } from "@/lib/stages";
import { isItemComplete } from "@/lib/content";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ContentItem,
  ContentItemType,
  ContentSection,
} from "@/lib/supabase/database.types";

const TYPE_ICON: Record<ContentItemType, LucideIcon> = {
  text: Type,
  url: Link2,
  image: ImageIcon,
  file: Paperclip,
};
const TYPES: ContentItemType[] = ["text", "url", "image", "file"];

export function ContentManager({
  projectId,
  sections,
  items,
}: {
  projectId: string;
  sections: ContentSection[];
  items: ContentItem[];
}) {
  const [sectionName, setSectionName] = useState("");
  const [pending, startTransition] = useTransition();

  function addSec() {
    if (!sectionName.trim()) return;
    const n = sectionName.trim();
    setSectionName("");
    startTransition(async () => {
      const res = await addSection(projectId, n);
      if (!res.ok) toast.error(res.error ?? "Failed");
    });
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">
          Add a content section
        </h2>
        <div className="flex gap-2">
          <Input
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addSec())
            }
            placeholder="e.g. Hero, About, Services…"
          />
          <Button onClick={addSec} disabled={pending || !sectionName.trim()}>
            <FolderPlus /> Add
          </Button>
        </div>
      </Card>

      {sections.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <FolderPlus className="size-6 text-ink-ghost" />
          <p className="max-w-sm text-sm text-ink-muted">
            No sections yet. Add the standard Hero, About, Services, and Contact
            sections in one click, or build your own above.
          </p>
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await seedProjectContent(projectId);
                if (res.ok) toast.success("Starter sections added");
                else toast.error(res.error ?? "Failed");
              })
            }
          >
            <FolderPlus /> Add starter sections
          </Button>
        </Card>
      ) : (
        sections
          .sort((a, b) => a.order_index - b.order_index)
          .map((section) => (
            <SectionBlock
              key={section.id}
              projectId={projectId}
              section={section}
              items={items.filter((i) => i.section_id === section.id)}
            />
          ))
      )}
    </div>
  );
}

function SectionBlock({
  projectId,
  section,
  items,
}: {
  projectId: string;
  section: ContentSection;
  items: ContentItem[];
}) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<ContentItemType>("text");
  const [pending, startTransition] = useTransition();

  function addItem() {
    if (!label.trim()) return;
    const l = label.trim();
    setLabel("");
    startTransition(async () => {
      const res = await addContentItem(projectId, section.id, l, type);
      if (!res.ok) toast.error(res.error ?? "Failed");
    });
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink">{section.section_name}</h3>
        <button
          onClick={() =>
            startTransition(async () => {
              await deleteSection(projectId, section.id);
            })
          }
          className="text-ink-ghost transition-colors hover:text-red-400"
          aria-label="Delete section"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <ul className="mb-3 space-y-2">
        <AnimatePresence initial={false}>
          {items
            .sort((a, b) => a.order_index - b.order_index)
            .map((item) => {
              const Icon = TYPE_ICON[item.type];
              const meta = CONTENT_STATUS_META[item.status];
              const filled = isItemComplete(item);
              return (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 rounded-lg border border-line bg-surface-sunken/50 px-3 py-2.5"
                >
                  <Icon className="size-4 shrink-0 text-ink-faint" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {item.label}
                    </p>
                    {filled && (
                      <p className="truncate text-xs text-ink-faint">
                        {item.type === "text" || item.type === "url"
                          ? item.value
                          : item.file_name ?? "File uploaded"}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      item.status === "approved"
                        ? "success"
                        : item.status === "uploaded"
                          ? "accent"
                          : "outline"
                    }
                  >
                    {meta.label}
                  </Badge>
                  {item.status === "uploaded" && (
                    <button
                      onClick={() =>
                        startTransition(async () => {
                          const r = await approveContentItem(projectId, item.id);
                          if (r.ok) toast.success("Approved");
                        })
                      }
                      className="grid size-7 place-items-center rounded-md border border-line text-ink-faint transition-colors hover:border-status-completed/40 hover:text-status-completed"
                      aria-label="Approve"
                    >
                      <Check className="size-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() =>
                      startTransition(async () => {
                        await deleteContentItem(projectId, item.id);
                      })
                    }
                    className="text-ink-ghost transition-colors hover:text-red-400"
                    aria-label="Delete item"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </motion.li>
              );
            })}
        </AnimatePresence>
      </ul>

      <div className="flex flex-wrap gap-2">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
          placeholder="Item label, e.g. Headline"
          className="min-w-[160px] flex-1"
        />
        <Select value={type} onValueChange={(v) => setType(v as ContentItemType)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t[0].toUpperCase() + t.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="secondary"
          onClick={addItem}
          disabled={pending || !label.trim()}
        >
          <Plus /> Item
        </Button>
      </div>
    </Card>
  );
}
