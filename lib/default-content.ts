import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, ContentItemType } from "@/lib/supabase/database.types";

interface SeedItem {
  label: string;
  type: ContentItemType;
  description: string;
}
interface SeedSection {
  name: string;
  description: string;
  items: SeedItem[];
}

/** Starter content every new website project begins with. */
export const DEFAULT_CONTENT: SeedSection[] = [
  {
    name: "Hero",
    description: "The first thing visitors see at the top of your site.",
    items: [
      { label: "Logo", type: "image", description: "Your logo — PNG or SVG, transparent background preferred." },
      { label: "Headline", type: "text", description: "One punchy line that sums up what you do." },
      { label: "Subheadline", type: "text", description: "A supporting sentence under the headline." },
    ],
  },
  {
    name: "About",
    description: "Tell visitors who you are.",
    items: [
      { label: "Company story", type: "text", description: "A short paragraph about who you are and what you do." },
      { label: "Mission", type: "text", description: "What you're setting out to achieve." },
      { label: "Team photo", type: "image", description: "A photo of you or your team (optional)." },
    ],
  },
  {
    name: "Services",
    description: "What you offer.",
    items: [
      { label: "Services list", type: "text", description: "List the services you'd like featured." },
      { label: "Pricing", type: "file", description: "Upload a pricing sheet, if you have one (optional)." },
    ],
  },
  {
    name: "Contact",
    description: "How people reach you.",
    items: [
      { label: "Email address", type: "text", description: "The address enquiries should go to." },
      { label: "Phone number", type: "text", description: "A contact number (optional)." },
      { label: "Address", type: "text", description: "Your business address (optional)." },
      { label: "Social links", type: "url", description: "Links to your social profiles." },
    ],
  },
];

/**
 * Inserts the default sections + items for a project. Works with either the
 * service-role or a server (admin-session) client.
 */
export async function seedDefaultContent(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<void> {
  for (let s = 0; s < DEFAULT_CONTENT.length; s++) {
    const sec = DEFAULT_CONTENT[s];
    const { data: section } = await supabase
      .from("content_sections")
      .insert({
        project_id: projectId,
        section_name: sec.name,
        description: sec.description,
        order_index: s,
      })
      .select("id")
      .single();
    if (!section) continue;

    await supabase.from("content_items").insert(
      sec.items.map((it, i) => ({
        project_id: projectId,
        section_id: section.id,
        label: it.label,
        type: it.type,
        description: it.description,
        status: "pending" as const,
        order_index: i,
      })),
    );
  }
}
