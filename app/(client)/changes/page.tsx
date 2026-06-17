import { GitPullRequestArrow, Plus, Check, Clock } from "lucide-react";
import { requireProfile, getClientProject } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { PageHeading } from "@/components/dashboard/page-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/dashboard/motion-primitives";
import { ChangesView } from "@/components/changes/changes-view";

export const metadata = { title: "Change Requests · Tamplo" };

export default async function ChangesPage() {
  const profile = await requireProfile();
  const project = await getClientProject(profile.id);

  if (!project) {
    return (
      <div>
        <PageHeading title="Change Requests" />
        <Card>
          <EmptyState
            icon={<GitPullRequestArrow className="size-6" />}
            satellites={[
              <Plus key="p" className="size-3.5" />,
              <Clock key="c" className="size-3.5" />,
              <Check key="k" className="size-3.5" />,
            ]}
            title="No project yet"
            description="You'll be able to submit change requests once your project is set up."
          />
        </Card>
      </div>
    );
  }

  const supabase = createClient();
  const { data: requests } = await supabase
    .from("change_requests")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false });

  const isPostLaunch = project.stage === "launched";

  return (
    <div>
      <PageHeading
        title="Change Requests"
        description="Request tweaks and additions. During the project they're free. After launch, each request is €45."
      />
      <FadeIn>
        <ChangesView
          projectId={project.id}
          isPostLaunch={isPostLaunch}
          requests={requests ?? []}
        />
      </FadeIn>
    </div>
  );
}
