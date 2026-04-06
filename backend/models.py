from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


RiskLevel = Literal["Low", "Medium", "High"]
AssistantState = Literal["idle", "analyzing", "alert", "speaking", "listening"]
AppMode = Literal["HR", "STUDENT"]
PerformanceBand = Literal["Emerging", "Developing", "Validated", "Advanced"]
ResumeTemplate = Literal["Executive", "Modern", "Impact"]
GeneratedResumeSource = Literal["live_ai", "grounded"]


class ExperienceEntry(BaseModel):
    role: str
    organization: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    duration_months: int = 0
    highlights: list[str] = Field(default_factory=list)


class EducationEntry(BaseModel):
    degree: str
    institution: str | None = None
    graduation_date: str | None = None
    details: list[str] = Field(default_factory=list)


class ParsedResume(BaseModel):
    resume_id: str
    candidate_name: str
    email: str | None = None
    phone: str | None = None
    summary: str | None = None
    skills: list[str] = Field(default_factory=list)
    experience: list[ExperienceEntry] = Field(default_factory=list)
    education: list[EducationEntry] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    raw_sections: dict[str, str] = Field(default_factory=dict)
    raw_text: str


class GeneratedResumeExperienceEntry(BaseModel):
    role: str
    organization: str | None = None
    period: str
    bullets: list[str] = Field(default_factory=list)


class GeneratedResumeEducationEntry(BaseModel):
    degree: str
    institution: str | None = None
    graduation_date: str | None = None
    details: list[str] = Field(default_factory=list)


class GeneratedResumeArtifact(BaseModel):
    resume_id: str
    template: ResumeTemplate = "Executive"
    target_role: str
    generation_source: GeneratedResumeSource = "grounded"
    headline: str
    professional_summary: str
    impact_highlights: list[str] = Field(default_factory=list)
    core_skills: list[str] = Field(default_factory=list)
    experience: list[GeneratedResumeExperienceEntry] = Field(default_factory=list)
    education: list[GeneratedResumeEducationEntry] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    ats_keywords: list[str] = Field(default_factory=list)
    recruiter_notes: list[str] = Field(default_factory=list)
    markdown: str


class SkillAssessment(BaseModel):
    skill: str
    claimed_level: str
    verified_level: str
    confidence: int
    evidence: str


class TimelineEvent(BaseModel):
    role: str
    organization: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    duration_months: int = 0
    marker: Literal["stable", "gap", "overlap", "growth_alert"] = "stable"
    note: str | None = None


class TimelineAnalysis(BaseModel):
    events: list[TimelineEvent] = Field(default_factory=list)
    gaps: list[str] = Field(default_factory=list)
    overlaps: list[str] = Field(default_factory=list)
    growth_alerts: list[str] = Field(default_factory=list)


class ProfileStrength(BaseModel):
    credibility: int
    technical_depth: int
    career_consistency: int
    communication_clarity: int
    education_alignment: int


class ResumeAnalysis(BaseModel):
    resume_id: str
    score: int
    risk_level: RiskLevel
    reasons: list[str] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    alerts: list[str] = Field(default_factory=list)
    ai_summary: str
    recommendation: str
    assistant_state: AssistantState = "idle"
    skill_matrix: list[SkillAssessment] = Field(default_factory=list)
    timeline: TimelineAnalysis
    profile_strength: ProfileStrength
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UploadResponse(BaseModel):
    resume_id: str
    parsed_resume: ParsedResume
    detected_sections: list[str]


class AnalyzeRequest(BaseModel):
    resume_id: str


class ResumeGenerationRequest(BaseModel):
    resume_id: str
    template: ResumeTemplate = "Executive"
    target_role: str | None = Field(default=None, max_length=120)


class ScoreResponse(BaseModel):
    resume_id: str
    score: int
    risk_level: RiskLevel
    reasons: list[str]
    last_analyzed_at: datetime


class QuestionItem(BaseModel):
    id: str
    category: str
    prompt: str
    difficulty: Literal["Easy", "Medium", "Hard"]
    intent: str | None = None
    target_skill: str | None = None
    expected_points: list[str] = Field(default_factory=list)
    sample_answer: str
    coaching_tip: str


class QuestionRequest(BaseModel):
    resume_id: str
    mode: AppMode = "HR"
    count: int = Field(default=5, ge=3, le=8)


class QuestionResponse(BaseModel):
    resume_id: str
    mode: AppMode
    questions: list[QuestionItem]
    suggestions: list[str]


class AssessmentAnswerInput(BaseModel):
    question_id: str
    answer: str = Field(default="", max_length=5000)


class AssessmentEvaluationRequest(BaseModel):
    resume_id: str
    mode: AppMode = "HR"
    answers: list[AssessmentAnswerInput] = Field(default_factory=list)
    questions: list[QuestionItem] = Field(default_factory=list)


class AssessmentEvaluationItem(BaseModel):
    question_id: str
    category: str
    prompt: str
    target_skill: str | None = None
    score: int
    verdict: str
    strengths: list[str] = Field(default_factory=list)
    gaps: list[str] = Field(default_factory=list)
    feedback: str
    recommended_next_step: str


class AssessmentEvaluationResponse(BaseModel):
    resume_id: str
    mode: AppMode
    overall_score: int
    performance_band: PerformanceBand
    credibility_score: int
    strengths: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    roadmap: list[str] = Field(default_factory=list)
    results: list[AssessmentEvaluationItem] = Field(default_factory=list)
    generated_at: datetime = Field(default_factory=datetime.utcnow)


AssistantResponseSource = Literal["live_ai", "grounded"]


class AssistantChatRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=1200)
    mode: AppMode = "HR"
    resume_id: str | None = None
    question_count: int = Field(default=0, ge=0, le=8)
    question_topics: list[str] = Field(default_factory=list)


class AssistantChatResponse(BaseModel):
    answer: str
    source: AssistantResponseSource
    assistant_state: AssistantState = "idle"
