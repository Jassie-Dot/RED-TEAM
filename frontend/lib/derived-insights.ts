import { buildCapabilityRealityRows } from "@/lib/capability-insights";
import type {
  AssessmentEvaluationResponse,
  ParsedResume,
  QuestionResponse,
  ResumeAnalysis,
} from "@/types/resume";

export interface EvidenceCheck {
  title: string;
  detail: string;
  tone: "validated" | "watch" | "risk";
}

export interface AtsInsight {
  title: string;
  detail: string;
  tone: "positive" | "warning";
}

export interface BreakdownItem {
  label: string;
  value: number;
  detail: string;
}

export interface PatternSignal {
  title: string;
  detail: string;
  tone: "positive" | "watch" | "risk";
}

export function buildEvidenceChecks(analysis: ResumeAnalysis | null): EvidenceCheck[] {
  if (!analysis) {
    return [];
  }

  const checks: EvidenceCheck[] = [
    ...analysis.strengths.slice(0, 2).map((detail, index) => ({
      title: index === 0 ? "Validated Signal" : "Supporting Signal",
      detail,
      tone: "validated" as const,
    })),
    ...analysis.reasons.slice(0, 2).map((detail, index) => ({
      title: index === 0 ? "Primary Concern" : "Watch Item",
      detail,
      tone: analysis.risk_level === "High" || index === 0 ? ("risk" as const) : ("watch" as const),
    })),
    ...analysis.alerts.slice(0, 2).map((detail) => ({
      title: "Alert",
      detail,
      tone: "risk" as const,
    })),
  ];

  return checks.slice(0, 6);
}

export function buildAtsInsights(
  parsedResume: ParsedResume | null,
  analysis: ResumeAnalysis | null
): AtsInsight[] {
  if (!parsedResume) {
    return [];
  }

  const rawText = parsedResume.raw_text || "";
  const sectionKeys = Object.keys(parsedResume.raw_sections || {}).map((key) => key.toLowerCase());
  const lowConfidenceSkills = analysis?.skill_matrix.filter((item) => item.confidence < 60) || [];
  const sparseExperience = parsedResume.experience.filter((entry) => entry.highlights.length < 2).length;
  const hasQuantifiedImpact = /\b\d+([.,]\d+)?(%|x|k|m|b|\+)?\b/i.test(rawText);

  const insights: AtsInsight[] = [];

  insights.push(
    parsedResume.summary
      ? {
          title: "Professional summary is present",
          detail: "The resume already gives ATS scanners and recruiters an immediate framing signal.",
          tone: "positive",
        }
      : {
          title: "Add a focused summary",
          detail: "A short role-aligned summary will improve keyword relevance and help the profile scan faster.",
          tone: "warning",
        }
  );

  insights.push(
    hasQuantifiedImpact
      ? {
          title: "Quantified impact is detectable",
          detail: "Numbers and outcomes are present, which improves both ATS confidence and recruiter trust.",
          tone: "positive",
        }
      : {
          title: "Quantify business impact",
          detail: "Add numbers, scale, and outcome metrics so the strongest claims read as credible evidence.",
          tone: "warning",
        }
  );

  insights.push(
    sparseExperience > 0
      ? {
          title: "Expand thin experience bullets",
          detail: `${sparseExperience} experience block${sparseExperience > 1 ? "s need" : " needs"} clearer scope, ownership, or outcome detail.`,
          tone: "warning",
        }
      : {
          title: "Experience blocks are well distributed",
          detail: "Each role has enough detail to support parsing and downstream validation.",
          tone: "positive",
        }
  );

  insights.push(
    sectionKeys.includes("projects") || sectionKeys.includes("project")
      ? {
          title: "Project evidence is discoverable",
          detail: "Project-oriented proof makes technical skills easier to validate for both ATS and interviews.",
          tone: "positive",
        }
      : {
          title: "Add a proof-rich projects section",
          detail: "A dedicated projects section will strengthen low-confidence skills and support interview follow-up.",
          tone: "warning",
        }
  );

  if (lowConfidenceSkills.length) {
    insights.push({
      title: "Align skill keywords with evidence",
      detail: `${lowConfidenceSkills.length} skill claim${lowConfidenceSkills.length > 1 ? "s have" : " has"} weaker proof than the label suggests.`,
      tone: "warning",
    });
  }

  if (parsedResume.skills.length >= 8) {
    insights.push({
      title: "Keyword coverage is broad",
      detail: "The skills section already provides enough taxonomy to support role matching and targeted review.",
      tone: "positive",
    });
  }

  return insights.slice(0, 5);
}

