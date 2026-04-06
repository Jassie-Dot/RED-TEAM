import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type CardVariant = "default" | "strong" | "subtle";

export function Card({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: CardVariant }) {
  return (
    <div
      className={cn(
        "group relative isolate overflow-hidden rounded-[30px] border transition-all duration-300",
        variant === "default" &&
          "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] shadow-panel backdrop-blur-3xl",
        variant === "strong" &&
          "border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(var(--neon-rgb),0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03)),rgba(7,12,26,0.92)] shadow-[0_32px_90px_rgba(3,8,24,0.5)] backdrop-blur-[34px]",
        variant === "subtle" &&
          "border-white/10 bg-white/[0.03] shadow-[0_16px_44px_rgba(3,8,24,0.22)] backdrop-blur-xl",
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_34%)] opacity-80" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="relative z-10 h-full">{props.children}</div>
    </div>
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("font-display text-2xl tracking-tight text-white/96", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-7 text-white/58", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}
