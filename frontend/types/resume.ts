import type { AppMode } from "@/types/app";

export type RiskLevel = "Low" | "Medium" | "High";
export type AssistantState = "idle" | "analyzing" | "alert" | "speaking" | "listening";
export type AssistantResponseSource = "live_ai" | "grounded";
export type PerformanceBand = "Emerging" | "Developing" | "Validated" | "Advanced";
export type ResumeTemplate = "Executive" | "Modern" | "Impact";
export type GeneratedResumeSource = "live_ai" | "grounded";

export interface ExperienceEntry {
  role: string;
  organization?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  duration_months: number;
  highlights: string[];
}

export interface EducationEntry {
  degree: string;
  institution?: string | null;
  graduation_date?: string | null;
  details: string[];
}

export interface ParsedResume {
  resume_id: string;
  candidate_name: string;
  email?: string | null;
  phone?: string | null;
  summary?: string | null;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: string[];
  raw_sections: Record<string, string>;
  raw_text: string;
}

export interface GeneratedResumeExperienceEntry {
  role: string;
  organization?: string | null;
  period: string;
  bullets: string[];
}

export interface GeneratedResumeEducationEntry {
  degree: string;
  institution?: string | null;
  graduation_date?: string | null;
  details: string[];
}

export interface GeneratedResumeArtifact {
  resume_id: string;
  template: ResumeTemplate;
  target_role: string;
  generation_source: GeneratedResumeSource;
  headline: string;
  professional_summary: string;
  impact_highlights: string[];
  core_skills: string[];
  experience: GeneratedResumeExperienceEntry[];
  education: GeneratedResumeEducationEntry[];
  certifications: string[];
  ats_keywords: string[];
  recruiter_notes: string[];
  markdown: string;
}

export interface SkillAssessment {
  skill: string;
  claimed_level: string;
  verified_level: string;
  confidence: number;
  evidence: string;
}

export interface TimelineEvent {
  role: string;
  organization?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  duration_months: number;
  marker: "stable" | "gap" | "overlap" | "growth_alert";
  note?: string | null;
}

export interface TimelineAnalysis {
  events: TimelineEvent[];
  gaps: string[];
  overlaps: string[];
  growth_alerts: string[];
}

export interface ProfileStrength {
  credibility: number;
  technical_depth: number;
  career_consistency: number;
  communication_clarity: number;
  education_alignment: number;
}

export interface ResumeAnalysis {
  resume_id: string;
  score: number;
  risk_level: RiskLevel;
  reasons: string[];
  strengths: string[];
  alerts: string[];
  ai_summary: string;
  recommendation: string;
  assistant_state: AssistantState;
  skill_matrix: SkillAssessment[];
  timeline: TimelineAnalysis;
  profile_strength: ProfileStrength;
  created_at: string;
}

export interface UploadResponse {
  resume_id: string;
  parsed_resume: ParsedResume;
  detected_sections: string[];
}

export interface QuestionItem {
  id: string;
  category: string;
  prompt: string;
  difficulty: "Easy" | "Medium" | "Hard";
  intent?: string;
  target_skill?: string | null;
  expected_points: string[];
  sample_answer: string;
  coaching_tip: string;
}

export interface QuestionResponse {
  resume_id: string;
  mode: AppMode;
  questions: QuestionItem[];
  suggestions: string[];
}

export interface AssessmentAnswerInput {
  question_id: string;
  answer: string;
}

export interface ResumeGenerationRequest {
  resume_id: string;
  template?: ResumeTemplate;
  target_role?: string | null;
}

export interface AssessmentEvaluationItem {
  question_id: string;
  category: string;
  prompt: string;
  target_skill?: string | null;
  score: number;
  verdict: string;
  strengths: string[];
  gaps: string[];
  feedback: string;
  recommended_next_step: string;
}

export interface AssessmentEvaluationResponse {
  resume_id: string;
  mode: AppMode;
  overall_score: number;
  performance_band: PerformanceBand;
  credibility_score: number;
  strengths: string[];
  risks: string[];
  roadmap: string[];
  results: AssessmentEvaluationItem[];
  generated_at: string;
}

export interface AssistantChatRequest {
  prompt: string;
  mode?: AppMode;
  resume_id?: string | null;
  question_count?: number;
  question_topics?: string[];
  history?: AssistantChatHistoryItem[];
  stream?: boolean;
  parsed_resume?: ParsedResume | null;
  analysis?: ResumeAnalysis | null;
}

export interface AssistantChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantChatResponse {
  answer: string;
  source: AssistantResponseSource;
  assistant_state: AssistantState;
}
