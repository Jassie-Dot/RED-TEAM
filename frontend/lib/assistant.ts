import type { AppMode } from "@/types/app";
import type { ParsedResume, ResumeAnalysis } from "@/types/resume";

function formatReasons(reasons: string[]) {
  return reasons.slice(0, 3).join(" ");
}

export function createBriefing(mode: AppMode, parsedResume: ParsedResume | null, analysis: ResumeAnalysis | null) {
  if (!parsedResume || !analysis) {
    return mode === "HR"
      ? "Upload a resume to unlock evidence-backed scoring, risk analysis, and recruiter-ready interview guidance."
      : "Upload a resume to map real skill depth, surface exaggeration risks, and build an adaptive improvement roadmap.";
  }

  return mode === "HR"
    ? `${parsedResume.candidate_name} is currently assessed at ${analysis.score}/100 with ${analysis.risk_level.toLowerCase()} risk. Key signals: ${formatReasons(analysis.reasons)}`
    : `${parsedResume.candidate_name}'s profile is scoring ${analysis.score}/100 on credibility and evidence strength. Priority skill gaps: ${formatReasons(analysis.reasons)}`;
}
