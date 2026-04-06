"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, ClipboardList, LayoutDashboard, Settings, ShieldCheck } from "lucide-react";
import { memo } from "react";

import { getModeConfig } from "@/lib/mode-config";
import { useAppMode } from "@/store/app-store";

export const MobileNav = memo(function MobileNav() {
  const pathname = usePathname();
  const { mode } = useAppMode();
  const modeConfig = getModeConfig(mode);
  const navigation = [
    { href: "/", icon: LayoutDashboard },
    { href: "/resume-analysis", icon: ShieldCheck },
    { href: "/reports", icon: ClipboardList },
    { href: "/student-lab", icon: BrainCircuit },
    { href: "/settings", icon: Settings },
  ].map((item, index) => ({
    ...item,
    label: modeConfig.navigation[index].label,
  }));

  return (
    <div className="mb-5 overflow-x-auto xl:hidden">
      <div className="glass-panel flex min-w-max gap-2 rounded-[24px] p-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-[96px] flex-col items-center gap-2 rounded-2xl px-3 py-3 text-center ${
                active ? "border border-neon/20 bg-neon/10 text-neon" : "border border-transparent bg-white/[0.03] text-white/62"
              }`}
            >
              <Icon size={18} />
              <span className="text-xs font-medium leading-4">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
});
