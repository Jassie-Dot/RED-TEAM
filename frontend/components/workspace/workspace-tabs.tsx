"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getPrimaryTabs } from "@/lib/workspace";
import { cn } from "@/lib/utils";
import { useAppMode } from "@/store/app-store";

export function WorkspaceTabs() {
  const pathname = usePathname();
  const { mode } = useAppMode();
  const tabs = getPrimaryTabs(mode);

  return (
    <nav className="pb-1">
      <div className="grid w-full gap-2 rounded-[26px] border border-white/10 bg-white/[0.03] p-2 sm:grid-cols-2 lg:grid-cols-4">
        {tabs.map((tab) => {
          const active = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "h-full min-w-0 rounded-[20px] px-4 py-3 transition",
                active
                  ? "border border-white/14 bg-white/[0.08] text-white shadow-[0_16px_40px_rgba(3,7,18,0.18)]"
                  : "border border-transparent text-white/60 hover:bg-white/[0.05] hover:text-white"
              )}
            >
              <p className="text-sm font-medium">{tab.label}</p>
              <p className="mt-1 text-xs text-white/45">{tab.description}</p>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
