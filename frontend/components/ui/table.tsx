import { forwardRef } from "react";
import type { HTMLAttributes, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Table = forwardRef<HTMLTableElement, TableHTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/20">
      <div className="overflow-x-auto">
        <table ref={ref} className={cn("w-full min-w-[720px] border-collapse", className)} {...props} />
      </div>
    </div>
  )
);

Table.displayName = "Table";

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-white/[0.04]", className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("", className)} {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-t border-white/8 transition-colors hover:bg-white/[0.02]",
        className
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-white/46",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-5 py-4 align-top text-sm leading-7 text-white/82", className)} {...props} />;
}
