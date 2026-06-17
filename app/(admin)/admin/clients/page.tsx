import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Users, UserPlus } from "lucide-react";
import { requireAdmin } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { getInitials } from "@/lib/utils";
import { PageHeading } from "@/components/dashboard/page-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";
import { CreateClientDialog } from "@/components/admin/create-client-dialog";

export const metadata = { title: "Clients · Tamplo" };

export default async function AdminClientsPage() {
  await requireAdmin();
  const supabase = createClient();

  const { data: clients } = await supabase
    .from("profiles")
    .select("id, full_name, email, last_login_at, created_at")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  const { data: projects } = await supabase
    .from("projects")
    .select("id, client_id, title, status")
    .order("created_at", { ascending: false });

  const projectFor = new Map<string, { id: string; title: string }>();
  for (const p of projects ?? []) {
    if (!projectFor.has(p.client_id))
      projectFor.set(p.client_id, { id: p.id, title: p.title });
  }

  return (
    <div>
      <PageHeading
        title="Clients"
        description="Everyone with portal access, and the projects they're attached to."
        action={<CreateClientDialog />}
      />

      {clients && clients.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-faint">
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Last login</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => {
                  const proj = projectFor.get(c.id);
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-line/60 transition-colors last:border-0 hover:bg-surface-raised/50"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-surface-raised text-xs font-semibold text-ink-muted">
                            {getInitials(c.full_name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">
                              {c.full_name ?? "—"}
                            </p>
                            <p className="truncate text-xs text-ink-faint">
                              {c.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {proj ? (
                          <Link
                            href={`/admin/projects/${proj.id}`}
                            className="text-accent hover:underline"
                          >
                            {proj.title}
                          </Link>
                        ) : (
                          <span className="text-ink-faint">No project</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-ink-muted">
                        {c.last_login_at
                          ? formatDistanceToNow(new Date(c.last_login_at), {
                              addSuffix: true,
                            })
                          : "Never"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={<Users className="size-6" />}
            satellites={[<UserPlus key="u" className="size-3.5" />]}
            title="No clients yet"
            description="Create your first client to generate their account, project, and welcome email."
          />
        </Card>
      )}
    </div>
  );
}
