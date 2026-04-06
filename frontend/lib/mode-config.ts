import type { AppMode } from "@/types/app";

export const MODE_STORAGE_KEY = "vigil-ai-app-mode";
export const LEGACY_MODE_STORAGE_KEY = "hireguard-ai-app-mode";

export const MODE_CONFIG: Record<
  AppMode,
  {
    label: string;
    badge: string;
    workspaceTitle: string;
    workspaceDescription: string;
    platformTagline: string;
    accentSummary: string;
    assistantQuickActions: string[];
    navigation: Array<{ href: string; label: string; detail: string }>;
    pageMeta: Record<string, { title: string; description: string }>;
  }
> = {
  HR: {
    label: "Recruiter",
    badge: "Recruiter Workspace",
    workspaceTitle: "Recruiting Dashboard",
    workspaceDescription: "High-level candidate posture, evidence review, hiring insights, and interview execution in focused screens.",
    platformTagline: "A cleaner recruiting workspace for teams that verify before they hire.",
    accentSummary: "Dark SaaS palette tuned for evidence review, candidate risk, and interview confidence.",
    assistantQuickActions: [
      "Explain the trust score",
      "What are the top red flags?",
      "Which interview questions should I ask?",
      "What should I verify before the next round?",
    ],
    navigation: [
      { href: "/", label: "Dashboard", detail: "Overview only" },
      { href: "/resume-analysis", label: "Resume Studio", detail: "Free rewrite + evidence" },
      { href: "/reports", label: "Hiring Insights", detail: "Signals and patterns" },
      { href: "/student-lab", label: "Interview Engine", detail: "Adaptive questioning" },
      { href: "/settings", label: "Settings", detail: "Workspace controls" },
    ],
    pageMeta: {
      "/": {
        title: "Recruiting Dashboard",
        description: "High-level candidate posture, trust score, next actions, and clean workflow progress.",
      },
      "/resume-analysis": {
        title: "Resume Studio",
        description: "Generate a premium free resume, inspect parsed data, review ATS readiness, and check chronology signals.",
      },
      "/reports": {
        title: "Hiring Insights",
        description: "Review charts, risk breakdowns, and higher-order candidate patterns without dashboard clutter.",
      },
      "/student-lab": {
        title: "Interview Engine",
        description: "Generate adaptive interview prompts, capture answers, and score candidate capability.",
      },
      "/settings": {
        title: "System Settings",
        description: "Control AI connectivity, workflow behaviors, and session persistence.",
      },
    },
  },
  STUDENT: {
    label: "Candidate",
    badge: "Candidate Workspace",
    workspaceTitle: "Capability Dashboard",
    workspaceDescription: "Readiness overview, claim-to-proof analysis, capability insights, and interview practice in focused screens.",
    platformTagline: "A cleaner capability workspace for turning claims into believable proof.",
    accentSummary: "Dark SaaS palette tuned for capability checks, growth loops, and candidate improvement.",
    assistantQuickActions: [
      "Which skills look exaggerated?",
      "What should I study first?",
      "How can I improve this resume's credibility?",
      "Explain my weakest answer",
    ],
    navigation: [
      { href: "/", label: "Dashboard", detail: "Readiness overview" },
      { href: "/resume-analysis", label: "Resume Studio", detail: "Free rewrite + proof" },
      { href: "/reports", label: "Capability Insights", detail: "Signals and patterns" },
      { href: "/student-lab", label: "Interview Engine", detail: "Practice and grading" },
      { href: "/settings", label: "Settings", detail: "Workspace controls" },
    ],
    pageMeta: {
      "/": {
        title: "Capability Dashboard",
        description: "High-level readiness posture, trust score, next actions, and clean workflow progress.",
      },
      "/resume-analysis": {
        title: "Resume Studio",
        description: "Generate a premium free resume, compare claimed skills with verified evidence, and identify where stronger proof is needed.",
      },
      "/reports": {
        title: "Capability Insights",
        description: "See capability trends, risk patterns, and the signals that most affect credibility.",
      },
      "/student-lab": {
        title: "Interview Engine",
        description: "Practice tailored prompts and get structured scoring on how convincing the answers are.",
      },
      "/settings": {
        title: "System Settings",
        description: "Adjust assistant behavior, automation preferences, and AI connectivity across modes.",
      },
    },
  },
};

export function getModeConfig(mode: AppMode) {
  return MODE_CONFIG[mode];
}

export function getModePageMeta(mode: AppMode, pathname: string) {
  const config = getModeConfig(mode);
  return (
    config.pageMeta[pathname] || {
      title: config.workspaceTitle,
      description: config.workspaceDescription,
    }
  );
}
