import { PageHeading } from "@/components/dashboard/page-heading";
import { FadeIn } from "@/components/dashboard/motion-primitives";
import { ContentWorkspace } from "@/components/content/content-workspace";
import type {
  ContentItem,
  ContentItemType,
  ContentItemStatus,
  ContentSection,
} from "@/lib/supabase/database.types";

export const metadata = { title: "Content Preview · Tamplo" };

const SECTIONS: ContentSection[] = [
  { id: "s1", project_id: "demo", section_name: "Hero", description: "The first thing visitors see.", order_index: 0, created_at: "" },
  { id: "s2", project_id: "demo", section_name: "About", description: "Tell your story.", order_index: 1, created_at: "" },
  { id: "s3", project_id: "demo", section_name: "Services", description: "What you offer.", order_index: 2, created_at: "" },
  { id: "s4", project_id: "demo", section_name: "Contact", description: "How people reach you.", order_index: 3, created_at: "" },
];

let n = 0;
function item(
  section_id: string,
  type: ContentItemType,
  label: string,
  description: string,
  status: ContentItemStatus,
  extra: Partial<ContentItem> = {},
): ContentItem {
  return {
    id: `i${++n}`,
    section_id,
    project_id: "demo",
    type,
    label,
    description,
    value: null,
    file_url: null,
    file_name: null,
    notes: null,
    status,
    order_index: n,
    created_at: "",
    ...extra,
  };
}

const ITEMS: ContentItem[] = [
  // Hero
  item("s1", "image", "Logo", "Your logo as PNG or SVG, ideally transparent.", "pending"),
  item("s1", "text", "Headline", "One punchy line that sums up what you do.", "uploaded", {
    value: "Design that moves people.",
  }),
  item("s1", "text", "Subheadline", "A sentence supporting the headline.", "pending"),
  // About
  item("s2", "text", "Company story", "A short paragraph about who you are.", "uploaded", {
    value:
      "We're a small studio crafting brands and websites for ambitious teams who care about the details.",
  }),
  item("s2", "file", "Brand guidelines", "Any existing brand or style PDF.", "uploaded", {
    file_url: "#",
    file_name: "brand-guidelines.pdf",
  }),
  // Services
  item("s3", "text", "Services list", "List the services you want featured.", "pending"),
  item("s3", "file", "Pricing sheet", "Upload your current pricing, if any.", "pending"),
  item("s3", "url", "Booking link", "Link clients use to book a call.", "uploaded", {
    value: "https://cal.com/atelier/intro",
  }),
  // Contact
  item("s4", "text", "Email address", "The address enquiries should go to.", "uploaded", {
    value: "hello@acmestudio.com",
  }),
  item("s4", "text", "Phone number", "Optional contact number.", "pending"),
  item("s4", "url", "Map link", "Google Maps link to your office.", "pending"),
  item("s4", "image", "Office photo", "A photo of your space (optional).", "pending"),
];

export default function ContentPreview() {
  return (
    <div>
      <PageHeading
        title="Content"
        description="Upload the words, images, and links that bring your site to life, organised by section."
      />
      <FadeIn>
        <ContentWorkspace sections={SECTIONS} initialItems={ITEMS} demo />
      </FadeIn>
    </div>
  );
}
