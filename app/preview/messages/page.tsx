import { PageHeading } from "@/components/dashboard/page-heading";
import { FadeIn } from "@/components/dashboard/motion-primitives";
import { Chat, type Participant } from "@/components/messages/chat";
import type { Message } from "@/lib/supabase/database.types";

export const metadata = { title: "Messages Preview · Tamplo" };

const ME = "me";
const TEAM = "team";

const participants: Record<string, Participant> = {
  [ME]: { full_name: "Martina Hoto", avatar_url: null },
  [TEAM]: { full_name: "Tamplo Team", avatar_url: null },
};

// Build a two-day conversation so the date dividers show.
const day = (offset: number, h: number, m: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

let n = 0;
const msg = (sender: string, content: string, at: string): Message => ({
  id: `m${++n}`,
  project_id: "demo",
  sender_id: sender,
  content,
  read: true,
  created_at: at,
});

const MESSAGES: Message[] = [
  msg(TEAM, "Hi Martina! Welcome to your project portal 👋 We've just kicked off the Discovery stage.", day(-1, 9, 12)),
  msg(ME, "Amazing, thank you! Where should I upload our brand assets?", day(-1, 9, 31)),
  msg(TEAM, "Head to the Content tab — there's a Hero section ready for your logo and headline.", day(-1, 9, 33)),
  msg(ME, "Perfect, just added the logo and our tagline.", day(-1, 14, 2)),
  msg(TEAM, "Got it, looks great. We'll start on wireframes tomorrow.", day(-1, 14, 20)),
  msg(TEAM, "Morning! First wireframes are up for the homepage. Take a look whenever you have a moment.", day(0, 8, 45)),
  msg(ME, "Love the layout. Could we make the hero a little taller?", day(0, 10, 5)),
];

export default function MessagesPreview() {
  return (
    <div>
      <PageHeading
        title="Messages"
        description="A direct line to your project team. Replies arrive in real time, no refresh needed."
      />
      <FadeIn>
        <Chat
          projectId="demo"
          meId={ME}
          participants={participants}
          initialMessages={MESSAGES}
          demo
        />
      </FadeIn>
    </div>
  );
}
