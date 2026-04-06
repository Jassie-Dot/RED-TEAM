"use client";

import { Power, RotateCcw, ShieldCheck } from "lucide-react";

import { useAnalysisActions } from "@/components/analysis-provider";
import { getModeConfig } from "@/lib/mode-config";
import { useAppMode, useResumeStore } from "@/store/app-store";

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function SettingsPage() {
  const { mode } = useAppMode();
  const modeConfig = getModeConfig(mode);
  const preferences = useResumeStore((state) => state.preferences);
  const { clearSession, updatePreferences } = useAnalysisActions();

  return (
    <div className="space-y-5">
      <section className="glass-panel-strong neon-border rounded-[32px] p-6 md:p-7">
        <p className="section-kicker text-neon/85">Settings</p>
        <h1 className="mt-3 max-w-3xl font-display text-3xl leading-tight text-white md:text-[2.45rem]">
          Tune the workspace behavior and review the live backend connection.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/66">
          These settings shape the browser workflow for {mode === "HR" ? "recruiter intelligence" : "candidate evaluation"}, question generation, and session continuity while the FastAPI backend handles model execution.
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.92fr]">
        <div className="glass-panel neon-border rounded-[30px] p-5">
          <p className="section-kicker text-pulse/85">Workflow Controls</p>
          <div className="mt-5 space-y-3">
            <ToggleCard
              title={mode === "HR" ? "Auto-generate interview prompts" : "Auto-generate adaptive tests"}
              description={mode === "HR" ? "Generate recruiter validation prompts immediately after a resume is analyzed." : "Generate candidate practice drills immediately after a resume is analyzed."}
              activeLabel="Enabled"
              inactiveLabel="Disabled"
              active={preferences.autoGenerateQuestions}
              onClick={() => updatePreferences({ autoGenerateQuestions: !preferences.autoGenerateQuestions })}
              tone="neon"
            />
            <ToggleCard
              title="Strict review mode"
              description="Keep the UI focused on risk visibility and explainable screening signals."
              activeLabel="Armed"
              inactiveLabel="Relaxed"
              active={preferences.strictReviewMode}
              onClick={() => updatePreferences({ strictReviewMode: !preferences.strictReviewMode })}
              tone="pulse"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-panel neon-border rounded-[30px] p-5">
            <p className="section-kicker text-neon/85">{modeConfig.badge}</p>
            <div className="mt-4 space-y-3 text-sm text-white/78">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Frontend API target</p>
                <p className="mt-2 break-all text-white">{apiUrl}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Live AI backend</p>
                <p className="mt-2 leading-7">
                  Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` on the FastAPI service to keep Vigil-AI analysis and SentinelX responses live. `GROQ_API_KEY` remains supported as a fallback provider.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Current mode behavior</p>
                <p className="mt-2 leading-7">{modeConfig.accentSummary}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel neon-border rounded-[30px] p-5">
            <p className="section-kicker text-danger/90">Session Controls</p>
            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={clearSession}
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-danger transition hover:bg-danger/15"
              >
                <RotateCcw size={14} />
                Clear Active Session
              </button>
              <InfoCard
                icon={ShieldCheck}
                iconClassName="text-neon"
                title="Operational note"
                description="Session state stays in browser storage and resume analysis persists on the backend so reports, messages, and generated questions remain available across visits."
              />
              <InfoCard
                icon={Power}
                iconClassName="text-pulse"
                title="Launch mode"
                description="Run the FastAPI backend and Next.js frontend together to keep upload, analysis, and assistant messaging fully live."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleCard({
  title,
  description,
  activeLabel,
  inactiveLabel,
  active,
  onClick,
  tone,
}: {
  title: string;
  description: string;
  activeLabel: string;
  inactiveLabel: string;
  active: boolean;
  onClick: () => void;
  tone: "neon" | "pulse";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-[24px] border px-4 py-4 text-left transition ${
        tone === "neon" ? "border-white/10 bg-white/[0.04] hover:border-neon/30 hover:bg-neon/10" : "border-white/10 bg-white/[0.04] hover:border-pulse/30 hover:bg-pulse/10"
      }`}
    >
      <div>
        <p className="font-display text-lg text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/62">{description}</p>
      </div>
      <span
        className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] ${
          active
            ? tone === "neon"
              ? "bg-neon/15 text-neon"
              : "bg-pulse/15 text-pulse"
            : "bg-white/10 text-white/60"
        }`}
      >
        {active ? activeLabel : inactiveLabel}
      </span>
    </button>
  );
}

function InfoCard({
  icon: Icon,
  iconClassName,
  title,
  description,
}: {
  icon: typeof ShieldCheck;
  iconClassName: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/75">
      <p className="inline-flex items-center gap-2 font-display text-base text-white">
        <Icon size={15} className={iconClassName} />
        {title}
      </p>
      <p className="mt-2 text-sm leading-7">{description}</p>
    </div>
  );
}
