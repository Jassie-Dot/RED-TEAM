"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export function buttonStyles({
  variant = "secondary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-medium transition-all duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b18]",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:transform-none disabled:hover:shadow-none",
    size === "sm" && "h-10 px-4 text-xs",
    size === "md" && "h-11 px-5 text-sm",
    size === "lg" && "h-12 px-6 text-[15px]",
    variant === "primary" &&
      "border border-neon/25 bg-[linear-gradient(135deg,rgba(var(--neon-rgb),1),rgba(92,221,255,0.96)_48%,rgba(var(--pulse-rgb),0.96))] text-[#041120] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_18px_50px_rgba(var(--neon-rgb),0.22)] hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_24px_64px_rgba(var(--neon-rgb),0.28)]",
    variant === "secondary" &&
      "border border-white/10 bg-white/[0.04] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:-translate-y-0.5 hover:border-neon/25 hover:bg-white/[0.08] hover:text-white",
    variant === "ghost" &&
      "border border-transparent bg-transparent text-white/64 hover:border-white/10 hover:bg-white/[0.05] hover:text-white",
    variant === "danger" &&
      "border border-danger/25 bg-danger/10 text-danger shadow-[0_12px_32px_rgba(var(--danger-rgb),0.12)] hover:-translate-y-0.5 hover:border-danger/40 hover:bg-danger/10",
    className
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = "secondary",
  size = "md",
  ...props
}: ButtonProps) {
  return <button className={buttonStyles({ variant, size, className })} {...props} />;
}
