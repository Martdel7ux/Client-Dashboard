"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { UserPlus, Loader2, Check, Copy, MailCheck, MailX } from "lucide-react";
import {
  createClientAction,
  type CreateClientState,
} from "@/app/(admin)/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPES = [
  { value: "webdesign", label: "Web Design" },
  { value: "branding", label: "Branding" },
  { value: "webapp", label: "Web App" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "other", label: "Other" },
];

const initial: CreateClientState = { ok: false, error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Creating account
        </>
      ) : (
        <>
          <UserPlus /> Create client
        </>
      )}
    </Button>
  );
}

export function CreateClientDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("webdesign");
  const [state, formAction] = useFormState(createClientAction, initial);
  const [copied, setCopied] = useState(false);

  // Keep the dialog open on success so the password can be copied.
  useEffect(() => {
    if (state.ok) setCopied(false);
  }, [state.ok]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus /> Create Client
        </Button>
      </DialogTrigger>
      <DialogContent>
        {state.ok ? (
          <div>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-full bg-status-completed/15 text-status-completed">
                  <Check className="size-4" strokeWidth={3} />
                </span>
                Client created
              </DialogTitle>
              <DialogDescription>
                Share these credentials if the email doesn&apos;t arrive.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border border-line bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
                Temporary password
              </p>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <code className="text-sm text-ink">{state.password}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(state.password ?? "");
                    setCopied(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-xs text-ink-muted hover:text-ink"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs">
              {state.emailSent ? (
                <span className="inline-flex items-center gap-1.5 text-status-completed">
                  <MailCheck className="size-3.5" /> Welcome email sent
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-status-review">
                  <MailX className="size-3.5" /> Email not sent (Resend not
                  configured) — share the password manually
                </span>
              )}
            </div>

            <Button
              className="mt-5 w-full"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <form action={formAction}>
            <DialogHeader>
              <DialogTitle>Create a client</DialogTitle>
              <DialogDescription>
                We&apos;ll generate a secure password, create their account and
                project, and email them the login details.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" name="full_name" placeholder="Jane Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="jane@company.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_title">Project title</Label>
                <Input id="project_title" name="project_title" placeholder="Company Website" required />
              </div>
              <div className="space-y-2">
                <Label>Project type</Label>
                <input type="hidden" name="project_type" value={type} />
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {state.error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-red-400"
                >
                  {state.error}
                </motion.p>
              )}

              <SubmitButton />
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
