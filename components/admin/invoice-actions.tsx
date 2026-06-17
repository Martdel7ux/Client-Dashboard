"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Send, Check, ExternalLink, Loader2 } from "lucide-react";
import { sendInvoice, markInvoicePaid } from "@/app/(admin)/admin/actions";
import { Button } from "@/components/ui/button";

export function InvoiceActions({
  id,
  paid,
  paymentLink,
}: {
  id: string;
  paid: boolean;
  paymentLink: string | null;
}) {
  const [pending, startTransition] = useTransition();

  if (paid) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-status-completed">
        <Check className="size-4" /> Paid
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {paymentLink && (
        <a
          href={paymentLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
        >
          <ExternalLink className="size-3.5" /> Link
        </a>
      )}
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await sendInvoice(id);
            if (res.ok)
              toast.success(
                res.url ? "Invoice sent" : "Sent (Stripe not configured)",
              );
            else toast.error(res.error ?? "Failed");
          })
        }
      >
        {pending ? <Loader2 className="animate-spin" /> : <Send />}
        Send invoice
      </Button>
      <Button
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await markInvoicePaid(id);
            if (res.ok) toast.success("Marked paid");
            else toast.error(res.error ?? "Failed");
          })
        }
      >
        <Check /> Mark paid
      </Button>
    </div>
  );
}
