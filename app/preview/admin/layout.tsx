import Link from "next/link";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default function AdminPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <AdminSidebar demo />
      <div className="relative flex-1 overflow-x-hidden">
        <div className="glow-accent pointer-events-none absolute inset-x-0 top-0 h-64" />
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-b border-line bg-accent/[0.06] px-4 py-2 text-center text-xs text-ink-muted">
          <span className="size-1.5 rounded-full bg-accent" />
          Admin preview with sample data.
          <Link
            href="/preview/dashboard"
            className="font-medium text-accent hover:underline"
          >
            View client perspective →
          </Link>
        </div>
        <main className="relative mx-auto w-full max-w-6xl px-6 py-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
