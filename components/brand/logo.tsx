import { cn } from "@/lib/utils";

/** Atelier wordmark + glyph. The glyph is a layered indigo aperture. */
export function Logo({
  className,
  showWord = true,
}: {
  className?: string;
  showWord?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid size-9 place-items-center rounded-[10px] border border-line bg-surface-raised shadow-inset">
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M9 1.5 16.5 9 9 16.5 1.5 9 9 1.5Z"
            stroke="#6366F1"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M9 5.25 12.75 9 9 12.75 5.25 9 9 5.25Z"
            fill="#6366F1"
            fillOpacity="0.25"
            stroke="#6366F1"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
        <span className="pointer-events-none absolute inset-0 rounded-[10px] bg-accent/10 blur-md" />
      </span>
      {showWord && (
        <span className="text-[15px] font-bold tracking-tight text-ink">
          Atelier
        </span>
      )}
    </span>
  );
}
