"use client";

import { BrainCircuit, CheckCircle2, FileUp, ScanSearch, ShieldCheck } from "lucide-react";
import { memo } from "react";

import { Progress } from "@/components/ui/progress";
import { getJourneyStage, getWorkflowSteps } from "@/lib/workspace";
import { useResumeStore } from "@/store/app-store";

export const WorkflowStrip = memo(function WorkflowStrip() {
  const analysis = useResumeStore((state) => state.analysis);
  const assessment = useResumeStore((state) => state.assessment);
  const parsedResume = useResumeStore((state) => state.parsedResume);
  const questions = useResumeStore((state) => state.questions);
  const stage = getJourneyStage(parsedResume, analysis, assessment);
  const steps = getWorkflowSteps(parsedResume, analysis, assessment, questions);
  const progressValue =
    stage === "upload" ? 8 : stage === "analysis" ? 38 : stage === "test" ? 72 : 100;
  const icons = [FileUp, ScanSearch, BrainCircuit, ShieldCheck];

  return (
    <div className="glass-panel rounded-[26px] p-3.5">
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="section-kicker">Workflow</p>
            <p className="mt-1.5 text-sm text-white/60">
              Upload resume, run analysis, pressure-test capability, then review the verdict.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-white/68">
            {steps.filter((step) => step.complete).length} of {steps.length} steps complete
          </div>
        </div>

        <Progress value={progressValue} />

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = icons[index];
            return (
              <div
                key={step.label}
                className={`flex h-full items-center gap-3 rounded-[22px] border px-3.5 py-3 ${
                  step.active
                    ? "border-neon/20 bg-neon/[0.08] shadow-[0_18px_50px_rgba(62,214,194,0.12)]"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border ${
                    step.complete || step.active
                      ? "border-neon/25 bg-neon/10 text-neon"
                      : "border-white/10 bg-white/[0.04] text-white/35"
                  }`}
                >
                  {step.complete ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
                    Step {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">{step.label}</p>
                  <p className="mt-1 text-xs leading-5 text-white/52">{step.description}</p>
                </div>
                <div className="ml-auto">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      step.complete || step.active
                        ? "bg-neon shadow-[0_0_16px_rgba(62,214,194,0.9)]"
                        : "bg-white/20"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
