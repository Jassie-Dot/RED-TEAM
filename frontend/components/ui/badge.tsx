import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "outline";

export function Badge({
  className,
  variant = "neutral",
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: BadgeVariant }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]",
        variant === "neutral" && "border-white/10 bg-white/[0.04] text-white/62",
        variant === "success" && "border-neon/20 bg-neon/10 text-neon",
        variant === "warning" && "border-pulse/22 bg-pulse/10 text-pulse",
        variant === "danger" && "border-danger/22 bg-danger/10 text-danger",
        variant === "outline" && "border-white/12 bg-transparent text-white/56",
        className
      )}
      {...props}
    />
  );
}
