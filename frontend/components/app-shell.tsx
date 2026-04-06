"use client";

import Link from "next/link";
import { Gauge, Settings2, ShieldCheck, UserRound, Workflow } from "lucide-react";
import dynamic from "next/dynamic";

import { ModeToggle } from "@/components/mode-toggle";
import { ParticleBackground } from "@/components/particle-background";
import { SentinelLauncher } from "@/components/sentinel-launcher";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { WorkflowStrip } from "@/components/workflow-strip";
import { WorkspaceTabs } from "@/components/workspace/workspace-tabs";
import { getModeConfig } from "@/lib/mode-config";
import { getJourneyStage } from "@/lib/workspace";
import { formatScore } from "@/lib/utils";
import { useAppMode, useResumeStore, useUIStore } from "@/store/app-store";

const SentinelChatPanel = dynamic(
  () => import("@/components/sentinel-chat").then((module) => module.SentinelChatPanel),
  {
    ssr: false,
    loading: () => null,
  }
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const { mode } = useAppMode();
  const modeConfig = getModeConfig(mode);
  const sentinelOpen = useUIStore((state) => state.sentinelOpen);
  const analysis = useResumeStore((state) => state.analysis);
  const assessment = useResumeStore((state) => state.assessment);
  const parsedResume = useResumeStore((state) => state.parsedResume);
  const stage = getJourneyStage(parsedResume, analysis, assessment);
  const stageMeta =
    stage === "upload"
      ? { title: "Resume Intake", detail: "Awaiting source document" }
      : stage === "analysis"
        ? { title: "AI Analysis", detail: "Scoring and evidence review" }
        : stage === "test"
          ? { title: "Capability Test", detail: "Live validation running" }
          : { title: "Decision Ready", detail: "Verdict and insights unlocked" };
  const scoreTone = !analysis
    ? "neutral"
    : analysis.score >= 80
      ? "success"
      : analysis.score >= 55
        ? "warning"
        : "danger";

  return (
    <div className="app-background relative min-h-screen font-body text-white">
      <ParticleBackground />

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 pb-12 pt-5 sm:px-6 xl:px-8">
        <header className="mb-8">
          <div className="glass-panel-strong neon-border overflow-hidden rounded-[36px] px-5 py-5 sm:px-6 sm:py-6 xl:px-7">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="pointer-events-none absolute -right-20 top-[-4.5rem] h-52 w-52 rounded-full bg-neon/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-[-5rem] left-[-3rem] h-48 w-48 rounded-full bg-pulse/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 max-w-4xl">
                  <div className="mb-4 flex flex-wrap items-center gap-2.5">
                    <div className="surface-outline inline-flex items-center gap-3 rounded-full px-3 py-2 pr-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-neon/25 bg-neon/10 text-neon shadow-neon">
                        <ShieldCheck size={16} />
                      </div>
                      <div className="leading-none">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/42">
                          Vigil-AI
                        </p>
                        <p className="mt-1 text-sm font-medium text-white">Fake Resume Detector</p>
                      </div>
                    </div>
                    <Badge className="mode-chip">{modeConfig.badge}</Badge>
                    <Badge variant="outline">SentinelX Live</Badge>
                  </div>

                  <h1 className="max-w-3xl font-display text-3xl font-semibold tracking-tight text-white sm:text-[2.5rem] xl:text-[3.1rem]">
                    World-class AI recruiting intelligence with cleaner trust signals.
                  </h1>
                  <p className="mt-3 max-w-2xl text-[15px] leading-8 text-white/58 sm:text-base">
                    {modeConfig.platformTagline}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-4 xl:items-end">
                  <div className="flex flex-wrap gap-3 xl:justify-end">
                    <ModeToggle />
                    <Link href="/settings" className={buttonStyles({ variant: "secondary", size: "sm" })}>
                      <Settings2 size={16} />
                      Settings
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-3 xl:justify-end">
                    <StatusBadge
                      icon={UserRound}
                      label="Candidate"
                      value={parsedResume?.candidate_name || "Awaiting resume"}
                      detail={parsedResume?.email || "Profile will appear after intake"}
                    />
                    <StatusBadge
                      icon={Gauge}
                      label={mode === "HR" ? "Trust Score" : "Readiness"}
                      value={
                        assessment && mode !== "HR"
                          ? formatScore(assessment.overall_score)
                          : analysis
                            ? formatScore(analysis.score)
                            : "Pending Scan"
                      }
                      detail={
                        analysis
                          ? analysis.risk_level
                          : assessment && mode !== "HR"
                            ? `${assessment.performance_band} performance`
                            : "Waiting for AI review"
                      }
                      tone={scoreTone}
                    />
                    <StatusBadge
                      icon={Workflow}
                      label="Stage"
                      value={stageMeta.title}
                      detail={stageMeta.detail}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
                <WorkflowStrip />
                <WorkspaceTabs />
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 animate-in fade-in duration-700 ease-out delay-150 fill-mode-both">
          {children}
        </main>
      </div>

      <SentinelLauncher />
      {sentinelOpen ? <SentinelChatPanel /> : null}
    </div>
  );
}

function StatusBadge({
  icon: Icon,
  label,
  value,
  detail,
  tone = "neutral",
}: {
  icon: any;
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "border-success/20 bg-success/10 text-success"
      : tone === "warning"
        ? "border-warning/20 bg-warning/10 text-warning"
        : tone === "danger"
          ? "border-danger/20 bg-danger/10 text-danger"
          : "border-white/10 bg-white/[0.04] text-white/52";

  return (
    <div className="surface-outline flex min-w-[180px] items-center gap-3 rounded-[20px] px-3.5 py-3 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]">
      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${toneClass}`}>
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">{label}</div>
        <div className="mt-1 truncate text-[13px] font-semibold tracking-tight text-white/88">{value}</div>
        <div className="mt-1 truncate text-[11px] text-white/46">{detail}</div>
      </div>
    </div>
  );
}
