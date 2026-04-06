import type { AppMode } from "@/types/app";
import type { AssessmentEvaluationResponse, ResumeAnalysis } from "@/types/resume";

export type CapabilityStatus = "validated" | "mixed" | "exaggerated";

export interface CapabilityRealityRow {
  skill: string;
  claimedLevel: string;
  verifiedLevel: string;
  actualLevel: string;
  confidence: number;
  evidence: string;
  testScore: number | null;
  claimedScore: number;
  actualScore: number;
  status: CapabilityStatus;
  actualCapability: string;
}

export type AuthenticityDecisionStatus = "pending" | "pass" | "review" | "reject";

export interface AuthenticityInsight {
  verdict: string;
  summary: string;
  tone: CapabilityStatus;
  authenticityScore: number;
  exaggeratedCount: number;
  mixedCount: number;
  validatedCount: number;
  baselineScore: number;
  liveScore: number | null;
  testScore: number | null;
  credibilityScore: number | null;
  decisionStatus: AuthenticityDecisionStatus;
  decisionTitle: string;
  decisionMessage: string;
  testPassed: boolean | null;
  isRejected: boolean;
}

export interface ClaimVsActualChartDatum {
  skill: string;
  claimedLevel: string;
  actualLevel: string;
  claimedScore: number;
  actualScore: number;
  gap: number;
  status: CapabilityStatus;
}

const LEVEL_SCORE_MAP: Record<string, number> = {
  foundational: 28,
  working: 56,
  strong: 78,
  expert: 94,
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function toLevelScore(level: string) {
  const normalized = normalize(level);
  if (normalized in LEVEL_SCORE_MAP) {
    return LEVEL_SCORE_MAP[normalized];
  }

  if (normalized.includes("expert")) {
    return LEVEL_SCORE_MAP.expert;
  }
  if (normalized.includes("strong")) {
    return LEVEL_SCORE_MAP.strong;
  }
  if (normalized.includes("working")) {
    return LEVEL_SCORE_MAP.working;
  }
  return LEVEL_SCORE_MAP.foundational;
}

function scoreToLevel(score: number) {
  if (score >= 82) {
    return "Expert";
  }
  if (score >= 68) {
    return "Strong";
  }
  if (score >= 48) {
    return "Working";
  }
  return "Foundational";
}

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
}

export function buildCapabilityRealityRows(
  analysis: ResumeAnalysis | null,
  assessment: AssessmentEvaluationResponse | null
): CapabilityRealityRow[] {
  if (!analysis) {
    return [];
  }

  const questionScores = new Map<string, number[]>();

  for (const result of assessment?.results || []) {
    const key = normalize(result.target_skill || result.category);
    const current = questionScores.get(key) || [];
    current.push(result.score);
    questionScores.set(key, current);
  }

  const statusRank: Record<CapabilityStatus, number> = {
    exaggerated: 0,
    mixed: 1,
    validated: 2,
  };

  return analysis.skill_matrix
    .map((skill) => {
      const testScore = average(questionScores.get(normalize(skill.skill)) || []);
      const claimedScore = toLevelScore(skill.claimed_level);
      const actualScore = testScore ?? toLevelScore(skill.verified_level);
      const actualLevel = scoreToLevel(actualScore);
      let status: CapabilityStatus = "mixed";

      if (skill.confidence >= 78 && actualScore >= 72) {
        status = "validated";
      } else if (skill.confidence < 55 || actualScore < 50) {
        status = "exaggerated";
      }

      const actualCapability =
        status === "validated"
          ? "Claim is backed by resume evidence and live answers."
          : status === "mixed"
            ? "Some proof exists, but the tested depth is still uneven."
            : "The tested result is below the level claimed on the resume.";

      return {
        skill: skill.skill,
        claimedLevel: skill.claimed_level,
        verifiedLevel: skill.verified_level,
        actualLevel,
        confidence: skill.confidence,
        evidence: skill.evidence,
        testScore,
        claimedScore,
        actualScore,
        status,
        actualCapability,
      };
    })
    .sort((left, right) => {
      if (statusRank[left.status] !== statusRank[right.status]) {
        return statusRank[left.status] - statusRank[right.status];
      }
      return left.confidence - right.confidence;
    });
}

export function buildClaimVsActualChartData(
  analysis: ResumeAnalysis | null,
  assessment: AssessmentEvaluationResponse | null
): ClaimVsActualChartDatum[] {
  return buildCapabilityRealityRows(analysis, assessment)
    .map((row) => ({
      skill: row.skill,
      claimedLevel: row.claimedLevel,
      actualLevel: row.actualLevel,
      claimedScore: row.claimedScore,
      actualScore: row.actualScore,
      gap: Math.max(row.claimedScore - row.actualScore, 0),
      status: row.status,
    }))
    .sort((left, right) => right.gap - left.gap);
}

