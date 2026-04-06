"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Check, FileUp, ScanSearch, ShieldCheck } from "lucide-react";
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
    stage === "upload" ? 12 : stage === "analysis" ? 38 : stage === "test" ? 64 : 100;
  const icons = [FileUp, ScanSearch, BrainCircuit, ShieldCheck];
  const completedCount = steps.filter((step) => step.complete).length;

  return (
    <div className="surface-outline relative flex-1 overflow-hidden rounded-[28px] px-4 py-4 sm:px-5 sm:py-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(var(--neon-rgb),0.1),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(var(--pulse-rgb),0.08),transparent_24%)]" />

      <div className="relative flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-kicker">Workflow Progress</p>
            <p className="mt-1 text-sm text-white/52">
              From intake to verdict, every stage stays visible and decision-ready.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/56">
            {completedCount} / {steps.length} complete
          </div>
        </div>

        <div className="relative hidden xl:block">
          <div className="absolute left-8 right-8 top-[1.15rem] h-px bg-white/10" />
          <motion.div
            className="absolute left-8 top-[1.15rem] h-px rounded-full bg-[linear-gradient(90deg,rgba(var(--neon-rgb),0.95),rgba(var(--pulse-rgb),0.9))] shadow-[0_0_20px_rgba(var(--neon-rgb),0.22)]"
            initial={false}
            animate={{ width: `calc(${progressValue}% - 4rem)` }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <Progress value={progressValue} className="xl:hidden" />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = icons[index];
            const isCompleted = step.complete;
            const isActive = step.active;
            const statusLabel = isCompleted ? "Completed" : isActive ? "Active" : "Pending";

            return (
              <motion.div
                key={step.label}
                whileHover={{ y: -4 }}
                className={`relative rounded-[24px] border p-4 transition-all duration-300 ${
                  isActive
                    ? "border-neon/20 bg-[linear-gradient(180deg,rgba(var(--neon-rgb),0.14),rgba(255,255,255,0.04))] shadow-[0_0_0_1px_rgba(var(--neon-rgb),0.08),0_18px_50px_rgba(var(--neon-rgb),0.12)]"
                    : isCompleted
                      ? "border-success/20 bg-success/10"
                      : "border-white/10 bg-white/[0.03]"
                }`}
              >
                {isActive && (
                  <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-neon to-transparent opacity-90" />
                )}

                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors duration-500 ${
                      isCompleted
                        ? "border-success/25 bg-success/10 text-success"
                        : isActive
                          ? "border-neon/25 bg-neon/10 text-white shadow-[0_0_18px_rgba(var(--neon-rgb),0.22)]"
                          : "border-white/10 bg-white/[0.05] text-white/34"
                    }`}
                  >
                    {isCompleted ? <Check size={16} className="stroke-[3]" /> : <Icon size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-semibold tracking-tight text-white/92">{step.label}</p>
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/48">
                        {statusLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-[12px] leading-5 text-white/48">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
