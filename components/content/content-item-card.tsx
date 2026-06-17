"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Type,
  Link2,
  Image as ImageIcon,
  Paperclip,
  Loader2,
  Check,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTENT_STATUS_META } from "@/lib/stages";
import { isItemComplete } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileDropzone } from "./file-dropzone";
import {
  saveItemText,
  saveItemNotes,
  saveItemFile,
  clearItemFile,
} from "@/app/(client)/content/actions";
import type {
  ContentItem,
  ContentItemType,
} from "@/lib/supabase/database.types";

const TYPE_ICON: Record<ContentItemType, LucideIcon> = {
  text: Type,
  url: Link2,
  image: ImageIcon,
  file: Paperclip,
};

export function ContentItemCard({
  item,
  demo = false,
  onChange,
}: {
  item: ContentItem;
  demo?: boolean;
  onChange: (updated: ContentItem) => void;
}) {
  const TypeIcon = TYPE_ICON[item.type];
  const complete = isItemComplete(item);
  const badge = CONTENT_STATUS_META[item.status];

  const [value, setValue] = useState(item.value ?? "");
  const [notes, setNotes] = useState(item.notes ?? "");
  const [showNotes, setShowNotes] = useState(Boolean(item.notes));
  const [pending, startTransition] = useTransition();

  const isTextual = item.type === "text" || item.type === "url";
  const valueDirty = value.trim() !== (item.value ?? "").trim();
  const notesDirty = notes.trim() !== (item.notes ?? "").trim();

  function saveValue() {
    const trimmed = value.trim();
    startTransition(async () => {
      if (!demo) await saveItemText(item.id, trimmed);
      onChange({
        ...item,
        value: trimmed,
        status: trimmed ? "uploaded" : "pending",
      });
    });
  }

  function saveNote() {
    const trimmed = notes.trim();
    startTransition(async () => {
      if (!demo) await saveItemNotes(item.id, trimmed);
      onChange({ ...item, notes: trimmed || null });
    });
  }

  function onUploaded(fileUrl: string, fileName: string) {
    startTransition(async () => {
      if (!demo) await saveItemFile(item.id, fileUrl, fileName);
      onChange({ ...item, file_url: fileUrl, file_name: fileName, status: "uploaded" });
    });
  }

  function onCleared() {
    startTransition(async () => {
      if (!demo) await clearItemFile(item.id);
      onChange({ ...item, file_url: null, file_name: null, status: "pending" });
    });
  }

  return (
    <motion.div
      layout
      className="rounded-lg border border-line bg-surface p-4 shadow-inset"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border",
              complete
                ? "border-status-completed/30 bg-status-completed/10 text-status-completed"
                : "border-line bg-surface-raised text-ink-faint",
            )}
          >
            {complete ? (
              <Check className="size-4" strokeWidth={3} />
            ) : (
              <TypeIcon className="size-4" />
            )}
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{item.label}</p>
            {item.description && (
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                {item.description}
              </p>
            )}
          </div>
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
          {badge.label}
        </Badge>
      </div>

      <div className="mt-3.5 pl-11">
        {isTextual ? (
          <div className="flex items-start gap-2">
            {item.type === "url" ? (
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="https://…"
                type="url"
              />
            ) : (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Type your content here…"
                rows={3}
                className="flex w-full rounded-md border border-line bg-surface-sunken px-3.5 py-2.5 text-sm text-ink shadow-inset placeholder:text-ink-ghost focus-visible:border-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              />
            )}
            {valueDirty && (
              <Button size="sm" onClick={saveValue} disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : "Save"}
              </Button>
            )}
          </div>
        ) : (
          <FileDropzone
            itemId={item.id}
            projectId={item.project_id}
            kind={item.type === "image" ? "image" : "file"}
            fileUrl={item.file_url}
            fileName={item.file_name}
            demo={demo}
            onUploaded={onUploaded}
            onCleared={onCleared}
          />
        )}

        {/* Notes */}
        <div className="mt-3">
          {showNotes ? (
            <div className="flex items-start gap-2">
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note for us…"
                className="h-9 text-xs"
              />
              {notesDirty && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={saveNote}
                  disabled={pending}
                >
                  {pending ? <Loader2 className="animate-spin" /> : "Save"}
                </Button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowNotes(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint transition-colors hover:text-ink-muted"
            >
              <StickyNote className="size-3.5" /> Add a note
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
