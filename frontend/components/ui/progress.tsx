import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  indicatorClassName,
}: {
  value: number;
  className?: string;
  indicatorClassName?: string;
}) {
  return (
    <div
      className={cn(
        "h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.05] shadow-[inset_0_1px_2px_rgba(3,8,24,0.45)]",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full bg-[linear-gradient(90deg,rgba(var(--neon-rgb),1),rgba(92,221,255,0.96)_54%,rgba(var(--pulse-rgb),0.92))] shadow-[0_0_24px_rgba(var(--neon-rgb),0.28)] transition-all duration-500 ease-out",
          indicatorClassName
        )}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
