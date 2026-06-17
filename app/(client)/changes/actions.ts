"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SubmitState = { ok: boolean; error: string | null };

const POST_LAUNCH_FEE = 45;

/**
 * Client submits a change request. Whether it's post-launch (and therefore
 * chargeable) is derived from the project stage server-side — never trusted
 * from the form.
 */
export async function submitChangeRequest(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const fileUrl = String(formData.get("file_url") ?? "").trim() || null;

  if (!title) return { ok: false, error: "Give your request a title." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You need to be signed in." };

  const { data: project } = await supabase
    .from("projects")
    .select("id, stage")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!project) return { ok: false, error: "No project found." };

  const isPostLaunch = project.stage === "launched";

  const { error } = await supabase.from("change_requests").insert({
    project_id: project.id,
    client_id: user.id,
    title,
    description: description || null,
    status: "submitted",
    is_post_launch: isPostLaunch,
    fee_euros: isPostLaunch ? POST_LAUNCH_FEE : 0,
    invoice_status: "unpaid",
    file_url: fileUrl,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/changes");
  return { ok: true, error: null };
}
