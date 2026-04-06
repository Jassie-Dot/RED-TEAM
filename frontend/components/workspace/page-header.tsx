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
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="section-kicker">{eyebrow}</p>
        <h1 className="mt-3 font-display text-[2.1rem] leading-tight text-white md:text-[2.7rem]">
          {title}
        </h1>
        <p className="mt-4 text-base leading-8 text-white/62">{description}</p>
      </div>

      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
