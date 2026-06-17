import { requireAdmin } from "@/lib/queries";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-canvas">
      <AdminSidebar />
      <div className="relative flex-1 overflow-x-hidden">
        <div className="glow-accent pointer-events-none absolute inset-x-0 top-0 h-64" />
        <main className="relative mx-auto w-full max-w-6xl px-6 py-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
