"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, ClipboardList, LayoutDashboard, Settings, ShieldCheck } from "lucide-react";
import { memo } from "react";

import { getModeConfig } from "@/lib/mode-config";
import { useAppMode, useResumeStore } from "@/store/app-store";

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const { mode } = useAppMode();
  const modeConfig = getModeConfig(mode);
  const analysis = useResumeStore((state) => state.analysis);
  const assistantState = useResumeStore((state) => state.assistantState);

  const navigation = [
    { href: "/", icon: LayoutDashboard },
    { href: "/resume-analysis", icon: ShieldCheck },
    { href: "/reports", icon: ClipboardList },
    { href: "/student-lab", icon: BrainCircuit },
    { href: "/settings", icon: Settings },
  ].map((item, index) => ({
    ...item,
    ...modeConfig.navigation[index],
  }));

  return (
    <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 flex-col border-r border-white/10 bg-[rgba(4,9,18,0.84)] px-5 py-5 backdrop-blur-xl xl:flex">
      <div className="glass-panel-strong neon-border rounded-[28px] p-5">
        <p className="section-kicker text-neon/85">Vigil-AI</p>
        <h1 className="mt-2 font-display text-2xl text-white">
          {mode === "HR" ? "Recruiting Intelligence" : "Candidate Growth Intelligence"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/65">{modeConfig.platformTagline}</p>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                active
                  ? "border border-neon/20 bg-gradient-to-r from-neon/12 to-pulse/10 text-white shadow-neon"
                  : "border border-transparent text-white/68 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${
                  active ? "border-neon/25 bg-neon/12 text-neon" : "border-white/10 bg-white/[0.04] text-white/60"
                }`}
              >
                <Icon size={18} />
              </span>
              <div className="min-w-0">
                <p className="font-display text-[15px]">{item.label}</p>
                <p className="mt-0.5 truncate text-xs text-white/45">{item.detail}</p>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
          <p className="section-kicker text-white/55">Status</p>
          <p className="mt-2 font-display text-lg text-white">{analysis ? `${analysis.score}/100` : "No active analysis"}</p>
          <p className="mt-2 text-sm text-white/62">
            {analysis
              ? `${analysis.risk_level} risk, assistant ${assistantState}`
              : "Upload a resume to activate reports, charts, and SentinelX grounding."}
          </p>
        </div>
        <div className="rounded-[24px] border border-danger/20 bg-danger/10 p-4">
          <p className="section-kicker text-danger/85">{mode === "HR" ? "Risk Lens" : "Reality Lens"}</p>
          <p className="mt-2 text-sm leading-6 text-white/78">
            {mode === "HR"
              ? "Timeline gaps, unsupported claims, and weak evidence remain visible across the workspace."
              : "Weak proof, shallow answers, and over-claimed skills remain visible across the workspace."}
          </p>
        </div>
      </div>
    </aside>
  );
});
