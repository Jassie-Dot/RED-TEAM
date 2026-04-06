"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileSearch,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
  Zap,
} from "lucide-react";

import { CountUp } from "@/components/count-up";
import { ResumeIntakeCard } from "@/components/shared/resume-intake-card";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildAuthenticityInsight } from "@/lib/capability-insights";
import { getNextBestAction } from "@/lib/workspace";
import { clampCopy, getStatusVariant } from "@/lib/utils";
import { useAppMode, useResumeStore } from "@/store/app-store";

export function DashboardOverview() {
  const { mode } = useAppMode();
  const parsedResume = useResumeStore((state) => state.parsedResume);
  const analysis = useResumeStore((state) => state.analysis);
  const assessment = useResumeStore((state) => state.assessment);
  const isAnalyzing = useResumeStore((state) => state.isAnalyzing);
  const hasCandidate = Boolean(parsedResume);
  const insight = buildAuthenticityInsight(mode, analysis, assessment);
  const summary = clampCopy(
    analysis?.ai_summary,
    parsedResume
      ? "Resume loaded. Review the full analysis, then run the capability test to validate the strongest claims."
      : "Upload a document to generate a trust baseline, capability scan, and AI-driven summary for the active profile."
  );
  const nextAction = getNextBestAction(parsedResume, analysis, assessment);
  const score = analysis?.score ?? 0;
  const scoreTone = !analysis ? "neutral" : score >= 80 ? "success" : score >= 55 ? "warning" : "danger";

  return (
    <div className="space-y-6 animate-in fade-in duration-700 ease-out fill-mode-both">
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="grid gap-6 xl:grid-cols-[1.16fr_0.84fr]"
      >
        <Card variant="strong" className="overflow-hidden p-6 md:p-8">
          <div className="pointer-events-none absolute -right-16 top-[-5rem] h-56 w-56 rounded-full bg-neon/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-6rem] left-[-4rem] h-52 w-52 rounded-full bg-pulse/10 blur-3xl" />

          <div className="relative z-10 grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
            <div className="flex h-full flex-col justify-between">
              <div>
                <div className="mb-8 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">Primary Overview</Badge>
                  <Badge variant={getStatusVariant(analysis?.risk_level)}>
                    {analysis?.risk_level || "Analysis Pending"}
                  </Badge>
                  {assessment ? (
                    <Badge variant="success">
                      {mode === "HR" ? "Capability scored" : assessment.performance_band}
                    </Badge>
                  ) : null}
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-neon" />
                    <p className="section-kicker">Active Profile</p>
                  </div>
                  <h1 className="max-w-2xl font-display text-4xl font-semibold leading-[1.04] text-white sm:text-5xl">
                    {parsedResume?.candidate_name || "Turn resumes into trustworthy hiring signals."}
                  </h1>
                  <p className="mt-4 max-w-xl text-[15px] leading-8 text-white/58">{summary}</p>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <InsightCard icon={Workflow} label="Next Best Action" value={nextAction} tone="neutral" />
                  <InsightCard
                    icon={Sparkles}
                    label="AI Summary"
                    value={
                      analysis?.recommendation ||
                      "Upload a candidate dossier to generate recommendations, trust scoring, and capability guidance."
                    }
                    tone={scoreTone}
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/resume-analysis#resume-studio" className={buttonStyles({ variant: "primary", size: "md" })}>
                  <FileSearch size={16} />
                  Open Resume Studio
                </Link>
                <Link href="/resume-analysis" className={buttonStyles({ variant: "secondary", size: "md" })}>
                  <Sparkles size={16} />
                  View Analysis
                </Link>
                <Link href="/student-lab" className={buttonStyles({ variant: "ghost", size: "md" })}>
                  Launch Capability Test
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="surface-outline grid-glow overflow-hidden rounded-[32px] p-6">
                <div className="relative z-10 flex flex-col gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="section-kicker">{mode === "HR" ? "Trust Score" : "Capability Trust"}</p>
                      <p className="mt-2 text-sm text-white/56">
                        Live baseline from the uploaded resume and AI evidence engine.
                      </p>
                    </div>
                    <Badge variant={getStatusVariant(analysis?.risk_level)}>
                      {analysis?.risk_level || "Pending"}
                    </Badge>
                  </div>

                  <TrustScoreRing score={score} active={Boolean(analysis)} tone={scoreTone} />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <MetricCard
                      label="Verdict"
                      value={insight?.verdict || "Awaiting verdict"}
                      detail={analysis?.recommendation || "The assistant will explain the trust posture here."}
                    />
                    <MetricCard
                      label="Stage"
                      value={
                        !parsedResume
                          ? "Intake"
                          : !analysis
                            ? "Analysis"
                            : !assessment
                              ? "Capability Test"
                              : "Final Verdict"
                      }
                      detail={
                        hasCandidate
                          ? "Profile is live inside the workspace"
                          : "Resume upload unlocks the recruiting flow"
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <QuickStat
                  icon={Target}
                  label="Readiness"
                  value={analysis ? `${analysis.score}/100` : "--"}
                  detail={analysis?.risk_level || "Waiting for score"}
                />
                <QuickStat
                  icon={Zap}
                  label="Capability Pack"
                  value={assessment ? "Scored" : hasCandidate ? "Ready to launch" : "Standby"}
                  detail={isAnalyzing ? "Processing in background" : "Adaptive prompts and scoring"}
                />
              </div>
            </div>
          </div>
        </Card>

        <ResumeIntakeCard />
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewMetric
          label="Active Candidate"
          value={parsedResume?.candidate_name || "No dossier"}
          detail={parsedResume?.email || "Upload a resume to initialize the workspace"}
        />
        <OverviewMetric
          label="AI Analysis"
          value={analysis ? analysis.risk_level : "Pending"}
          detail={analysis ? `${analysis.reasons.length} trust factors reviewed` : "Parser and scoring are waiting for input"}
        />
        <OverviewMetric
          label="Capability Testing"
          value={assessment ? `${assessment.overall_score}%` : "Not scored"}
          detail={assessment ? assessment.performance_band : "Question pack generates after analysis"}
        />
        <OverviewMetric
          label="Decision Readiness"
          value={hasCandidate ? (assessment ? "Ready" : "In Progress") : "Locked"}
          detail={
            insight?.summary ||
            "Complete intake, analysis, and capability validation to unlock the final verdict."
          }
        />
      </section>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
  tone: "neutral" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "border-success/20 bg-success/10"
      : tone === "warning"
        ? "border-warning/20 bg-warning/10"
        : tone === "danger"
          ? "border-danger/20 bg-danger/10"
          : "border-white/10 bg-white/[0.04]";

  return (
    <div className={`rounded-[24px] border p-4 ${toneClass}`}>
      <div className="mb-2 flex items-center gap-2">
        <Icon size={14} className="text-white/76" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">{label}</p>
      </div>
      <p className="text-[13px] leading-7 text-white/82">{value}</p>
    </div>
  );
}

function TrustScoreRing({
  score,
  active,
  tone,
}: {
  score: number;
  active: boolean;
  tone: "neutral" | "success" | "warning" | "danger";
}) {
  const angle = Math.max(8, Math.min(100, score)) * 3.6;
  const gradient =
    tone === "success"
      ? `conic-gradient(from 180deg, rgba(var(--success-rgb),1), rgba(var(--neon-rgb),0.85) ${angle}deg, rgba(255,255,255,0.08) 0deg)`
      : tone === "warning"
        ? `conic-gradient(from 180deg, rgba(var(--warning-rgb),1), rgba(var(--neon-rgb),0.85) ${angle}deg, rgba(255,255,255,0.08) 0deg)`
        : tone === "danger"
          ? `conic-gradient(from 180deg, rgba(var(--danger-rgb),1), rgba(var(--warning-rgb),0.92) ${angle}deg, rgba(255,255,255,0.08) 0deg)`
          : `conic-gradient(from 180deg, rgba(var(--neon-rgb),0.9), rgba(var(--pulse-rgb),0.82) ${angle}deg, rgba(255,255,255,0.08) 0deg)`;

  return (
    <div className="flex items-center justify-center">
      <div className="halo-ring relative flex h-[220px] w-[220px] items-center justify-center rounded-full">
        <div
          className="absolute inset-0 rounded-full border border-white/10"
          style={{
            background: active
              ? gradient
              : "conic-gradient(from 180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
          }}
        />
        <div className="absolute inset-[16px] rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),rgba(4,8,18,0.96)_72%)] backdrop-blur-xl" />
        <div className="relative z-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Baseline Score</p>
          <div className="mt-3 font-display text-6xl font-semibold tracking-tight text-white">
            {active ? <CountUp value={score} /> : "--"}
          </div>
          <p className="mt-2 text-sm text-white/50">{active ? "of 100 trust points" : "Awaiting analysis"}</p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">{label}</p>
      <p className="mt-2 text-[15px] font-semibold text-white/92">{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/56">{detail}</p>
    </div>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">{label}</p>
        <Icon size={16} className="text-white/62" />
      </div>
      <p className="mt-3 font-display text-2xl text-white">{value}</p>
      <p className="mt-1 text-sm text-white/52">{detail}</p>
    </div>
  );
}

function OverviewMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card variant="default" className="p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">{label}</p>
      <p className="mt-3 font-display text-[1.75rem] leading-tight text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/56">{detail}</p>
    </Card>
  );
}
