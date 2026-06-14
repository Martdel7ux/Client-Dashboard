import Link from "next/link";
import { ClientSidebar } from "@/components/layout/client-sidebar";

export default function ClientPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <ClientSidebar unreadMessages={2} demo />
      <div className="relative flex-1 overflow-x-hidden">
        <div className="glow-accent pointer-events-none absolute inset-x-0 top-0 h-64" />
        <PreviewBanner href="/preview/admin" label="View admin perspective →" />
        <main className="relative mx-auto w-full max-w-6xl px-6 py-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function PreviewBanner({ href, label }: { href: string; label: string }) {
  return (
    <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-b border-line bg-accent/[0.06] px-4 py-2 text-center text-xs text-ink-muted">
      <span className="size-1.5 rounded-full bg-accent" />
      Design preview with sample data.
      <Link href={href} className="font-medium text-accent hover:underline">
        {label}
      </Link>
    </div>
  );
}
