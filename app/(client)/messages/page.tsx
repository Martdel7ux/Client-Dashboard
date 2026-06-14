import { MessageSquare, Send, Sparkles } from "lucide-react";
import { PageHeading } from "@/components/dashboard/page-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Messages — Atelier" };

export default function MessagesPage() {
  return (
    <div>
      <PageHeading
        title="Messages"
        description="A direct line to your project team. Replies arrive in real time — no refresh needed."
      />
      <Card>
        <EmptyState
          icon={<MessageSquare className="size-6" />}
          satellites={[
            <Send key="s" className="size-3.5" />,
            <Sparkles key="sp" className="size-3.5" />,
          ]}
          title="No messages yet"
          description="Say hello, ask a question, or share a thought. Your team will see it instantly."
        />
      </Card>
    </div>
  );
}
