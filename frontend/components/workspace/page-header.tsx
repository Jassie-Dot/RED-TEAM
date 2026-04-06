import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-end">
      <div className="max-w-4xl">
        <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
          <p className="section-kicker">{eyebrow}</p>
        </div>
        <h1 className="mt-4 font-display text-[2.2rem] leading-tight text-white md:text-[2.9rem]">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/58">{description}</p>
      </div>

      {actions ? <div className="flex flex-wrap gap-3 xl:justify-end">{actions}</div> : null}
    </div>
  );
}
