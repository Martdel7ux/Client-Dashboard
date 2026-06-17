import { FolderUp, Image, FileText, Link2 } from "lucide-react";
import { requireProfile, getClientProject } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { PageHeading } from "@/components/dashboard/page-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/dashboard/motion-primitives";
import { ContentWorkspace } from "@/components/content/content-workspace";

export const metadata = { title: "Content · Tamplo" };

export default async function ContentPage() {
  const profile = await requireProfile();
  const project = await getClientProject(profile.id);

  if (!project) {
    return (
      <div>
        <PageHeading title="Content" />
        <Card>
          <EmptyState
            icon={<FolderUp className="size-6" />}
            satellites={[
              <Image key="i" className="size-3.5" />,
              <FileText key="f" className="size-3.5" />,
              <Link2 key="l" className="size-3.5" />,
            ]}
            title="No project yet"
            description="Your content workspace appears here once your project is set up."
          />
        </Card>
      </div>
    );
  }

  const supabase = createClient();
  const [{ data: sections }, { data: items }] = await Promise.all([
    supabase
      .from("content_sections")
      .select("*")
      .eq("project_id", project.id)
      .order("order_index", { ascending: true }),
    supabase
      .from("content_items")
      .select("*")
      .eq("project_id", project.id)
      .order("order_index", { ascending: true }),
  ]);

  return (
    <div>
      <PageHeading
        title="Content"
        description="Upload the words, images, and links that bring your site to life, organised by section."
      />

      {sections && sections.length > 0 ? (
        <FadeIn>
          <ContentWorkspace
            sections={sections}
            initialItems={items ?? []}
          />
        </FadeIn>
      ) : (
        <Card>
          <EmptyState
            icon={<FolderUp className="size-6" />}
            satellites={[
              <Image key="i" className="size-3.5" />,
              <FileText key="f" className="size-3.5" />,
              <Link2 key="l" className="size-3.5" />,
            ]}
            title="No sections yet"
            description="Once your project moves into design, we'll add the content sections we need from you here."
          />
        </Card>
      )}
    </div>
  );
}
