"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Check, Paperclip, XCircle } from "lucide-react";
import { cn, formatEuros } from "@/lib/utils";
import { CHANGE_STATUS_FLOW, CHANGE_STATUS_LABEL } from "@/lib/stages";
import { Badge } from "@/components/ui/badge";
import type { ChangeRequest } from "@/lib/supabase/database.types";

export function ChangeRequestCard({ request }: { request: ChangeRequest }) {
  const rejected = request.status === "rejected";
  const currentIndex = CHANGE_STATUS_FLOW.indexOf(request.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-line bg-surface p-5 shadow-inset"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink">{request.title}</h3>
          {request.description && (
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              {request.description}
            </p>
          )}
        </div>
        {request.is_post_launch && (
          <Badge variant={request.invoice_status === "paid" ? "success" : "warning"}>
            {formatEuros(request.fee_euros)} ·{" "}
            {request.invoice_status === "paid" ? "Paid" : "Unpaid"}
          </Badge>
        )}
      </div>

      {request.file_url && (
        <a
          href={request.file_url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
        >
          <Paperclip className="size-3.5" /> Attachment
        </a>
      )}

      {/* Status */}
      <div className="mt-5 border-t border-line pt-4">
        {rejected ? (
          <div className="flex items-center gap-2 text-sm font-medium text-red-400">
            <XCircle className="size-4" /> Rejected
          </div>
        ) : (
          <div className="flex items-center">
            {CHANGE_STATUS_FLOW.map((step, i) => {
              const done = i < currentIndex;
              const active = i === currentIndex;
              return (
                <div key={step} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={cn(
                        "grid size-5 place-items-center rounded-full border-2 transition-colors",
                        done && "border-accent bg-accent text-white",
                        active && "border-accent bg-surface text-accent",
                        !done && !active && "border-line bg-surface text-ink-ghost",
                      )}
                    >
                      {done ? (
                        <Check className="size-3" strokeWidth={3} />
                      ) : (
                        <span className="size-1.5 rounded-full bg-current" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "whitespace-nowrap text-[10px] font-medium",
                        done || active ? "text-ink-muted" : "text-ink-ghost",
                      )}
                    >
                      {CHANGE_STATUS_LABEL[step]}
                    </span>
                  </div>
                  {i < CHANGE_STATUS_FLOW.length - 1 && (
                    <div
                      className={cn(
                        "mx-1 h-[2px] flex-1 rounded-full",
                        i < currentIndex ? "bg-accent" : "bg-line",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-ink-faint">
        Submitted {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
      </p>
    </motion.div>
  );
}
