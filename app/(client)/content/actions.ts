"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Result = { ok: boolean; error?: string };

/** Save a text/url value. Status flips to uploaded when filled, pending when cleared. */
export async function saveItemText(
  itemId: string,
  value: string,
): Promise<Result> {
  const supabase = createClient();
  const trimmed = value.trim();
  const { error } = await supabase
    .from("content_items")
    .update({ value: trimmed, status: trimmed ? "uploaded" : "pending" })
    .eq("id", itemId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/content");
  return { ok: true };
}

export async function saveItemNotes(
  itemId: string,
  notes: string,
): Promise<Result> {
  const supabase = createClient();
  const { error } = await supabase
    .from("content_items")
    .update({ notes: notes.trim() || null })
    .eq("id", itemId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/content");
  return { ok: true };
}

/** Persist an uploaded file's public URL + name (the upload itself happens client-side). */
export async function saveItemFile(
  itemId: string,
  fileUrl: string,
  fileName: string,
): Promise<Result> {
  const supabase = createClient();
  const { error } = await supabase
    .from("content_items")
    .update({ file_url: fileUrl, file_name: fileName, status: "uploaded" })
    .eq("id", itemId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/content");
  return { ok: true };
}

/** Reset a file item back to empty/pending. */
export async function clearItemFile(itemId: string): Promise<Result> {
  const supabase = createClient();
  const { error } = await supabase
    .from("content_items")
    .update({ file_url: null, file_name: null, status: "pending" })
    .eq("id", itemId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/content");
  return { ok: true };
}
