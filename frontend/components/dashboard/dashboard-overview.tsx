"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, FileSearch, Sparkles } from "lucide-react";

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
      : "Upload a resume to generate a trust score, risk level, and AI summary for the active candidate."
  );
  const nextAction = getNextBestAction(parsedResume, analysis, assessment);

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className={`grid gap-6 ${
          hasCandidate ? "xl:grid-cols-[1.35fr_0.65fr]" : "xl:grid-cols-[0.9fr_1.1fr]"
        }`}
      >
        <Card
          variant="strong"
          className={`overflow-hidden p-6 md:p-7 ${hasCandidate ? "" : "xl:order-2"}`}
        >
          <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Dashboard</Badge>
                <Badge variant={getStatusVariant(analysis?.risk_level)}>
                  {analysis?.risk_level || "Awaiting analysis"}
                </Badge>
              </div>

              <div className="mt-8">
                <p className="section-kicker">Candidate</p>
                <h1 className="mt-3 font-display text-[2.6rem] leading-tight text-white md:text-[3.2rem]">
                  {parsedResume?.candidate_name || "No candidate selected"}
                </h1>
                <p className="summary-clamp mt-4 max-w-2xl text-base leading-8 text-white/66">
                  {summary}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/resume-analysis#resume-studio" className={buttonStyles({ variant: "primary", size: "lg" })}>
                  <FileSearch size={16} />
                  Open Resume Studio
                </Link>
                <Link href="/resume-analysis" className={buttonStyles({ variant: "secondary", size: "lg" })}>
                  <Sparkles size={16} />
                  View Analysis
                </Link>
                <Link href="/student-lab" className={buttonStyles({ variant: "secondary", size: "lg" })}>
                  <BrainCircuit size={16} />
                  Run Capability Test
                </Link>
                <Link href="/student-lab" className={buttonStyles({ variant: "ghost", size: "lg" })}>
                  <ArrowRight size={16} />
                  Open Interview Engine
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6">
                <p className="section-kicker">Trust Score</p>
                <div className="mt-6 flex items-end gap-2">
                  <span className="font-display text-[4.4rem] leading-none text-white">
                    {analysis ? analysis.score : "--"}
                  </span>
                  <span className="pb-2 text-base text-white/45">/100</span>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Badge variant={getStatusVariant(analysis?.risk_level)}>
                    {analysis?.risk_level || "Pending"}
                  </Badge>
                  <Badge variant="neutral">{insight?.verdict || "Awaiting verdict"}</Badge>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <StatPanel
                  label="Next Best Action"
                  value={nextAction}
                  highlight={isAnalyzing ? "Analysis running in background" : "Single-purpose workflow"}
                />
                <StatPanel
                  label="AI Summary"
                  value={
                    analysis?.recommendation ||
                    "Open the full analysis or run the interview engine to move deeper into validation."
                  }
                  highlight={parsedResume?.email || parsedResume?.phone || "Candidate profile available after upload"}
                />
              </div>
            </div>
          </div>
        </Card>

        <div className={hasCandidate ? "" : "xl:order-1"}>
          <ResumeIntakeCard />
        </div>
      </motion.section>
    </div>
  );
}

function StatPanel({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-neon" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/44">{label}</p>
      </div>
      <p className="mt-3 text-sm leading-7 text-white/84">{value}</p>
      <p className="mt-4 text-sm text-white/44">{highlight}</p>
    </div>
  );
}
