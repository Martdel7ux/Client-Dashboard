import { requireProfile } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { ClientSidebar } from "@/components/layout/client-sidebar";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();
  const supabase = createClient();

  // Unread message count for the sidebar dot (messages not sent by me).
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("read", false)
    .neq("sender_id", profile.id);

  return (
    <div className="flex min-h-screen bg-canvas">
      <ClientSidebar unreadMessages={count ?? 0} />
      <div className="relative flex-1 overflow-x-hidden">
        <div className="glow-accent pointer-events-none absolute inset-x-0 top-0 h-64" />
        <main className="relative mx-auto w-full max-w-6xl px-6 py-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
