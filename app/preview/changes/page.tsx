import { PageHeading } from "@/components/dashboard/page-heading";
import { FadeIn } from "@/components/dashboard/motion-primitives";
import { ChangesView } from "@/components/changes/changes-view";
import type {
  ChangeRequest,
  ChangeRequestStatus,
  InvoiceStatus,
} from "@/lib/supabase/database.types";

export const metadata = { title: "Change Requests Preview · Tamplo" };

const daysAgo = (d: number) =>
  new Date(Date.now() - d * 86400000).toISOString();

let n = 0;
function req(
  title: string,
  description: string,
  status: ChangeRequestStatus,
  isPost: boolean,
  invoice: InvoiceStatus,
  createdDaysAgo: number,
): ChangeRequest {
  return {
    id: `r${++n}`,
    project_id: "demo",
    client_id: "demo",
    title,
    description,
    status,
    is_post_launch: isPost,
    fee_euros: isPost ? 45 : 0,
    invoice_status: invoice,
    stripe_payment_intent_id: null,
    stripe_payment_link: null,
    file_url: null,
    created_at: daysAgo(createdDaysAgo),
  };
}

const REQUESTS: ChangeRequest[] = [
  req("Update homepage headline", "Swap the hero line to the new tagline.", "completed", false, "unpaid", 12),
  req("Add a testimonials section", "Three client quotes under the services block.", "in_progress", false, "unpaid", 5),
  req("Resize the logo in the header", "It feels a touch large on mobile.", "reviewing", false, "unpaid", 2),
  req("Add a blog page", "New section with three starter posts.", "submitted", true, "unpaid", 1),
  req("Seasonal banner for December", "Promo bar across the top of the site.", "completed", true, "paid", 20),
];

export default function ChangesPreview() {
  return (
    <div>
      <PageHeading
        title="Change Requests"
        description="Request tweaks and additions. During the project they're free. After launch, each request is €45."
      />
      <FadeIn>
        <ChangesView
          projectId="demo"
          isPostLaunch={false}
          requests={REQUESTS}
          demo
        />
      </FadeIn>
    </div>
  );
}
