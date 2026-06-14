import { FadeIn } from "./motion-primitives";

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <FadeIn className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-xl text-[15px] text-ink-muted">
            {description}
          </p>
        )}
      </div>
      {action}
    </FadeIn>
  );
}
