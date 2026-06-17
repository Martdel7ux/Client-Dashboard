import { LayoutDashboard, FolderKanban, Users, Receipt } from "lucide-react";
import { requireAdmin } from "@/lib/queries";
import { firstName } from "@/lib/utils";
import { PageHeading } from "@/components/dashboard/page-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";
import { signOut } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Admin · Tamplo" };

export default async function AdminDashboardPage() {
  const profile = await requireAdmin();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-10">
      <PageHeading
        title={`Welcome back, ${firstName(profile.full_name)}`}
        description="Your studio at a glance: projects, clients, and invoices."
        action={
          <form action={signOut}>
            <Button variant="secondary" size="sm">
              Sign out
            </Button>
          </form>
        }
      />
      <Card>
        <EmptyState
          icon={<LayoutDashboard className="size-6" />}
          satellites={[
            <FolderKanban key="f" className="size-3.5" />,
            <Users key="u" className="size-3.5" />,
            <Receipt key="r" className="size-3.5" />,
          ]}
          title="Admin panel scaffolded"
          description="The admin shell and auth gate are live. Project, client, and invoice management views build on this same design system next."
        />
      </Card>
    </main>
  );
}
