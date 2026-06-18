import { FolderKanban, UserPlus } from "lucide-react";
import { requireAdmin } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { PageHeading } from "@/components/dashboard/page-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AdminProjectCard,
  type AdminProjectCardData,
} from "@/components/dashboard/admin-project-card";
import {
  StaggerGroup,
  StaggerItem,
} from "@/components/dashboard/motion-primitives";
import Link from "next/link";

export const metadata = { title: "Projects · Tamplo" };

export default async function AdminProjectsPage() {
  await requireAdmin();
  const supabase = createClient();

  const [{ data: projects }, { data: clients }] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name").eq("role", "client"),
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

  return (
    <div>
      <PageHeading
        title="Projects"
        description="Every project across your studio. Open one to manage its stage, content, requests, and messages."
      />

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
            satellites={[<UserPlus key="u" className="size-3.5" />]}
            title="No projects yet"
            description="Create a client to spin up their first project."
            action={
              <Button asChild>
                <Link href="/admin/clients">Go to Clients</Link>
              </Button>
            }
          />
        </Card>
      )}
    </div>
  );
}
