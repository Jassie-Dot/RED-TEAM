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
    "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b12]",
    "disabled:cursor-not-allowed disabled:opacity-50",
    size === "sm" && "h-10 px-3.5 text-sm",
    size === "md" && "h-11 px-4 text-sm",
    size === "lg" && "h-12 px-5 text-sm",
    variant === "primary" &&
      "border border-[#d9f7ff]/10 bg-[linear-gradient(135deg,rgba(227,247,255,0.98),rgba(101,233,209,0.94))] text-[#061019] shadow-[0_18px_40px_rgba(62,214,194,0.2)] hover:translate-y-[-1px]",
    variant === "secondary" &&
      "border border-white/10 bg-white/[0.04] text-white/88 hover:border-white/16 hover:bg-white/[0.08]",
    variant === "ghost" && "text-white/70 hover:bg-white/[0.05] hover:text-white",
    variant === "danger" &&
      "border border-danger/20 bg-danger/10 text-danger hover:border-danger/30 hover:bg-danger/15",
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
