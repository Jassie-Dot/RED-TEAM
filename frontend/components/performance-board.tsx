"use client";

import { Target, TrendingUp, TriangleAlert } from "lucide-react";

import { useAppMode } from "@/store/app-store";
import type { AssessmentEvaluationResponse } from "@/types/resume";

export function PerformanceBoard({ assessment }: { assessment: AssessmentEvaluationResponse | null }) {
  const { mode } = useAppMode();

  return (
    <section className="glass-panel neon-border rounded-[30px] p-5">
      <p className="section-kicker text-pulse/85">{mode === "HR" ? "Evaluation Board" : "Performance Board"}</p>
      <h2 className="mt-2 font-display text-2xl text-white">
        {mode === "HR" ? "How convincing the answers were under pressure" : "How your practice responses translated into readiness"}
      </h2>

      {!assessment ? (
        <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-6 text-center text-sm text-white/60">
          {mode === "HR"
            ? "Evaluate candidate answers to see where confidence is earned versus where deeper verification is still needed."
            : "Complete the adaptive test to unlock a performance summary, targeted risks, and a next-step roadmap."}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <MetricCard label="Overall Score" value={`${assessment.overall_score}%`} icon={TrendingUp} tone="neon" />
            <MetricCard label="Performance Band" value={assessment.performance_band} icon={Target} tone="pulse" />
            <MetricCard label="Credibility Score" value={`${assessment.credibility_score}%`} icon={TriangleAlert} tone="danger" />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <DetailColumn
              title="Strengths"
              items={assessment.strengths}
              emptyLabel="No strengths have been surfaced yet."
              className="border-neon/20 bg-neon/10"
            />
            <DetailColumn
              title="Risks"
              items={assessment.risks}
              emptyLabel="No major risks were detected."
              className="border-danger/20 bg-danger/10"
            />
            <DetailColumn
              title="Roadmap"
              items={assessment.roadmap}
              emptyLabel="Roadmap items will appear after scoring."
              className="border-pulse/20 bg-pulse/10"
            />
          </div>
        </div>
      )}
    </section>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof TrendingUp;
  tone: "neon" | "pulse" | "danger";
}) {
  return (
    <div className={`rounded-[24px] border p-4 ${tone === "neon" ? "border-neon/20 bg-neon/10" : tone === "pulse" ? "border-pulse/20 bg-pulse/10" : "border-danger/20 bg-danger/10"}`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">{label}</p>
        <Icon size={16} className="text-white/78" />
      </div>
      <p className="mt-3 font-display text-3xl text-white">{value}</p>
    </div>
  );
}

function DetailColumn({
  title,
  items,
  emptyLabel,
  className,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
  className: string;
}) {
  return (
    <div className={`rounded-[24px] border p-4 ${className}`}>
      <p className="section-kicker text-white/72">{title}</p>
      <div className="mt-3 space-y-2 text-sm leading-7 text-white/84">
        {items.length ? items.map((item) => <p key={item}>{item}</p>) : <p className="text-white/60">{emptyLabel}</p>}
      </div>
    </div>
  );
}
