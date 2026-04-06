"use client";

import dynamic from "next/dynamic";
import { Activity, RefreshCcw, ShieldAlert, ShieldCheck, Sparkles, XCircle } from "lucide-react";

import { CapabilityRealityPanel } from "@/components/capability-reality-panel";
import { ResumeIntakeCard } from "@/components/shared/resume-intake-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/workspace/page-header";
import { useAnalysisActions } from "@/components/analysis-provider";
import { buildAuthenticityInsight } from "@/lib/capability-insights";
import { buildPatternSignals, buildRiskBreakdown } from "@/lib/derived-insights";
import { getStatusVariant } from "@/lib/utils";
import { useAppMode, useResumeStore } from "@/store/app-store";

const InsightsVisualizations = dynamic(
  () =>
    import("@/components/hiring-insights/insights-visualizations").then(
      (module) => module.InsightsVisualizations
    ),
  {
    ssr: false,
    loading: () => <InsightsSkeleton />,
  }
);

export function HiringInsightsWorkspace() {
  const { mode } = useAppMode();
  const analysis = useResumeStore((state) => state.analysis);
  const assessment = useResumeStore((state) => state.assessment);
  const parsedResume = useResumeStore((state) => state.parsedResume);
  const isAnalyzing = useResumeStore((state) => state.isAnalyzing);
  const { refreshScore } = useAnalysisActions();
  const insight = buildAuthenticityInsight(mode, analysis, assessment);
  const riskBreakdown = buildRiskBreakdown(analysis, assessment);
  const patterns = buildPatternSignals(analysis, assessment);
  const maxBreakdownValue = Math.max(...riskBreakdown.map((item) => item.value), 1);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={mode === "HR" ? "Hiring Insights" : "Capability Insights"}
        title={
          mode === "HR"
            ? "Signal-heavy hiring insights without dashboard clutter."
            : "Capability patterns and credibility signals without dashboard clutter."
        }
        description={
          mode === "HR"
            ? "This screen is only for insights: skill bar charts, capability radar, risk breakdown, and pattern detection."
            : "This screen is only for insights: skill distribution, capability radar, risk breakdown, and pattern detection."
        }
        actions={
          <Button onClick={() => void refreshScore()} variant="secondary">
            <RefreshCcw size={15} />
            Refresh Score
          </Button>
        }
      />

      {!parsedResume ? (
        <ResumeIntakeCard />
      ) : isAnalyzing && !analysis ? (
        <InsightsSkeleton />
      ) : !analysis ? (
        <ResumeIntakeCard />
      ) : (
        <>
          <DecisionBanner
            candidateName={parsedResume.candidate_name}
            baselineScore={analysis.score}
            overallScore={assessment?.overall_score ?? null}
            credibilityScore={assessment?.credibility_score ?? null}
            insight={insight}
          />

          <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
            <Card variant="default" className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{mode === "HR" ? "Risk Breakdown" : "Readiness Breakdown"}</Badge>
                <Badge variant={getStatusVariant(analysis.risk_level)}>{analysis.risk_level}</Badge>
              </div>

              <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-white/52">Active candidate</p>
                <p className="mt-2 font-display text-3xl text-white">{parsedResume.candidate_name}</p>
                <p className="mt-3 text-sm leading-7 text-white/68">
                  {analysis.ai_summary}
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {riskBreakdown.map((item) => (
                  <div key={item.label} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{item.label}</p>
                        <p className="mt-1 text-sm text-white/56">{item.detail}</p>
                      </div>
                      <span className="font-display text-2xl text-white">{item.value}</span>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-white/[0.06]">
                      <div
                        className="h-2 rounded-full bg-[linear-gradient(90deg,rgba(106,233,214,1),rgba(255,190,108,1))]"
                        style={{ width: `${(item.value / maxBreakdownValue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <InsightsVisualizations analysis={analysis} assessment={assessment} />
          </div>

          <CapabilityRealityPanel analysis={analysis} assessment={assessment} />

          <Card variant="default" className="p-6">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-neon" />
              <p className="section-kicker">Pattern Detection</p>
            </div>
            <h2 className="mt-3 font-display text-2xl text-white">
              Candidate patterns that matter to the decision
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {patterns.map((pattern) => (
                <div
                  key={pattern.title}
                  className={`rounded-[24px] border p-4 ${
                    pattern.tone === "positive"
                      ? "border-neon/20 bg-neon/10"
                      : pattern.tone === "watch"
                        ? "border-pulse/20 bg-pulse/10"
                        : "border-danger/20 bg-danger/10"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {pattern.tone === "positive" ? (
                      <Activity size={15} className="text-neon" />
                    ) : (
                      <ShieldAlert
                        size={15}
                        className={pattern.tone === "watch" ? "text-pulse" : "text-danger"}
                      />
                    )}
                    <p className="font-medium text-white">{pattern.title}</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/78">{pattern.detail}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function DecisionBanner({
  candidateName,
  baselineScore,
  overallScore,
  credibilityScore,
  insight,
}: {
  candidateName: string;
  baselineScore: number;
  overallScore: number | null;
  credibilityScore: number | null;
  insight: ReturnType<typeof buildAuthenticityInsight>;
}) {
  if (!insight) {
    return null;
  }

  const toneClass =
    insight.decisionStatus === "reject"
      ? "border-danger/25 bg-danger/10"
      : insight.decisionStatus === "pass"
        ? "border-neon/25 bg-neon/10"
        : "border-pulse/25 bg-pulse/10";

  const Icon =
    insight.decisionStatus === "reject"
      ? XCircle
      : insight.decisionStatus === "pass"
        ? ShieldCheck
        : ShieldAlert;

  return (
    <Card variant="default" className={`p-6 ${toneClass}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                insight.decisionStatus === "reject"
                  ? "danger"
                  : insight.decisionStatus === "pass"
                    ? "success"
                    : "warning"
              }
            >
              Final Decision
            </Badge>
            <Badge variant="outline">{candidateName}</Badge>
          </div>
          <h2 className="mt-4 font-display text-3xl text-white">{insight.decisionTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-white/84">{insight.decisionMessage}</p>
          <p className="mt-3 text-sm leading-7 text-white/68">{insight.summary}</p>
        </div>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.06]">
          <Icon
            size={24}
            className={
              insight.decisionStatus === "reject"
                ? "text-danger"
                : insight.decisionStatus === "pass"
                  ? "text-neon"
                  : "text-pulse"
            }
          />
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <DecisionMetric label="Resume Score" value={`${baselineScore}/100`} />
        <DecisionMetric label="Test Score" value={overallScore !== null ? `${overallScore}/100` : "Pending"} />
        <DecisionMetric label="Credibility Score" value={credibilityScore !== null ? `${credibilityScore}/100` : "Pending"} />
        <DecisionMetric label="Claim Verdict" value={insight.verdict} />
      </div>
    </Card>
  );
}

function DecisionMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">{label}</p>
      <p className="mt-2 font-display text-2xl text-white">{value}</p>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <Card variant="default" className="p-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-5 h-36 w-full" />
        <Skeleton className="mt-4 h-24 w-full" />
        <Skeleton className="mt-4 h-24 w-full" />
      </Card>
      <Card variant="default" className="p-6">
        <Skeleton className="h-4 w-28" />
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-[320px] w-full" />
          <Skeleton className="h-[320px] w-full" />
        </div>
      </Card>
    </div>
  );
}
