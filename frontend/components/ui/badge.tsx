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
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em]",
        variant === "neutral" &&
          "border-white/10 bg-white/[0.05] text-white/66 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        variant === "success" &&
          "border-success/25 bg-success/10 text-success shadow-[0_0_0_1px_rgba(var(--success-rgb),0.08),0_0_20px_rgba(var(--success-rgb),0.12)]",
        variant === "warning" &&
          "border-warning/25 bg-warning/10 text-warning shadow-[0_0_0_1px_rgba(var(--warning-rgb),0.08),0_0_20px_rgba(var(--warning-rgb),0.12)]",
        variant === "danger" &&
          "border-danger/25 bg-danger/10 text-danger shadow-[0_0_0_1px_rgba(var(--danger-rgb),0.08),0_0_20px_rgba(var(--danger-rgb),0.12)]",
        variant === "outline" && "border-white/12 bg-transparent text-white/58",
        className
      )}
      {...props}
    />
  );
}
