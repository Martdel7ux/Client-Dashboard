"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/queries";
import { generatePassword, formatEuros } from "@/lib/utils";
import { STAGE_META } from "@/lib/stages";
import { sendEmail } from "@/lib/email/resend";
import {
  welcomeEmail,
  stageAdvancedEmail,
  projectLiveEmail,
  invoiceEmail,
} from "@/lib/email/templates";
import { createChangeRequestPaymentLink } from "@/lib/stripe/stripe";
import { seedDefaultContent } from "@/lib/default-content";
import type {
  ProjectStage,
  ProjectStatus,
  ProjectType,
  ContentItemType,
  ChangeRequestStatus,
} from "@/lib/supabase/database.types";

type Res = { ok: boolean; error?: string };

function bump(projectId?: string) {
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/clients");
  revalidatePath("/admin/invoices");
  if (projectId) revalidatePath(`/admin/projects/${projectId}`);
}

// ───────────────────────── Create client ────────────────────────────────────
export type CreateClientState = {
  ok: boolean;
  error: string | null;
  password?: string;
  emailSent?: boolean;
};

export async function createClientAction(
  _prev: CreateClientState,
  formData: FormData,
): Promise<CreateClientState> {
  await requireAdmin();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const projectTitle = String(formData.get("project_title") ?? "").trim();
  const projectType = (String(formData.get("project_type") ?? "webdesign") ||
    "webdesign") as ProjectType;

  if (!fullName || !email || !projectTitle) {
    return { ok: false, error: "Name, email, and project title are required." };
  }

  const admin = createAdminClient();
  const password = generatePassword();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "client" },
  });

  if (createErr || !created.user) {
    return { ok: false, error: createErr?.message ?? "Could not create user." };
  }

  const userId = created.user.id;

  // Ensure the profile carries name + role (the trigger may also handle this).
  await admin.from("profiles").upsert(
    { id: userId, email, full_name: fullName, role: "client" },
    { onConflict: "id" },
  );

  const { data: project, error: projErr } = await admin
    .from("projects")
    .insert({
      client_id: userId,
      title: projectTitle,
      type: projectType,
      status: "onboarding",
      stage: "discovery",
      progress_percent: 0,
      start_date: new Date().toISOString().slice(0, 10),
    })
    .select("id")
    .single();

  if (projErr || !project) {
    return { ok: false, error: `User made, but project failed: ${projErr?.message}` };
  }

  // Give the client a starter content checklist to fill in right away.
  await seedDefaultContent(admin, project.id);

  const mail = welcomeEmail({ name: fullName, email, password, projectTitle });
  const sent = await sendEmail({ to: email, ...mail });

  bump();
  return {
    ok: true,
    error: null,
    password,
    emailSent: sent.sent,
  };
}

// ───────────────────────── Project mutations ────────────────────────────────
export async function setProjectStage(
  projectId: string,
  stage: ProjectStage,
): Promise<Res> {
  await requireAdmin();
  const supabase = createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("title, client_id")
    .eq("id", projectId)
    .single();

  const { error } = await supabase
    .from("projects")
    .update({ stage })
    .eq("id", projectId);
  if (error) return { ok: false, error: error.message };

  if (project) {
    const { data: client } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", project.client_id)
      .single();

    if (client?.email) {
      const mail = stageAdvancedEmail({
        name: client.full_name ?? "there",
        projectTitle: project.title,
        stage,
      });
      await sendEmail({ to: client.email, ...mail });
    }
    await supabase.from("notifications").insert({
      user_id: project.client_id,
      project_id: projectId,
      type: "stage_advanced",
      message: `Your project moved to the ${STAGE_META[stage].label} stage.`,
    });
  }

  bump(projectId);
  return { ok: true };
}

export async function setProjectStatus(
  projectId: string,
  status: ProjectStatus,
): Promise<Res> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);
  if (error) return { ok: false, error: error.message };
  bump(projectId);
  return { ok: true };
}

export async function setProjectProgress(
  projectId: string,
  percent: number,
): Promise<Res> {
  await requireAdmin();
  const supabase = createClient();
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const { error } = await supabase
    .from("projects")
    .update({ progress_percent: clamped })
    .eq("id", projectId);
  if (error) return { ok: false, error: error.message };
  bump(projectId);
  return { ok: true };
}

export async function setProjectEndDate(
  projectId: string,
  date: string | null,
): Promise<Res> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("projects")
    .update({ estimated_end_date: date || null })
    .eq("id", projectId);
  if (error) return { ok: false, error: error.message };
  bump(projectId);
  return { ok: true };
}

export async function markProjectLive(projectId: string): Promise<Res> {
  await requireAdmin();
  const supabase = createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("title, client_id")
    .eq("id", projectId)
    .single();

  const { error } = await supabase
    .from("projects")
    .update({
      stage: "launched",
      status: "live",
      progress_percent: 100,
      launched_at: new Date().toISOString(),
    })
    .eq("id", projectId);
  if (error) return { ok: false, error: error.message };

  if (project) {
    const { data: client } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", project.client_id)
      .single();
    if (client?.email) {
      const mail = projectLiveEmail({
        name: client.full_name ?? "there",
        projectTitle: project.title,
      });
      await sendEmail({ to: client.email, ...mail });
    }
    await supabase.from("notifications").insert({
      user_id: project.client_id,
      project_id: projectId,
      type: "project_live",
      message: `${project.title} is now live!`,
    });
  }

  bump(projectId);
  return { ok: true };
}

