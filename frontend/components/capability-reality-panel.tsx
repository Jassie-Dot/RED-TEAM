"use client";

import { ShieldAlert, ShieldCheck, Sparkles, Target } from "lucide-react";

import { buildAuthenticityInsight, buildCapabilityRealityRows } from "@/lib/capability-insights";
import { useAppMode } from "@/store/app-store";
import type { AssessmentEvaluationResponse, ResumeAnalysis } from "@/types/resume";

export function CapabilityRealityPanel({
  analysis,
  assessment,
}: {
  analysis: ResumeAnalysis | null;
  assessment: AssessmentEvaluationResponse | null;
}) {
  const { mode } = useAppMode();
  const insight = buildAuthenticityInsight(mode, analysis, assessment);
  const rows = buildCapabilityRealityRows(analysis, assessment);

  const verdictClass =
    insight?.tone === "validated"
      ? "border-neon/20 bg-neon/10"
      : insight?.tone === "exaggerated"
        ? "border-danger/20 bg-danger/10"
        : "border-pulse/20 bg-pulse/10";

  return (
    <section className="glass-panel neon-border rounded-[30px] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="section-kicker text-neon/85">Capability Reality</p>
        <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${verdictClass}`}>
          {mode === "HR" ? "Fake vs real analysis" : "Claim vs actual analysis"}
        </span>
      </div>
      <h2 className="mt-3 font-display text-2xl text-white">Claimed skills versus actual demonstrated capability</h2>

      {!analysis ? (
        <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-6 text-center text-sm leading-7 text-white/60">
          Upload and analyze a resume first. After the capability test, this panel will show whether the profile looks real,
          mixed, or exaggerated, together with the gap between claimed and demonstrated skills.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <InsightCard label="Baseline Resume Score" value={`${analysis.score}/100`} icon={Target} tone="neon" />
            <InsightCard label="Live Capability Score" value={insight?.liveScore !== null ? `${insight?.liveScore}/100` : "Pending"} icon={Sparkles} tone="pulse" />
            <InsightCard label="Authenticity Verdict" value={insight?.verdict || "Pending"} icon={insight?.tone === "exaggerated" ? ShieldAlert : ShieldCheck} tone={insight?.tone === "exaggerated" ? "danger" : insight?.tone === "validated" ? "neon" : "pulse"} />
            <InsightCard label={mode === "HR" ? "Exaggerated Claims" : "Skills To Rebuild"} value={`${insight?.exaggeratedCount || 0}`} icon={ShieldAlert} tone="danger" />
          </div>

          <div className={`rounded-[24px] border p-4 ${verdictClass}`}>
            <p className="text-sm leading-7 text-white/84">{insight?.summary}</p>
          </div>

          <div className="space-y-3">
            {rows.length ? (
              rows.slice(0, 8).map((row) => (
                <div key={row.skill} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-xl text-white">{row.skill}</p>
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${
                            row.status === "validated"
                              ? "bg-neon/12 text-neon"
                              : row.status === "exaggerated"
                                ? "bg-danger/12 text-danger"
                                : "bg-pulse/12 text-pulse"
                          }`}
                        >
                          {row.status === "validated" ? "Backed up" : row.status === "exaggerated" ? "Claim exceeds proof" : "Needs more proof"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/62">{row.evidence}</p>
                    </div>
                    <div className="min-w-[120px] rounded-[20px] border border-white/10 bg-white/[0.04] px-3 py-2 text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">Resume confidence</p>
                      <p className="mt-2 font-display text-2xl text-white">{row.confidence}%</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <Metric title="Claimed Level" value={row.claimedLevel} />
                    <Metric title="Resume Verified" value={row.verifiedLevel} />
                    <Metric title="Test Score" value={row.testScore !== null ? `${row.testScore}%` : "Pending"} />
                    <Metric title="Actual Level" value={`${row.actualLevel} (${row.actualScore}/100)`} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/64">{row.actualCapability}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-sm text-white/60">
                No skill matrix is available yet.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function InsightCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Target;
  tone: "neon" | "pulse" | "danger";
}) {
  return (
    <div className={`rounded-[24px] border p-4 ${tone === "neon" ? "border-neon/20 bg-neon/10" : tone === "pulse" ? "border-pulse/20 bg-pulse/10" : "border-danger/20 bg-danger/10"}`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">{label}</p>
        <Icon size={16} className="text-white/78" />
      </div>
      <p className="mt-3 font-display text-2xl text-white">{value}</p>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/82">{value}</p>
    </div>
  );
}
