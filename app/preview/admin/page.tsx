import { FolderKanban, Eye, Wallet, Receipt } from "lucide-react";
import { PageHeading } from "@/components/dashboard/page-heading";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  AdminProjectCard,
  type AdminProjectCardData,
} from "@/components/dashboard/admin-project-card";
import {
  StaggerGroup,
  StaggerItem,
} from "@/components/dashboard/motion-primitives";

export const metadata = { title: "Admin Preview — Atelier" };

const days = (n: number) =>
  new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

const PROJECTS: AdminProjectCardData[] = [
  {
    id: "1",
    title: "Acme Studio Website",
    clientName: "Martina Hoto",
    stage: "design",
    status: "in_progress",
    progress: 72,
    estimatedEndDate: days(21),
  },
  {
    id: "2",
    title: "Lumen Brand Identity",
    clientName: "Daniel Reyes",
    stage: "review",
    status: "review",
    progress: 91,
    estimatedEndDate: days(6),
  },
  {
    id: "3",
    title: "Northwind E-commerce",
    clientName: "Sofia Almeida",
    stage: "development",
    status: "in_progress",
    progress: 54,
    estimatedEndDate: days(34),
  },
  {
    id: "4",
    title: "Atlas Portfolio",
    clientName: "Marco Bianchi",
    stage: "wireframes",
    status: "onboarding",
    progress: 18,
    estimatedEndDate: days(48),
  },
  {
    id: "5",
    title: "Vertex Landing Page",
    clientName: "Priya Nair",
    stage: "launched",
    status: "live",
    progress: 100,
    estimatedEndDate: days(-2),
  },
  {
    id: "6",
    title: "Harbor Cafe Site",
    clientName: "Liam O'Connor",
    stage: "discovery",
    status: "onboarding",
    progress: 8,
    estimatedEndDate: days(60),
  },
];

export default function AdminDashboardPreview() {
  const active = PROJECTS.filter((p) => p.status !== "live").length;
  const inReview = PROJECTS.filter((p) => p.status === "review").length;

  return (
    <div>
      <PageHeading
        title="Good afternoon, Martina"
        description="Your studio at a glance — projects, clients, and invoices."
      />

      {/* Stats row */}
      <StaggerGroup className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StaggerItem>
          <StatCard
            label="Active Projects"
            value={active}
            icon={<FolderKanban className="size-[18px]" />}
            sub="In flight right now"
            tone="accent"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="In Review"
            value={inReview}
            icon={<Eye className="size-[18px]" />}
            sub="Awaiting your sign-off"
            tone="review"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Change Revenue"
            value={315}
            prefix="€"
            icon={<Wallet className="size-[18px]" />}
            sub="From 7 change requests"
            tone="completed"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Pending Invoices"
            value={2}
            icon={<Receipt className="size-[18px]" />}
            sub="€90 unpaid"
            tone="live"
          />
        </StaggerItem>
      </StaggerGroup>

      {/* Project grid */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">All Projects</h2>
          <span className="text-xs text-ink-faint">{PROJECTS.length} total</span>
        </div>
        <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p) => (
            <StaggerItem key={p.id}>
              <AdminProjectCard project={p} href="/preview/admin" />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </div>
  );
}
