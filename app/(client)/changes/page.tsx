import { GitPullRequestArrow, Plus, Check, Clock } from "lucide-react";
import { PageHeading } from "@/components/dashboard/page-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Change Requests · Tamplo" };

export default function ChangesPage() {
  return (
    <div>
      <PageHeading
        title="Change Requests"
        description="Request tweaks and additions. During the project they're free. After launch, each request is €45."
      />
      <Card>
        <EmptyState
          icon={<GitPullRequestArrow className="size-6" />}
          satellites={[
            <Plus key="p" className="size-3.5" />,
            <Clock key="c" className="size-3.5" />,
            <Check key="k" className="size-3.5" />,
          ]}
          title="No change requests yet"
          description="Spotted something you'd like adjusted? Submit a request and we'll pick it up right away."
        />
      </Card>
    </div>
  );
}
