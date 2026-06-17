import { FolderUp, Image, FileText, Link2 } from "lucide-react";
import { PageHeading } from "@/components/dashboard/page-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Content · Tamplo" };

export default function ContentPage() {
  return (
    <div>
      <PageHeading
        title="Content"
        description="Upload the words, images, and links that bring your site to life, organised by section."
      />
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
    </div>
  );
}
