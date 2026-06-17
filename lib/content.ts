import type { ContentItem } from "@/lib/supabase/database.types";

/** An item counts as "done" once it has content (text/url filled or a file). */
export function isItemComplete(
  item: Pick<ContentItem, "type" | "value" | "file_url" | "status">,
): boolean {
  if (item.status === "approved") return true;
  if (item.type === "text" || item.type === "url") {
    return Boolean(item.value && item.value.trim().length > 0);
  }
  return Boolean(item.file_url);
}

export interface Progress {
  done: number;
  total: number;
  pct: number;
}

export function progressFor(items: ContentItem[]): Progress {
  const total = items.length;
  const done = items.filter(isItemComplete).length;
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}

/** Groups items by their section id for quick per-section lookups. */
export function itemsBySection(
  items: ContentItem[],
): Record<string, ContentItem[]> {
  return items.reduce<Record<string, ContentItem[]>>((acc, item) => {
    (acc[item.section_id] ??= []).push(item);
    return acc;
  }, {});
}
