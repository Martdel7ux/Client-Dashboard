"use client";

import { useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, Info } from "lucide-react";
import { formatEuros } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileDropzone } from "@/components/content/file-dropzone";
import { submitChangeRequest } from "@/app/(client)/changes/actions";
import type { ChangeRequest } from "@/lib/supabase/database.types";

const POST_LAUNCH_FEE = 45;

export function ChangeRequestForm({
  projectId,
  isPostLaunch,
  demo = false,
  onDemoSubmit,
}: {
  projectId: string;
  isPostLaunch: boolean;
  demo?: boolean;
  onDemoSubmit?: (request: ChangeRequest) => void;
}) {
  const tempId = useRef(`cr-${Date.now()}`).current;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setTitle("");
    setDescription("");
    setFileUrl(null);
    setFileName(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Give your request a title.");
      return;
    }

    if (demo) {
      onDemoSubmit?.({
        id: `demo-${Date.now()}`,
        project_id: projectId,
        client_id: "demo",
        title: title.trim(),
        description: description.trim() || null,
        status: "submitted",
        is_post_launch: isPostLaunch,
        fee_euros: isPostLaunch ? POST_LAUNCH_FEE : 0,
        invoice_status: "unpaid",
        stripe_payment_intent_id: null,
        stripe_payment_link: null,
        file_url: fileUrl,
        created_at: new Date().toISOString(),
      });
      reset();
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.set("title", title.trim());
      fd.set("description", description.trim());
      if (fileUrl) fd.set("file_url", fileUrl);
      const res = await submitChangeRequest({ ok: false, error: null }, fd);
      if (res.ok) reset();
      else setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isPostLaunch && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-lg border border-status-review/25 bg-status-review/10 p-3.5"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-status-review" />
          <p className="text-sm text-ink">
            Each change request costs{" "}
            <span className="font-semibold">{formatEuros(POST_LAUNCH_FEE)}</span>
            . You will be invoiced after we confirm the change.
          </p>
        </motion.div>
      )}

      <div className="space-y-2">
        <Label htmlFor="cr-title">Title</Label>
        <Input
          id="cr-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Update the homepage headline"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cr-desc">Description</Label>
        <textarea
          id="cr-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Describe what you'd like changed, and why."
          className="flex w-full rounded-md border border-line bg-surface-sunken px-3.5 py-2.5 text-sm text-ink shadow-inset placeholder:text-ink-ghost focus-visible:border-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        />
      </div>

      <div className="space-y-2">
        <Label>Attachment (optional)</Label>
        <FileDropzone
          itemId={tempId}
          projectId={projectId}
          kind="file"
          fileUrl={fileUrl}
          fileName={fileName}
          demo={demo}
          onUploaded={(url, name) => {
            setFileUrl(url);
            setFileName(name);
          }}
          onCleared={() => {
            setFileUrl(null);
            setFileName(null);
          }}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="animate-spin" /> Submitting
          </>
        ) : (
          <>
            <Plus /> Submit request
          </>
        )}
      </Button>
    </form>
  );
}
