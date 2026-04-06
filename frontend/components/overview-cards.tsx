"use client";

import { AlertTriangle, Binary, Radar, Shield } from "lucide-react";
import { memo } from "react";

import { CountUp } from "@/components/count-up";
import { useAppMode, useResumeStore } from "@/store/app-store";

const cardStyles = [
  "from-neon/16 via-neon/8 to-transparent",
  "from-pulse/16 via-pulse/8 to-transparent",
  "from-danger/16 via-danger/8 to-transparent",
  "from-white/10 via-white/4 to-transparent",
];

export const OverviewCards = memo(function OverviewCards() {
  const { mode } = useAppMode();
  const analysis = useResumeStore((state) => state.analysis);
  const assessment = useResumeStore((state) => state.assessment);
  const parsedResume = useResumeStore((state) => state.parsedResume);

  const cards = [
    {
      label: mode === "HR" ? "Trust Score" : "Credibility Baseline",
      value: analysis ? <CountUp value={analysis.score} /> : "--",
      suffix: "/100",
      icon: Shield,
      accent: "text-neon",
      detail: analysis ? `${analysis.risk_level} risk level` : "Awaiting analysis",
    },
    {
      label: mode === "HR" ? "Skill Inventory" : "Claimed Skills",
      value: parsedResume?.skills.length ?? 0,
      suffix: "",
      icon: Binary,
      accent: "text-pulse",
      detail: analysis ? `${analysis.skill_matrix.length} verified skills` : "Resume not parsed yet",
    },
    {
      label: mode === "HR" ? "Risk Signals" : "Skill Gaps",
      value: mode === "HR" ? analysis?.reasons.length ?? 0 : analysis?.skill_matrix.filter((item) => item.confidence < 70).length ?? 0,
      suffix: "",
      icon: AlertTriangle,
      accent: analysis?.risk_level === "High" ? "text-danger" : "text-neon",
      detail: analysis ? (mode === "HR" ? `${analysis.alerts.length} active alerts` : `${analysis.alerts.length} credibility flags`) : "No findings yet",
    },
    {
      label: mode === "HR" ? "Timeline Checks" : "Practice Score",
      value: mode === "HR" ? analysis?.timeline.events.length ?? parsedResume?.experience.length ?? 0 : assessment?.overall_score ?? 0,
      suffix: "",
      icon: Radar,
      accent: "text-white",
      detail:
        mode === "HR"
          ? analysis
            ? `${analysis.timeline.gaps.length} gaps, ${analysis.timeline.overlaps.length} overlaps`
            : "Waiting for chronology scan"
          : assessment
            ? `${assessment.performance_band} band`
            : "Take the adaptive test to score readiness",
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="glass-panel neon-border relative overflow-hidden rounded-[28px] p-5">
            <div className={`absolute inset-0 bg-gradient-to-br ${cardStyles[index]} opacity-80`} />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/45">{card.label}</p>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <Icon className={card.accent} size={18} />
                </div>
              </div>
              <div className="mt-5 flex items-end gap-1.5">
                <span className="font-display text-4xl text-white">{card.value}</span>
                {card.suffix ? <span className="mb-1 text-xs text-white/42">{card.suffix}</span> : null}
              </div>
              <p className="mt-3 text-sm text-white/62">{card.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
});
