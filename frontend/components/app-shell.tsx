"use client";

import Link from "next/link";
import { Settings2 } from "lucide-react";
import dynamic from "next/dynamic";

import { ModeToggle } from "@/components/mode-toggle";
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

  return (
    <div className="app-background relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-[1480px] px-4 pb-10 pt-4 md:px-6 xl:px-8">
        <header className="mb-6">
          <div className="rounded-[32px] border border-white/10 bg-[rgba(8,12,20,0.78)] p-4 shadow-[0_24px_72px_rgba(3,7,18,0.3)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">Vigil-AI</Badge>
                  <Badge variant="neutral">{modeConfig.badge}</Badge>
                </div>
                <h1 className="mt-2.5 font-display text-[1.55rem] leading-tight text-white md:text-[1.9rem]">
                  Recruiting intelligence, rebuilt as a focused SaaS workspace.
                </h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-white/58">
                  {modeConfig.platformTagline}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <StatusPill
                  label="Candidate"
                  value={parsedResume?.candidate_name || "No candidate"}
                />
                <StatusPill
                  label={mode === "HR" ? "Trust" : "Readiness"}
                  value={
                    assessment && mode !== "HR"
                      ? `${assessment.overall_score}%`
                      : analysis
                        ? formatScore(analysis.score)
                        : "Awaiting analysis"
                  }
                  accent={Boolean(analysis || assessment)}
                />
                <StatusPill
                  label="Stage"
                  value={
                    stage === "upload"
                      ? "Upload"
                      : stage === "analysis"
                        ? "Analysis"
                        : stage === "test"
                          ? "Capability Test"
                          : "Verdict"
                  }
                />
                <ModeToggle />
                <Link href="/settings" className={buttonStyles({ variant: "secondary" })}>
                  <Settings2 size={15} />
                  Settings
                </Link>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <WorkflowStrip />
              <WorkspaceTabs />
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>

      <SentinelLauncher />
      {sentinelOpen ? <SentinelChatPanel /> : null}
    </div>
  );
}

function StatusPill({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm ${
        accent
          ? "border-neon/20 bg-neon/10 text-white"
          : "border-white/10 bg-white/[0.04] text-white/74"
      }`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
        {label}
      </span>
      <span className={accent ? "font-medium text-neon" : "font-medium text-white"}>
        {value}
      </span>
    </div>
  );
}