export function buildAuthenticityInsight(
  mode: AppMode,
  analysis: ResumeAnalysis | null,
  assessment: AssessmentEvaluationResponse | null
): AuthenticityInsight | null {
  if (!analysis) {
    return null;
  }

  const rows = buildCapabilityRealityRows(analysis, assessment);
  const exaggeratedCount = rows.filter((item) => item.status === "exaggerated").length;
  const mixedCount = rows.filter((item) => item.status === "mixed").length;
  const validatedCount = rows.filter((item) => item.status === "validated").length;
  const testScore = assessment?.overall_score ?? null;
  const credibilityScore = assessment?.credibility_score ?? null;
  const liveScore = testScore;
  const authenticityScore =
    credibilityScore === null ? analysis.score : Math.round((analysis.score * 0.44) + (credibilityScore * 0.56));

  if (!assessment) {
    return {
      verdict: mode === "HR" ? "Capability Test Pending" : "Practice Verdict Pending",
      summary:
        mode === "HR"
          ? "The resume baseline is ready. Run the capability test to decide whether the profile looks real, mixed, or exaggerated under pressure."
          : "The resume baseline is ready. Run the capability test to see which claimed skills hold up in live answers and which still need proof.",
      tone: "mixed",
      authenticityScore,
      exaggeratedCount,
      mixedCount,
      validatedCount,
      baselineScore: analysis.score,
      liveScore,
      testScore,
      credibilityScore,
      decisionStatus: "pending",
      decisionTitle: mode === "HR" ? "Awaiting Test Completion" : "Awaiting Practice Completion",
      decisionMessage:
        mode === "HR"
          ? "The resume baseline is ready. Start and score the candidate test to decide whether the resume is real, mixed, or fake."
          : "The resume baseline is ready. Finish the practice test to compare claimed level with actual demonstrated level.",
      testPassed: null,
      isRejected: false,
    };
  }

  const testPassed = assessment.overall_score >= 68 && assessment.credibility_score >= 65;

  if (!testPassed) {
    return {
      verdict: mode === "HR" ? "Resume Flagged As Fake" : "Claimed Skills Failed Validation",
      summary:
        mode === "HR"
          ? "The candidate did not pass the verification test. Claimed skills did not hold up in the scored answers, so the resume should be treated as fake and rejected."
          : "The claimed skills did not survive the scored test. The current profile should not be trusted until much stronger evidence is rebuilt.",
      tone: "exaggerated",
      authenticityScore,
      exaggeratedCount,
      mixedCount,
      validatedCount,
      baselineScore: analysis.score,
      liveScore,
      testScore,
      credibilityScore,
      decisionStatus: "reject",
      decisionTitle: mode === "HR" ? "Candidate Rejected" : "Validation Failed",
      decisionMessage:
        mode === "HR"
          ? "Candidate failed the test. Resume flagged as fake and rejected."
          : "The test result shows the claimed level is higher than the actual demonstrated level.",
      testPassed: false,
      isRejected: mode === "HR",
    };
  }

  if (authenticityScore >= 80 && exaggeratedCount <= 1 && analysis.risk_level !== "High") {
    return {
      verdict: mode === "HR" ? "Likely Real Profile" : "Capabilities Look Real",
      summary:
        mode === "HR"
          ? "The resume claims are mostly supported by both static evidence and live questioning. This profile looks usable, with only normal verification follow-ups."
          : "The claimed capabilities are largely supported by both resume evidence and live answers. The profile looks believable and ready for stronger interview reps.",
      tone: "validated",
      authenticityScore,
      exaggeratedCount,
      mixedCount,
      validatedCount,
      baselineScore: analysis.score,
      liveScore,
      testScore,
      credibilityScore,
      decisionStatus: "pass",
      decisionTitle: mode === "HR" ? "Candidate Cleared For Next Round" : "Profile Passed Validation",
      decisionMessage:
        mode === "HR"
          ? "The candidate passed the test. Resume claims and demonstrated answers are aligned closely enough to continue."
          : "The tested answers support the claimed skills strongly enough to treat the profile as credible.",
      testPassed: true,
      isRejected: false,
    };
  }

  if (authenticityScore < 58 || exaggeratedCount >= 3 || analysis.risk_level === "High") {
    return {
      verdict: mode === "HR" ? "Needs Final Verification" : "Capabilities Need Major Proof",
      summary:
        mode === "HR"
          ? "The candidate passed enough of the test to avoid immediate rejection, but the profile still contains high-risk areas that should be checked before moving ahead."
          : "Some answers passed, but too many signals still need stronger proof before the profile can be trusted fully.",
      tone: "mixed",
      authenticityScore,
      exaggeratedCount,
      mixedCount,
      validatedCount,
      baselineScore: analysis.score,
      liveScore,
      testScore,
      credibilityScore,
      decisionStatus: "review",
      decisionTitle: mode === "HR" ? "Manual Review Required" : "Profile Needs More Proof",
      decisionMessage:
        mode === "HR"
          ? "The candidate avoided an outright fail, but the resume still needs manual verification before any approval."
          : "The profile is not rejected, but it still needs stronger proof before it can be trusted fully.",
      testPassed: true,
      isRejected: false,
    };
  }

  return {
    verdict: mode === "HR" ? "Needs Verification" : "Mixed Capability Signals",
    summary:
      mode === "HR"
        ? "Some claims look solid, but too many areas still require deeper verification before the profile can be treated as fully trustworthy."
        : "Some skills look believable already, while others still feel thin. The next step is to convert mixed signals into stronger project-backed proof.",
    tone: "mixed",
    authenticityScore,
    exaggeratedCount,
    mixedCount,
    validatedCount,
    baselineScore: analysis.score,
    liveScore,
    testScore,
    credibilityScore,
    decisionStatus: "review",
    decisionTitle: mode === "HR" ? "Borderline But Still Alive" : "Mixed Validation Result",
    decisionMessage:
      mode === "HR"
        ? "The candidate passed the test, but the resume still needs targeted follow-up in weaker skill areas."
        : "Some claims held up well and some did not. Keep rebuilding the weaker skill proof before relying on the full profile.",
    testPassed: true,
    isRejected: false,
  };
}
