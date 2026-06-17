"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Check, X, Play, Paperclip, GitPullRequestArrow } from "lucide-react";
import { setChangeRequestStatus } from "@/app/(admin)/admin/actions";
import { formatEuros } from "@/lib/utils";
import { CHANGE_STATUS_LABEL } from "@/lib/stages";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ChangeRequest } from "@/lib/supabase/database.types";

export function ChangeRequestsAdmin({
  projectId,
  requests,
}: {
  projectId: string;
  requests: ChangeRequest[];
}) {
  const [pending, startTransition] = useTransition();

  function update(id: string, status: ChangeRequest["status"], msg: string) {
    startTransition(async () => {
      const res = await setChangeRequestStatus(projectId, id, status);
      if (res.ok) toast.success(msg);
      else toast.error(res.error ?? "Failed");
    });
  }

  if (requests.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 py-10 text-center">
        <GitPullRequestArrow className="size-6 text-ink-ghost" />
        <p className="text-sm text-ink-muted">No change requests yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((r) => {
        const closed = r.status === "completed" || r.status === "rejected";
        return (
          <Card key={r.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-ink">{r.title}</h3>
                  <Badge
                    variant={
                      r.status === "completed"
                        ? "success"
                        : r.status === "rejected"
                          ? "outline"
                          : "accent"
                    }
                  >
                    {CHANGE_STATUS_LABEL[r.status]}
                  </Badge>
                  {r.is_post_launch && (
                    <Badge variant="warning">
                      {formatEuros(r.fee_euros)} ·{" "}
                      {r.invoice_status === "paid" ? "Paid" : "Unpaid"}
                    </Badge>
                  )}
                </div>
                {r.description && (
                  <p className="mt-1.5 text-sm text-ink-muted">{r.description}</p>
                )}
                {r.file_url && (
                  <a
                    href={r.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
                  >
                    <Paperclip className="size-3.5" /> Attachment
                  </a>
                )}
                <p className="mt-2 text-xs text-ink-faint">
                  {formatDistanceToNow(new Date(r.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            {!closed && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                {r.status === "submitted" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={pending}
                    onClick={() => update(r.id, "reviewing", "Moved to review")}
                  >
                    <Play /> Start review
                  </Button>
                )}
                {(r.status === "submitted" || r.status === "reviewing") && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={pending}
                    onClick={() =>
                      update(r.id, "in_progress", "Marked in progress")
                    }
                  >
                    <Play /> Accept &amp; start
                  </Button>
                )}
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() => update(r.id, "completed", "Marked complete")}
                >
                  <Check /> Complete
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => update(r.id, "rejected", "Request rejected")}
                  className="text-red-400 hover:text-red-300"
                >
                  <X /> Reject
                </Button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
