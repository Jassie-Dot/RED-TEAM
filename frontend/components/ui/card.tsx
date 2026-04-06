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
        "rounded-[32px] border backdrop-blur-xl",
        variant === "default" &&
          "border-white/10 bg-[linear-gradient(180deg,rgba(20,28,45,0.88),rgba(9,13,22,0.96))] shadow-[0_24px_70px_rgba(3,7,18,0.32)]",
        variant === "strong" &&
          "border-white/12 bg-[linear-gradient(180deg,rgba(24,32,53,0.94),rgba(8,12,21,0.98))] shadow-[0_32px_90px_rgba(3,7,18,0.42)]",
        variant === "subtle" &&
          "border-white/8 bg-white/[0.03] shadow-[0_18px_54px_rgba(3,7,18,0.18)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("font-display text-2xl text-white", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-7 text-white/62", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}
