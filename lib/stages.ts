import type {
  ProjectStage,
  ProjectStatus,
  ChangeRequestStatus,
  ContentItemStatus,
} from "@/lib/supabase/database.types";

export const STAGE_ORDER: ProjectStage[] = [
  "discovery",
  "wireframes",
  "design",
  "development",
  "review",
  "launched",
];

export const STAGE_META: Record<
  ProjectStage,
  { label: string; blurb: string }
> = {
  discovery: {
    label: "Discovery",
    blurb: "Defining goals, scope, and direction",
  },
  wireframes: {
    label: "Wireframes",
    blurb: "Structuring layout and user flow",
  },
  design: { label: "Design", blurb: "Crafting the visual identity" },
  development: {
    label: "Development",
    blurb: "Building it for real",
  },
  review: { label: "Review", blurb: "Final polish and your sign-off" },
  launched: { label: "Launched", blurb: "Live to the world" },
};

export function stageIndex(stage: ProjectStage): number {
  return STAGE_ORDER.indexOf(stage);
}

export const STATUS_META: Record<
  ProjectStatus,
  { label: string; dot: string; text: string; bg: string }
> = {
  onboarding: {
    label: "Onboarding",
    dot: "bg-status-onboarding",
    text: "text-status-onboarding",
    bg: "bg-status-onboarding/10 border-status-onboarding/20",
  },
  in_progress: {
    label: "In Progress",
    dot: "bg-status-progress",
    text: "text-status-progress",
    bg: "bg-accent/10 border-accent/20",
  },
  review: {
    label: "In Review",
    dot: "bg-status-review",
    text: "text-status-review",
    bg: "bg-status-review/10 border-status-review/20",
  },
  completed: {
    label: "Completed",
    dot: "bg-status-completed",
    text: "text-status-completed",
    bg: "bg-status-completed/10 border-status-completed/20",
  },
  live: {
    label: "Live",
    dot: "bg-status-live",
    text: "text-status-live",
    bg: "bg-status-live/10 border-status-live/20",
  },
};

export const CHANGE_STATUS_FLOW: ChangeRequestStatus[] = [
  "submitted",
  "reviewing",
  "in_progress",
  "completed",
];

export const CHANGE_STATUS_LABEL: Record<ChangeRequestStatus, string> = {
  submitted: "Submitted",
  reviewing: "In Review",
  in_progress: "In Progress",
  completed: "Completed",
  rejected: "Rejected",
};

export const CONTENT_STATUS_META: Record<
  ContentItemStatus,
  { label: string; text: string; bg: string }
> = {
  pending: {
    label: "Pending",
    text: "text-ink-faint",
    bg: "bg-surface-raised border-line",
  },
  uploaded: {
    label: "Uploaded",
    text: "text-accent",
    bg: "bg-accent/10 border-accent/20",
  },
  approved: {
    label: "Approved",
    text: "text-status-completed",
    bg: "bg-status-completed/10 border-status-completed/20",
  },
};
