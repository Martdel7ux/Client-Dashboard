import { MessageSquare, Send, Sparkles } from "lucide-react";
import { requireProfile, getClientProject } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { PageHeading } from "@/components/dashboard/page-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/dashboard/motion-primitives";
import { Chat, type Participant } from "@/components/messages/chat";

export const metadata = { title: "Messages · Tamplo" };

export default async function MessagesPage() {
  const profile = await requireProfile();
  const project = await getClientProject(profile.id);

  if (!project) {
    return (
      <div>
        <PageHeading title="Messages" />
        <Card>
          <EmptyState
            icon={<MessageSquare className="size-6" />}
            satellites={[
              <Send key="s" className="size-3.5" />,
              <Sparkles key="sp" className="size-3.5" />,
            ]}
            title="No project yet"
            description="Your message thread opens up once your project is set up."
          />
        </Card>
      </div>
    );
  }

  const supabase = createClient();
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: true });

  // Resolve every sender's profile for avatars/names.
  const senderIds = Array.from(
    new Set([...(messages ?? []).map((m) => m.sender_id), profile.id]),
  );
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", senderIds);

  const participants: Record<string, Participant> = {};
  for (const p of profiles ?? []) {
    participants[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
  }

  return (
    <div>
      <PageHeading
        title="Messages"
        description="A direct line to your project team. Replies arrive in real time, no refresh needed."
      />
      <FadeIn>
        <Chat
          projectId={project.id}
          meId={profile.id}
          participants={participants}
          initialMessages={messages ?? []}
        />
      </FadeIn>
    </div>
  );
}