export function buildRiskBreakdown(
  analysis: ResumeAnalysis | null,
  assessment: AssessmentEvaluationResponse | null
): BreakdownItem[] {
  if (!analysis) {
    return [];
  }

  return [
    {
      label: "Evidence gaps",
      value: analysis.skill_matrix.filter((item) => item.confidence < 60).length,
      detail: "Skills that are weakly supported by resume evidence",
    },
    {
      label: "Timeline flags",
      value:
        analysis.timeline.gaps.length +
        analysis.timeline.overlaps.length +
        analysis.timeline.growth_alerts.length,
      detail: "Chronology issues that deserve recruiter follow-up",
    },
    {
      label: "Alert signals",
      value: analysis.alerts.length,
      detail: "System alerts that directly affect recruiter confidence",
    },
    {
      label: "Interview risks",
      value: assessment?.risks.length || 0,
      detail: "Capability-test concerns surfaced from scored answers",
    },
  ];
}

export function buildPatternSignals(
  analysis: ResumeAnalysis | null,
  assessment: AssessmentEvaluationResponse | null
): PatternSignal[] {
  if (!analysis) {
    return [];
  }

  const capabilityRows = buildCapabilityRealityRows(analysis, assessment);
  const exaggeratedCount = capabilityRows.filter((row) => row.status === "exaggerated").length;
  const validatedCount = capabilityRows.filter((row) => row.status === "validated").length;
  const signals: PatternSignal[] = [];

  if (exaggeratedCount > 0) {
    signals.push({
      title: "Claim breadth exceeds proof depth",
      detail: `${exaggeratedCount} skill claim${exaggeratedCount > 1 ? "s appear" : " appears"} stronger than the evidence or live responses can support.`,
      tone: "risk",
    });
  }

  if (
    analysis.timeline.gaps.length ||
    analysis.timeline.overlaps.length ||
    analysis.timeline.growth_alerts.length
  ) {
    signals.push({
      title: "Timeline continuity needs verification",
      detail: "Career chronology contains gaps, overlaps, or growth jumps that should be clarified before a decision.",
      tone: "watch",
    });
  }

  if (assessment && assessment.overall_score < 65) {
    signals.push({
      title: "Live answers reduced confidence",
      detail: "Interview scoring suggests the candidate's explanations are not matching the written claims consistently.",
      tone: "risk",
    });
  }

  if (validatedCount >= 3) {
    signals.push({
      title: "Core capability cluster looks credible",
      detail: `${validatedCount} skill areas remain consistent across resume evidence and live evaluation.`,
      tone: "positive",
    });
  }

  if (!signals.length) {
    signals.push({
      title: "Profile is still early-stage",
      detail: "More evidence and interview depth are needed before strong patterns can be trusted.",
      tone: "watch",
    });
  }

  return signals.slice(0, 4);
}

export function buildDifficultyMix(questions: QuestionResponse | null) {
  const counts = { Easy: 0, Medium: 0, Hard: 0 };

  for (const item of questions?.questions || []) {
    counts[item.difficulty] += 1;
  }

  return [
    { label: "Easy", value: counts.Easy },
    { label: "Medium", value: counts.Medium },
    { label: "Hard", value: counts.Hard },
  ];
}
