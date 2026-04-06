import type { AppMode } from "@/types/app";
import type {
  AssessmentEvaluationResponse,
  ParsedResume,
  QuestionResponse,
  ResumeAnalysis,
} from "@/types/resume";

export interface WorkspaceTab {
  href: string;
  label: string;
  description: string;
}

export interface WorkflowStepState {
  label: string;
  description: string;
  complete: boolean;
  active: boolean;
}

export interface SentinelContext {
  label: string;
  title: string;
  description: string;
  actions: string[];
}

export function getPrimaryTabs(mode: AppMode): WorkspaceTab[] {
  return [
    {
      href: "/",
      label: "Dashboard",
      description: mode === "HR" ? "Candidate overview" : "Readiness overview",
    },
    {
      href: "/resume-analysis",
      label: "Resume Studio",
      description: mode === "HR" ? "Free rewrite, evidence, ATS review" : "Free rewrite and claim-to-proof review",
    },
    {
      href: "/reports",
      label: mode === "HR" ? "Hiring Insights" : "Capability Insights",
      description: mode === "HR" ? "Signals and risk patterns" : "Signals and growth patterns",
    },
    {
      href: "/student-lab",
      label: "Interview Engine",
      description: mode === "HR" ? "Adaptive questioning" : "Adaptive practice",
    },
  ];
}

export function getJourneyStage(
  parsedResume: ParsedResume | null,
  analysis: ResumeAnalysis | null,
  assessment: AssessmentEvaluationResponse | null
) {
  if (!parsedResume) {
    return "upload" as const;
  }

  if (!analysis) {
    return "analysis" as const;
  }

  if (!assessment) {
    return "test" as const;
  }

  return "verdict" as const;
}

export function getWorkflowSteps(
  parsedResume: ParsedResume | null,
  analysis: ResumeAnalysis | null,
  assessment: AssessmentEvaluationResponse | null,
  questions: QuestionResponse | null
): WorkflowStepState[] {
  const stage = getJourneyStage(parsedResume, analysis, assessment);
  const activeIndex =
    stage === "upload" ? 0 : stage === "analysis" ? 1 : stage === "test" ? 2 : 3;

  const capabilityReady = Boolean(questions?.questions.length || assessment);

  return [
    {
      label: "Upload Resume",
      description: "Candidate source file loaded",
      complete: Boolean(parsedResume),
      active: activeIndex === 0,
    },
    {
      label: "Analysis",
      description: "Structured parsing and trust review",
      complete: Boolean(analysis),
      active: activeIndex === 1,
    },
    {
      label: "Capability Test",
      description: capabilityReady ? "Question pack ready" : "Adaptive engine waiting",
      complete: Boolean(assessment),
      active: activeIndex === 2,
    },
    {
      label: "Verdict",
      description: assessment ? "Decision-ready output" : "Waiting for candidate scoring",
      complete: Boolean(assessment),
      active: activeIndex === 3,
    },
  ];
}

export function getNextBestAction(
  parsedResume: ParsedResume | null,
  analysis: ResumeAnalysis | null,
  assessment: AssessmentEvaluationResponse | null
) {
  if (!parsedResume) {
    return "Upload a resume to initialize the recruiting workflow.";
  }

  if (!analysis) {
    return "Wait for the evidence analysis to finish before reviewing the candidate.";
  }

  if (!assessment) {
    return "Run the capability test to verify whether the strongest claims hold up live.";
  }

  return "Review the final verdict, then move into recruiter decision-making with confidence.";
}

export function getSentinelContext(mode: AppMode, pathname: string): SentinelContext {
  if (pathname === "/resume-analysis") {
    return {
      label: "Resume Studio Context",
      title: "Resume Studio Copilot",
      description:
        mode === "HR"
          ? "Focus on premium resume rewrites, claimed skills, timeline credibility, ATS readiness, and missing proof."
          : "Focus on premium resume rewrites, stronger proof, clearer impact, and tighter positioning.",
      actions:
        mode === "HR"
          ? [
              "Which skills look overstated?",
              "What evidence is missing from this resume?",
              "How can this resume be improved for ATS?",
            ]
          : [
              "Which skills need stronger proof?",
              "What ATS gaps should I fix first?",
              "Where does my timeline need more clarity?",
            ],
    };
  }

  if (pathname === "/reports") {
    return {
      label: "Insights Context",
      title: "Hiring Insights Copilot",
      description:
        mode === "HR"
          ? "Focus on patterns, recruiter risk, capability distribution, and what deserves follow-up."
          : "Focus on patterns, weak signals, growth priorities, and what is limiting credibility.",
      actions:
        mode === "HR"
          ? [
              "Break down the highest risks",
              "What patterns matter most here?",
              "Which signal should I verify before the next round?",
            ]
          : [
              "Which pattern is hurting credibility most?",
              "What should I improve first?",
              "What does this capability distribution mean?",
            ],
    };
  }

  if (pathname === "/student-lab") {
    return {
      label: "Interview Engine Context",
      title: "Adaptive Interview Copilot",
      description:
        mode === "HR"
          ? "Focus on stronger follow-up prompts, scoring logic, and where answers fail under pressure."
          : "Focus on stronger practice prompts, scoring feedback, and what to improve in live answers.",
      actions:
        mode === "HR"
          ? [
              "Generate harder follow-up questions",
              "Explain the weakest answer",
              "How should this candidate be scored?",
            ]
          : [
              "Give me a harder follow-up question",
              "Explain my weakest answer",
              "How can I improve my score?",
            ],
    };
  }

  if (pathname === "/settings") {
    return {
      label: "Workspace Context",
      title: "Operations Copilot",
      description:
        "Focus on workflow controls, assistant behavior, session state, and backend readiness.",
      actions: [
        "Explain the current workflow settings",
        "What does strict review mode change?",
        "How do I keep the assistant grounded?",
      ],
    };
  }

  return {
    label: "Dashboard Context",
    title: "Overview Copilot",
    description:
      mode === "HR"
        ? "Focus on candidate posture, trust score, next steps, and the fastest path to a hiring decision."
        : "Focus on readiness posture, trust score, next steps, and the fastest path to a stronger profile.",
    actions:
      mode === "HR"
        ? [
            "Summarize this candidate in one paragraph",
            "Explain the trust score",
            "What should happen next?",
          ]
        : [
            "Summarize my current readiness",
            "Explain my score",
            "What should I work on next?",
          ],
  };
}
