import Link from "next/link";
import { Receipt, Wallet } from "lucide-react";
import { requireAdmin } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { formatEuros } from "@/lib/utils";
import { PageHeading } from "@/components/dashboard/page-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InvoiceActions } from "@/components/admin/invoice-actions";

export const metadata = { title: "Invoices · Tamplo" };

export default async function AdminInvoicesPage() {
  await requireAdmin();
  const supabase = createClient();

  const { data: invoices } = await supabase
    .from("change_requests")
    .select("*")
    .eq("is_post_launch", true)
    .order("created_at", { ascending: false });

  const clientIds = Array.from(
    new Set((invoices ?? []).map((i) => i.client_id)),
  );
  const projectIds = Array.from(
    new Set((invoices ?? []).map((i) => i.project_id)),
  );
  const [{ data: clients }, { data: projects }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", clientIds),
    supabase.from("projects").select("id, title").in("id", projectIds),
  ]);
  const clientName = new Map((clients ?? []).map((c) => [c.id, c.full_name]));
  const projectName = new Map((projects ?? []).map((p) => [p.id, p.title]));

  const total = (invoices ?? [])
    .filter((i) => i.invoice_status === "paid")
    .reduce((s, i) => s + i.fee_euros, 0);
  const outstanding = (invoices ?? [])
    .filter((i) => i.invoice_status === "unpaid" && i.status !== "rejected")
    .reduce((s, i) => s + i.fee_euros, 0);

  return (
    <div>
      <PageHeading
        title="Invoices"
        description="Post-launch change requests billed at €45. Send a payment link or mark paid."
      />

      {invoices && invoices.length > 0 ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:max-w-md">
            <Card className="p-4">
              <p className="text-xs uppercase tracking-wider text-ink-faint">
                Collected
              </p>
              <p className="mt-1 text-2xl font-extrabold text-status-completed">
                {formatEuros(total)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs uppercase tracking-wider text-ink-faint">
                Outstanding
              </p>
              <p className="mt-1 text-2xl font-extrabold text-status-review">
                {formatEuros(outstanding)}
              </p>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-faint">
                    <th className="px-5 py-3 font-medium">Request</th>
                    <th className="px-5 py-3 font-medium">Client</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-line/60 last:border-0 hover:bg-surface-raised/50"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/projects/${inv.project_id}`}
                          className="font-medium text-ink hover:text-accent"
                        >
                          {inv.title}
                        </Link>
                        <p className="text-xs text-ink-faint">
                          {projectName.get(inv.project_id)}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-ink-muted">
                        {clientName.get(inv.client_id) ?? "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={
                            inv.invoice_status === "paid" ? "success" : "warning"
                          }
                        >
                          {formatEuros(inv.fee_euros)}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <InvoiceActions
                          id={inv.id}
                          paid={inv.invoice_status === "paid"}
                          paymentLink={inv.stripe_payment_link}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <EmptyState
            icon={<Receipt className="size-6" />}
            satellites={[<Wallet key="w" className="size-3.5" />]}
            title="No invoices yet"
            description="When a client submits a post-launch change request, its €45 invoice appears here."
          />
        </Card>
      )}
    </div>
  );
}
