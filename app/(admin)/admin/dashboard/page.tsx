import { FolderKanban, Eye, Wallet, Receipt } from "lucide-react";
import { requireAdmin } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { firstName, formatEuros } from "@/lib/utils";
import { PageHeading } from "@/components/dashboard/page-heading";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  AdminProjectCard,
  type AdminProjectCardData,
} from "@/components/dashboard/admin-project-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";
import {
  StaggerGroup,
  StaggerItem,
} from "@/components/dashboard/motion-primitives";

export const metadata = { title: "Admin · Tamplo" };

export default async function AdminDashboardPage() {
  const profile = await requireAdmin();
  const supabase = createClient();

  const [{ data: projects }, { data: clients }, { data: changes }] =
    await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name").eq("role", "client"),
      supabase.from("change_requests").select("fee_euros, invoice_status, is_post_launch, status"),
    ]);

  const clientName = new Map(
    (clients ?? []).map((c) => [c.id, c.full_name ?? "Client"]),
  );

  const cards: AdminProjectCardData[] = (projects ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    clientName: clientName.get(p.client_id) ?? "Client",
    stage: p.stage,
    status: p.status,
    progress: p.progress_percent,
    estimatedEndDate: p.estimated_end_date,
  }));

  const activeCount = (projects ?? []).filter((p) => p.status !== "live").length;
  const reviewCount = (projects ?? []).filter((p) => p.status === "review").length;
  const revenue = (changes ?? [])
    .filter((c) => c.invoice_status === "paid")
    .reduce((sum, c) => sum + (c.fee_euros ?? 0), 0);
  const pendingInvoices = (changes ?? []).filter(
    (c) => c.is_post_launch && c.invoice_status === "unpaid" && c.status !== "rejected",
  ).length;
  const pendingValue = (changes ?? [])
    .filter((c) => c.is_post_launch && c.invoice_status === "unpaid" && c.status !== "rejected")
    .reduce((sum, c) => sum + (c.fee_euros ?? 0), 0);

  return (
    <div>
      <PageHeading
        title={`Good afternoon, ${firstName(profile.full_name)}`}
        description="Your studio at a glance: projects, clients, and invoices."
      />

      <StaggerGroup className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StaggerItem>
          <StatCard
            label="Active Projects"
            value={activeCount}
            icon={<FolderKanban className="size-[18px]" />}
            sub="In flight right now"
            tone="accent"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="In Review"
            value={reviewCount}
            icon={<Eye className="size-[18px]" />}
            sub="Awaiting your approval"
            tone="review"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Change Revenue"
            value={revenue}
            prefix="€"
            icon={<Wallet className="size-[18px]" />}
            sub="Paid change requests"
            tone="completed"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Pending Invoices"
            value={pendingInvoices}
            icon={<Receipt className="size-[18px]" />}
            sub={`${formatEuros(pendingValue)} unpaid`}
            tone="live"
          />
        </StaggerItem>
      </StaggerGroup>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">All Projects</h2>
          <span className="text-xs text-ink-faint">
            {cards.length} total
          </span>
        </div>

        {cards.length > 0 ? (
          <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((p) => (
              <StaggerItem key={p.id}>
                <AdminProjectCard project={p} href={`/admin/projects/${p.id}`} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        ) : (
          <Card>
            <EmptyState
              icon={<FolderKanban className="size-6" />}
              satellites={[<Receipt key="r" className="size-3.5" />]}
              title="No projects yet"
              description="Create your first client from the Clients tab to spin up a project."
            />
          </Card>
        )}
      </div>
    </div>
  );
}
