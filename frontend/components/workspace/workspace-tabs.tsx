"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, BrainCircuit, LayoutDashboard, ScanSearch } from "lucide-react";

import { getPrimaryTabs } from "@/lib/workspace";
import { cn } from "@/lib/utils";
import { useAppMode } from "@/store/app-store";

export function WorkspaceTabs() {
  const pathname = usePathname();
  const { mode } = useAppMode();
  const tabs = getPrimaryTabs(mode);
  const iconMap: Record<string, typeof LayoutDashboard> = {
    Dashboard: LayoutDashboard,
    "Resume Studio": ScanSearch,
    "Hiring Insights": BarChart3,
    "Capability Insights": BarChart3,
    "Interview Engine": BrainCircuit,
  };

  return (
    <nav className="surface-outline relative overflow-hidden rounded-[28px] p-2">
      <div className="grid w-full gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const Icon = iconMap[tab.label] || LayoutDashboard;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "group relative min-h-[108px] rounded-[24px] px-4 py-4 outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-neon/50",
                active ? "text-white" : "text-white/68 hover:-translate-y-0.5 hover:text-white"
              )}
            >
              {active && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 rounded-[24px] border border-neon/20 bg-[linear-gradient(180deg,rgba(var(--neon-rgb),0.16),rgba(255,255,255,0.04))] shadow-[0_0_0_1px_rgba(var(--neon-rgb),0.06),0_18px_46px_rgba(var(--neon-rgb),0.12)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex h-full flex-col justify-between gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300",
                      active
                        ? "border-neon/25 bg-neon/10 text-neon"
                        : "border-white/10 bg-white/[0.04] text-white/42 group-hover:border-white/20 group-hover:text-white/80"
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/42">
                    {active ? "Live" : "Open"}
                  </span>
                </div>
                <div>
                  <p className={cn("text-[14px] font-semibold transition-colors", active ? "text-white" : "text-white/74 group-hover:text-white")}>
                    {tab.label}
                  </p>
                  <p className={cn("mt-1.5 text-[12px] leading-5 transition-colors", active ? "text-white/58" : "text-white/42 group-hover:text-white/52")}>
                    {tab.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
