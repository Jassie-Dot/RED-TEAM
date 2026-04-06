"use client";

import { AlertTriangle, Binary, Radar, Shield } from "lucide-react";
import { memo } from "react";

import { CountUp } from "@/components/count-up";
import { useAppMode, useResumeStore } from "@/store/app-store";

export const OverviewCards = memo(function OverviewCards() {
  const { mode } = useAppMode();
  const analysis = useResumeStore((state) => state.analysis);
  const assessment = useResumeStore((state) => state.assessment);
  const parsedResume = useResumeStore((state) => state.parsedResume);

  const scoreValue = analysis ? analysis.score : 0;
  // A simple calculation for a stroke-dashoffset to draw a ring progress
  const ringCircumference = 2 * Math.PI * 22; // r=22
  const ringOffset = ringCircumference - (scoreValue / 100) * ringCircumference;

  const cards = [
    {
      label: mode === "HR" ? "Trust Score" : "Credibility Baseline",
      value: analysis ? <CountUp value={scoreValue} /> : "--",
      suffix: "",
      icon: Shield,
      accent: "text-neon group-hover:text-white transition-colors duration-300",
      bgHover: "group-hover:bg-neon/10",
      detail: analysis ? `${analysis.risk_level} risk level` : "Awaiting scan",
      isScore: true,
    },
    {
      label: mode === "HR" ? "Skill Inventory" : "Claimed Skills",
      value: parsedResume?.skills.length ?? 0,
      suffix: "",
      icon: Binary,
      accent: "text-pulse group-hover:text-white transition-colors duration-300",
      bgHover: "group-hover:bg-pulse/10",
      detail: analysis ? `${analysis.skill_matrix.length} verified` : "Unparsed",
      isScore: false,
    },
    {
      label: mode === "HR" ? "Risk Signals" : "Skill Gaps",
      value: mode === "HR" ? analysis?.reasons.length ?? 0 : analysis?.skill_matrix.filter((item) => item.confidence < 70).length ?? 0,
      suffix: "",
      icon: AlertTriangle,
      accent: analysis?.risk_level === "High" ? "text-danger" : "text-neon",
      bgHover: analysis?.risk_level === "High" ? "group-hover:bg-danger/10" : "group-hover:bg-neon/10",
      detail: analysis ? (mode === "HR" ? `${analysis.alerts.length} active flags` : `${analysis.alerts.length} flags`) : "No findings",
      isScore: false,
    },
    {
      label: mode === "HR" ? "Timeline Events" : "Practice Band",
      value: mode === "HR" ? analysis?.timeline.events.length ?? parsedResume?.experience.length ?? 0 : assessment?.overall_score ?? 0,
      suffix: "",
      icon: Radar,
      accent: "text-white/80 group-hover:text-white transition-colors duration-300",
      bgHover: "group-hover:bg-white/10",
      detail:
        mode === "HR"
          ? analysis
            ? `${analysis.timeline.gaps.length} gaps found`
            : "Waiting for chronology"
          : assessment
            ? `${assessment.performance_band} band`
            : "Take the adaptive test",
      isScore: false,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="group relative overflow-hidden rounded-[24px] bg-white/[0.02] border border-white/[0.05] p-5 transition-all duration-500 hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/40 mb-1">{card.label}</p>
                </div>
                {!card.isScore && (
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white/5 border border-white/5 transition-colors duration-300 ${card.bgHover}`}>
                    <Icon className={card.accent} size={18} />
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl lg:text-5xl font-semibold tracking-tighter text-white/95">
                      {card.value}
                    </span>
                    {card.suffix && <span className="text-sm font-medium text-white/40">{card.suffix}</span>}
                  </div>
                  <p className="mt-2 text-[13px] font-medium text-white/50">{card.detail}</p>
                </div>

                {card.isScore && analysis && (
                  <div className="relative flex items-center justify-center h-16 w-16 mb-1">
                    <svg className="absolute inset-0 h-full w-full -rotate-90">
                      <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                      <circle 
                        cx="32" cy="32" r="22" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeLinecap="round"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringOffset}
                        className="text-neon drop-shadow-[0_0_8px_rgba(var(--neon-rgb),0.5)] transition-all duration-1000 ease-out" 
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            {/* Soft background hover glow */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-white/5 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 mix-blend-overlay" />
          </div>
        );
      })}
    </div>
  );
});