// ───────────────────────── Milestones ───────────────────────────────────────
export async function addMilestone(
  projectId: string,
  title: string,
  description?: string,
): Promise<Res> {
  await requireAdmin();
  if (!title.trim()) return { ok: false, error: "Title required." };
  const supabase = createClient();
  const { count } = await supabase
    .from("milestones")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);
  const { error } = await supabase.from("milestones").insert({
    project_id: projectId,
    title: title.trim(),
    description: description?.trim() || null,
    order_index: count ?? 0,
  });
  if (error) return { ok: false, error: error.message };
  bump(projectId);
  return { ok: true };
}

export async function toggleMilestone(
  projectId: string,
  id: string,
  completed: boolean,
): Promise<Res> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("milestones")
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  bump(projectId);
  return { ok: true };
}

export async function deleteMilestone(
  projectId: string,
  id: string,
): Promise<Res> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase.from("milestones").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  bump(projectId);
  return { ok: true };
}

// ───────────────────────── Content sections + items ─────────────────────────
export async function addSection(
  projectId: string,
  name: string,
  description?: string,
): Promise<Res> {
  await requireAdmin();
  if (!name.trim()) return { ok: false, error: "Section name required." };
  const supabase = createClient();
  const { count } = await supabase
    .from("content_sections")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);
  const { error } = await supabase.from("content_sections").insert({
    project_id: projectId,
    section_name: name.trim(),
    description: description?.trim() || null,
    order_index: count ?? 0,
  });
  if (error) return { ok: false, error: error.message };
  bump(projectId);
  return { ok: true };
}

/** Adds the default Hero/About/Services/Contact starter sections to a project. */
export async function seedProjectContent(projectId: string): Promise<Res> {
  await requireAdmin();
  const supabase = createClient();
  try {
    await seedDefaultContent(supabase, projectId);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Seed failed" };
  }
  bump(projectId);
  return { ok: true };
}

export async function deleteSection(
  projectId: string,
  id: string,
): Promise<Res> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase.from("content_sections").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  bump(projectId);
  return { ok: true };
}

export async function addContentItem(
  projectId: string,
  sectionId: string,
  label: string,
  type: ContentItemType,
  description?: string,
): Promise<Res> {
  await requireAdmin();
  if (!label.trim()) return { ok: false, error: "Label required." };
  const supabase = createClient();
  const { count } = await supabase
    .from("content_items")
    .select("id", { count: "exact", head: true })
    .eq("section_id", sectionId);
  const { error } = await supabase.from("content_items").insert({
    project_id: projectId,
    section_id: sectionId,
    label: label.trim(),
    type,
    description: description?.trim() || null,
    status: "pending",
    order_index: count ?? 0,
  });
  if (error) return { ok: false, error: error.message };
  bump(projectId);
  return { ok: true };
}

export async function deleteContentItem(
  projectId: string,
  id: string,
): Promise<Res> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase.from("content_items").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  bump(projectId);
  return { ok: true };
}

export async function approveContentItem(
  projectId: string,
  id: string,
): Promise<Res> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("content_items")
    .update({ status: "approved" })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  bump(projectId);
  return { ok: true };
}

// ───────────────────────── Change requests ──────────────────────────────────
export async function setChangeRequestStatus(
  projectId: string,
  id: string,
  status: ChangeRequestStatus,
): Promise<Res> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("change_requests")
    .update({ status })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  bump(projectId);
  return { ok: true };
}

// ───────────────────────── Invoices ─────────────────────────────────────────
export async function sendInvoice(
  changeRequestId: string,
): Promise<Res & { url?: string | null }> {
  await requireAdmin();
  const supabase = createClient();

  const { data: cr } = await supabase
    .from("change_requests")
    .select("id, title, fee_euros, project_id, client_id, stripe_payment_link")
    .eq("id", changeRequestId)
    .single();
  if (!cr) return { ok: false, error: "Change request not found." };

  let url = cr.stripe_payment_link;
  if (!url) {
    const link = await createChangeRequestPaymentLink({
      title: cr.title,
      amountEuros: cr.fee_euros,
    });
    url = link.url;
    if (url) {
      await supabase
        .from("change_requests")
        .update({ stripe_payment_link: url })
        .eq("id", changeRequestId);
    }
  }

  const { data: client } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", cr.client_id)
    .single();

  if (client?.email && url) {
    const mail = invoiceEmail({
      name: client.full_name ?? "there",
      title: cr.title,
      amountLabel: formatEuros(cr.fee_euros),
      payUrl: url,
    });
    await sendEmail({ to: client.email, ...mail });
  }

  await supabase.from("notifications").insert({
    user_id: cr.client_id,
    project_id: cr.project_id,
    type: "invoice",
    message: `Invoice sent for "${cr.title}" — ${formatEuros(cr.fee_euros)}.`,
  });

  bump(cr.project_id);
  return { ok: true, url };
}

export async function markInvoicePaid(changeRequestId: string): Promise<Res> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("change_requests")
    .update({ invoice_status: "paid" })
    .eq("id", changeRequestId);
  if (error) return { ok: false, error: error.message };
  bump();
  return { ok: true };
}
