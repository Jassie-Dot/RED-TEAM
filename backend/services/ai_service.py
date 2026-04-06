from __future__ import annotations

import json
import re

import httpx

from config import settings
from models import AppMode, ParsedResume, ResumeAnalysis, ResumeTemplate

ACTION_VERBS = {
    "achieved",
    "architected",
    "automated",
    "built",
    "collaborated",
    "created",
    "defined",
    "delivered",
    "designed",
    "developed",
    "drove",
    "executed",
    "implemented",
    "improved",
    "launched",
    "led",
    "managed",
    "optimized",
    "owned",
    "shipped",
    "streamlined",
    "supported",
}
GENERIC_TARGET_ROLE = "Professional"


class ResumeIntelligenceEngine:
    def _active_provider(self) -> tuple[str, str, str] | None:
        if settings.openai_api_key:
            return (
                "https://api.openai.com/v1/chat/completions",
                settings.openai_api_key,
                settings.openai_model,
            )
        if settings.groq_api_key:
            return (
                "https://api.groq.com/openai/v1/chat/completions",
                settings.groq_api_key,
                settings.groq_model,
            )
        return None

    async def _chat_completion(self, *, messages: list[dict[str, str]], temperature: float = 0.2) -> str:
        provider = self._active_provider()
        if not provider:
            return ""

        url, api_key, model = provider
        payload = {
            "model": model,
            "temperature": temperature,
            "messages": messages,
        }
        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                response = await client.post(
                    url,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                response.raise_for_status()
        except httpx.HTTPError:
            return ""

        return response.json()["choices"][0]["message"]["content"].strip()

    async def evaluate(self, parsed_resume: ParsedResume, rule_snapshot: dict) -> dict:
        messages = [
            {
                "role": "system",
                "content": (
                    "You are Vigil-AI, an expert resume forensics analyst. "
                    "Return compact JSON with keys ai_score, summary, reasons, strengths, recommendation."
                ),
            },
            {
                "role": "user",
                "content": json.dumps(
                    {
                        "candidate_name": parsed_resume.candidate_name,
                        "skills": parsed_resume.skills,
                        "experience": [entry.model_dump() for entry in parsed_resume.experience],
                        "education": [entry.model_dump() for entry in parsed_resume.education],
                        "summary": parsed_resume.summary,
                        "rule_snapshot": rule_snapshot,
                    }
                ),
            },
        ]
        content = await self._chat_completion(messages=messages, temperature=0.2)
        if not content:
            return self._fallback(parsed_resume, rule_snapshot)

        parsed = self._extract_json(content)
        if not parsed:
            return self._fallback(parsed_resume, rule_snapshot)

        return {
            "ai_score": int(parsed.get("ai_score", 70)),
            "summary": str(parsed.get("summary", "")),
            "reasons": list(parsed.get("reasons", [])),
            "strengths": list(parsed.get("strengths", [])),
            "recommendation": str(parsed.get("recommendation", "")),
        }

    def _extract_json(self, content: str) -> dict | None:
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", content, re.DOTALL)
            if not match:
                return None
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                return None

    def _fallback(self, parsed_resume: ParsedResume, rule_snapshot: dict) -> dict:
        reasons = list(rule_snapshot.get("reasons", []))
        strengths = list(rule_snapshot.get("strengths", []))
        experience_months = sum(item.duration_months for item in parsed_resume.experience)
        ai_score = max(min(78 + min(experience_months // 24, 8) - len(reasons) * 4, 92), 38)
        summary = (
            f"SentinelX sees a {'stable' if len(reasons) <= 2 else 'mixed'} authenticity signal for "
            f"{parsed_resume.candidate_name}. The resume shows {len(parsed_resume.skills)} surfaced skills "
            f"and {len(parsed_resume.experience)} experience entries."
        )
        recommendation = (
            "Proceed to a structured technical screen with evidence-based follow-up questions."
            if ai_score >= 65
            else "Hold for deeper verification and request portfolio or work-sample proof before advancing."
        )
        return {
            "ai_score": ai_score,
            "summary": summary,
            "reasons": reasons[:3],
            "strengths": strengths[:3],
            "recommendation": recommendation,
        }

    async def generate_resume_artifact(
        self,
        *,
        parsed_resume: ParsedResume,
        analysis: ResumeAnalysis,
        template: ResumeTemplate = "Executive",
        target_role: str | None = None,
    ) -> dict:
        resolved_target_role = self._resolve_target_role(parsed_resume, target_role)
        fallback = self._resume_generation_fallback(
            parsed_resume=parsed_resume,
            analysis=analysis,
            template=template,
            target_role=resolved_target_role,
        )

        messages = [
            {
                "role": "system",
                "content": (
                    "You are an elite resume strategist creating premium-quality resume rewrites. "
                    "Use only the supplied candidate facts. Never invent metrics, employers, dates, tools, degrees, or outcomes. "
                    "Return strict JSON with keys headline, professional_summary, impact_highlights, core_skills, experience, education, certifications, ats_keywords, recruiter_notes. "
                    "Experience items must use keys role, organization, period, bullets. Education items must use keys degree, institution, graduation_date, details. "
                    "Keep the writing premium, ATS-friendly, and crisp."
                ),
            },
            {
                "role": "user",
                "content": json.dumps(
                    {
                        "template": template,
                        "target_role": resolved_target_role,
                        "candidate_name": parsed_resume.candidate_name,
                        "summary": parsed_resume.summary,
                        "skills": parsed_resume.skills,
                        "experience": [entry.model_dump() for entry in parsed_resume.experience],
                        "education": [entry.model_dump() for entry in parsed_resume.education],
                        "certifications": parsed_resume.certifications,
                        "analysis": analysis.model_dump(mode="json"),
                    }
                ),
            },
        ]
        content = await self._chat_completion(messages=messages, temperature=0.35)
        if not content:
            return fallback

        parsed = self._extract_json(content)
        if not parsed:
            return fallback

        experience = self._sanitize_generated_experience(parsed.get("experience")) or fallback["experience"]
        education = self._sanitize_generated_education(parsed.get("education")) or fallback["education"]
        certifications = self._sanitize_string_list(parsed.get("certifications"), max_items=8) or fallback["certifications"]
        impact_highlights = self._sanitize_string_list(parsed.get("impact_highlights"), max_items=4, sentenceize=True) or fallback["impact_highlights"]
        core_skills = self._sanitize_string_list(parsed.get("core_skills"), max_items=14) or fallback["core_skills"]
        ats_keywords = self._sanitize_string_list(parsed.get("ats_keywords"), max_items=14) or fallback["ats_keywords"]
        recruiter_notes = self._sanitize_string_list(parsed.get("recruiter_notes"), max_items=4, sentenceize=True) or fallback["recruiter_notes"]
        headline = self._sanitize_text(parsed.get("headline"), max_length=160) or fallback["headline"]
        professional_summary = self._sanitize_text(parsed.get("professional_summary"), max_length=560) or fallback["professional_summary"]

        return {
            "resume_id": parsed_resume.resume_id,
            "template": template,
            "target_role": resolved_target_role,
            "generation_source": "live_ai",
            "headline": headline,
            "professional_summary": professional_summary,
            "impact_highlights": impact_highlights,
            "core_skills": core_skills,
            "experience": experience,
            "education": education,
            "certifications": certifications,
            "ats_keywords": ats_keywords,
            "recruiter_notes": recruiter_notes,
            "markdown": self._build_resume_markdown(
                parsed_resume=parsed_resume,
                headline=headline,
                professional_summary=professional_summary,
                impact_highlights=impact_highlights,
                core_skills=core_skills,
                experience=experience,
                education=education,
                certifications=certifications,
            ),
        }

    def _resume_generation_fallback(
        self,
        *,
        parsed_resume: ParsedResume,
        analysis: ResumeAnalysis,
        template: ResumeTemplate,
        target_role: str,
    ) -> dict:
        impact_highlights = self._build_impact_highlights(parsed_resume, analysis)
        core_skills = self._build_core_skills(parsed_resume, analysis)
        experience = self._build_generated_experience(parsed_resume, core_skills)
        education = self._build_generated_education(parsed_resume)
        certifications = parsed_resume.certifications[:8]
        headline = self._build_headline(parsed_resume, analysis, template, target_role, core_skills)
        professional_summary = self._build_professional_summary(parsed_resume, analysis, target_role, core_skills)
        ats_keywords = self._build_ats_keywords(parsed_resume, analysis, target_role, core_skills)
        recruiter_notes = self._build_recruiter_notes(parsed_resume, analysis, core_skills)

        return {
            "resume_id": parsed_resume.resume_id,
            "template": template,
            "target_role": target_role,
            "generation_source": "grounded",
            "headline": headline,
            "professional_summary": professional_summary,
            "impact_highlights": impact_highlights,
            "core_skills": core_skills,
            "experience": experience,
            "education": education,
            "certifications": certifications,
            "ats_keywords": ats_keywords,
            "recruiter_notes": recruiter_notes,
            "markdown": self._build_resume_markdown(
                parsed_resume=parsed_resume,
                headline=headline,
                professional_summary=professional_summary,
                impact_highlights=impact_highlights,
                core_skills=core_skills,
                experience=experience,
                education=education,
                certifications=certifications,
            ),
        }

    def _resolve_target_role(self, parsed_resume: ParsedResume, target_role: str | None) -> str:
        cleaned = self._sanitize_text(target_role, max_length=120)
        if cleaned:
            return cleaned

        for entry in parsed_resume.experience:
            role = self._sanitize_text(entry.role, max_length=120)
            if role:
                return role

        if parsed_resume.skills:
            return f"{parsed_resume.skills[0]} Specialist"

        return GENERIC_TARGET_ROLE

    def _build_headline(
        self,
        parsed_resume: ParsedResume,
        analysis: ResumeAnalysis,
        template: ResumeTemplate,
        target_role: str,
        core_skills: list[str],
    ) -> str:
        top_skills = core_skills[:3] or parsed_resume.skills[:3]
        skill_label = ", ".join(top_skills)
        if template == "Modern":
            return f"{target_role} focused on {skill_label or 'clear execution and high-signal delivery'}"
        if template == "Impact":
            return f"Impact-driven {target_role} with strength in {skill_label or 'execution and growth'}"
        if analysis.strengths:
            return f"{target_role} | {skill_label or self._sanitize_text(analysis.strengths[0], max_length=72)}"
        return f"{target_role} | {skill_label or 'Execution, ownership, and delivery'}"

    def _build_professional_summary(
        self,
        parsed_resume: ParsedResume,
        analysis: ResumeAnalysis,
        target_role: str,
        core_skills: list[str],
    ) -> str:
        skill_label = self._join_phrases(core_skills[:4]) or "hands-on execution"
        experience_months = sum(item.duration_months for item in parsed_resume.experience)
        if experience_months >= 12:
            opener = f"{target_role} with {max(experience_months // 12, 1)}+ years of cumulative experience across {skill_label}."
        else:
            opener = f"{target_role} with practical exposure across {skill_label}."

        supporting = self._sanitize_text(parsed_resume.summary, max_length=220)
        if not supporting:
            strengths = self._join_phrases(analysis.strengths[:2])
            supporting = (
                f"Brings evidence of {strengths}."
                if strengths
                else "Brings clear technical communication, ownership, and resume evidence that can be defended in interviews."
            )

        strong_skills = [item.skill for item in analysis.skill_matrix if item.confidence >= 70][:3]
        closer = (
            f"Best aligned to roles that value {self._join_phrases(strong_skills)}."
            if strong_skills
            else f"Positioned well for opportunities that need {skill_label}."
        )
        return " ".join(self._ensure_sentence(part) for part in [opener, supporting, closer] if part)

    def _build_impact_highlights(self, parsed_resume: ParsedResume, analysis: ResumeAnalysis) -> list[str]:
        highlights: list[str] = []

        for item in analysis.strengths[:2]:
            cleaned = self._sanitize_text(item, max_length=140)
            if cleaned:
                highlights.append(self._ensure_sentence(cleaned))

        strong_skills = [item.skill for item in analysis.skill_matrix if item.confidence >= 70][:3]
        if strong_skills:
            highlights.append(f"Evidence-backed stack includes {self._join_phrases(strong_skills)}.")

        if parsed_resume.experience and not analysis.timeline.gaps:
            highlights.append("Career timeline reads stable, which supports a cleaner and more credible hiring narrative.")

        for entry in parsed_resume.experience:
            if entry.highlights:
                bullet = self._rewrite_bullet(entry.highlights[0], 0)
                if bullet:
                    highlights.append(bullet)
                    break

        return self._dedupe_preserve_order(highlights)[:4]

    def _build_core_skills(self, parsed_resume: ParsedResume, analysis: ResumeAnalysis) -> list[str]:
        collected = [item.skill for item in sorted(analysis.skill_matrix, key=lambda skill: skill.confidence, reverse=True) if item.skill]
        collected.extend(parsed_resume.skills)
        return self._dedupe_preserve_order(collected)[:14]

    def _build_generated_experience(self, parsed_resume: ParsedResume, core_skills: list[str]) -> list[dict]:
        experience_blocks: list[dict] = []
        fallback_skills = core_skills[:4]

        for entry in parsed_resume.experience[:6]:
            period = self._build_period(entry.start_date, entry.end_date)
            bullets = [self._rewrite_bullet(point, index) for index, point in enumerate(entry.highlights[:4])]
            bullets = [bullet for bullet in bullets if bullet]

            if not bullets:
                role_focus = self._join_phrases(fallback_skills[:3])
                bullets = [
                    self._ensure_sentence(
                        f"Delivered work as {entry.role} with emphasis on {role_focus or 'clear execution and dependable ownership'}"
                    ),
                    "Presented responsibilities in a cleaner, ATS-friendly format that is easier to scan quickly.",
                ]

            experience_blocks.append(
                {
                    "role": entry.role,
                    "organization": entry.organization,
                    "period": period,
                    "bullets": bullets[:4],
                }
            )

        if experience_blocks:
            return experience_blocks

        return [
            {
                "role": parsed_resume.candidate_name or GENERIC_TARGET_ROLE,
                "organization": None,
                "period": "Experience details not specified",
                "bullets": [
                    "Source resume needs more role detail for a stronger premium rewrite.",
                    "Add project ownership, delivery scope, and outcome language to increase impact.",
                ],
            }
        ]

    def _build_generated_education(self, parsed_resume: ParsedResume) -> list[dict]:
        entries: list[dict] = []
        for item in parsed_resume.education[:4]:
            entries.append(
                {
                    "degree": item.degree,
                    "institution": item.institution,
                    "graduation_date": item.graduation_date,
                    "details": item.details[:3],
                }
            )
        return entries

    def _build_ats_keywords(
        self,
        parsed_resume: ParsedResume,
        analysis: ResumeAnalysis,
        target_role: str,
        core_skills: list[str],
    ) -> list[str]:
        keywords = [target_role]
        keywords.extend(core_skills[:10])
        for entry in parsed_resume.experience[:2]:
            if entry.role:
                keywords.append(entry.role)
        if analysis.profile_strength.communication_clarity >= 70:
            keywords.append("Stakeholder Communication")
        if analysis.profile_strength.technical_depth >= 70:
            keywords.append("Technical Execution")
        return self._dedupe_preserve_order(keywords)[:14]

    def _build_recruiter_notes(
        self,
        parsed_resume: ParsedResume,
        analysis: ResumeAnalysis,
        core_skills: list[str],
    ) -> list[str]:
        notes: list[str] = []
        if core_skills:
            notes.append(f"Lead the summary with {self._join_phrases(core_skills[:3])} before broader claims.")

        lower_confidence = [item.skill for item in analysis.skill_matrix if item.confidence < 65][:2]
        if lower_confidence:
            notes.append(f"Add stronger project outcomes around {self._join_phrases(lower_confidence)} to lift credibility.")

        if parsed_resume.experience:
            notes.append("Keep each role to three or four bullets with ownership first, result second, and tooling third.")

        if parsed_resume.summary:
            notes.append("The original summary was tightened into faster, more ATS-friendly phrasing without adding new facts.")

        return self._dedupe_preserve_order(notes)[:4]

    def _build_resume_markdown(
        self,
        *,
        parsed_resume: ParsedResume,
        headline: str,
        professional_summary: str,
        impact_highlights: list[str],
        core_skills: list[str],
        experience: list[dict],
        education: list[dict],
        certifications: list[str],
    ) -> str:
        lines = [f"# {parsed_resume.candidate_name}"]

        contact_parts = [part for part in [parsed_resume.email, parsed_resume.phone] if part]
        if contact_parts:
            lines.append(" | ".join(contact_parts))

        lines.extend(
            [
                "",
                headline,
                "",
                "## Professional Summary",
                professional_summary,
            ]
        )

        if impact_highlights:
            lines.append("")
            lines.append("## Selected Highlights")
            lines.extend(f"- {self._strip_trailing_period(item)}" for item in impact_highlights)

        if core_skills:
            lines.append("")
            lines.append("## Core Skills")
            lines.append(" | ".join(core_skills))

        if experience:
            lines.append("")
            lines.append("## Professional Experience")
            for item in experience:
                lines.append("")
                org = item.get("organization")
                heading = item["role"] if not org else f'{item["role"]} | {org}'
                lines.append(f"### {heading}")
                lines.append(item.get("period") or "Timeline not specified")
                lines.extend(f"- {self._strip_trailing_period(bullet)}" for bullet in item.get("bullets", []))

        if education:
            lines.append("")
            lines.append("## Education")
            for item in education:
                lines.append("")
                lines.append(f'### {item["degree"]}')
                info_bits = [part for part in [item.get("institution"), item.get("graduation_date")] if part]
                if info_bits:
                    lines.append(" | ".join(info_bits))
                lines.extend(f"- {self._strip_trailing_period(detail)}" for detail in item.get("details", []))

        if certifications:
            lines.append("")
            lines.append("## Certifications")
            lines.extend(f"- {self._strip_trailing_period(item)}" for item in certifications)

        return "\n".join(lines).strip()

    def _sanitize_generated_experience(self, value: object) -> list[dict]:
        if not isinstance(value, list):
            return []

        entries: list[dict] = []
        for raw in value[:6]:
            if not isinstance(raw, dict):
                continue
            role = self._sanitize_text(raw.get("role"), max_length=120)
            if not role:
                continue
            entries.append(
                {
                    "role": role,
                    "organization": self._sanitize_text(raw.get("organization"), max_length=120) or None,
                    "period": self._sanitize_text(raw.get("period"), max_length=72) or "Timeline not specified",
                    "bullets": self._sanitize_string_list(raw.get("bullets"), max_items=4, sentenceize=True),
                }
            )
        return entries

    def _sanitize_generated_education(self, value: object) -> list[dict]:
        if not isinstance(value, list):
            return []

        entries: list[dict] = []
        for raw in value[:4]:
            if not isinstance(raw, dict):
                continue
            degree = self._sanitize_text(raw.get("degree"), max_length=140)
            if not degree:
                continue
            entries.append(
                {
                    "degree": degree,
                    "institution": self._sanitize_text(raw.get("institution"), max_length=120) or None,
                    "graduation_date": self._sanitize_text(raw.get("graduation_date"), max_length=72) or None,
                    "details": self._sanitize_string_list(raw.get("details"), max_items=3),
                }
            )
        return entries

    def _sanitize_text(self, value: object, *, max_length: int = 240) -> str:
        if not isinstance(value, str):
            return ""
        cleaned = re.sub(r"\s+", " ", value).strip()
        return cleaned[:max_length].strip()

    def _sanitize_string_list(self, value: object, *, max_items: int = 8, sentenceize: bool = False) -> list[str]:
        if not isinstance(value, list):
            return []
        items: list[str] = []
        for raw in value[:max_items]:
            cleaned = self._sanitize_text(raw, max_length=180)
            if cleaned:
                items.append(self._ensure_sentence(cleaned) if sentenceize else cleaned)
        return self._dedupe_preserve_order(items)

    def _rewrite_bullet(self, text: str, index: int) -> str:
        cleaned = self._sanitize_text(text, max_length=220)
        if not cleaned:
            return ""

        cleaned = re.sub(r"^(responsible for|worked on|involved in)\s+", "", cleaned, flags=re.IGNORECASE)
        first_word = cleaned.split(" ", 1)[0].lower()
        if first_word in ACTION_VERBS:
            return self._ensure_sentence(cleaned)

        verbs = ["Delivered", "Built", "Led", "Improved", "Created", "Implemented"]
        return self._ensure_sentence(f"{verbs[index % len(verbs)]} {cleaned[0].lower() + cleaned[1:]}")

    def _build_period(self, start_date: str | None, end_date: str | None) -> str:
        if start_date or end_date:
            return f"{start_date or 'Unknown'} - {end_date or 'Unknown'}"
        return "Timeline not specified"

    def _join_phrases(self, items: list[str]) -> str:
        values = [self._strip_trailing_period(item) for item in items if item]
        if not values:
            return ""
        if len(values) == 1:
            return values[0]
        if len(values) == 2:
            return f"{values[0]} and {values[1]}"
        return f'{", ".join(values[:-1])}, and {values[-1]}'

    def _ensure_sentence(self, text: str) -> str:
        cleaned = self._sanitize_text(text, max_length=240)
        if not cleaned:
            return ""
        return cleaned if cleaned.endswith((".", "!", "?")) else f"{cleaned}."

    def _strip_trailing_period(self, text: str) -> str:
        return text.rstrip().rstrip(".")

    def _dedupe_preserve_order(self, items: list[str]) -> list[str]:
        deduped: list[str] = []
        seen: set[str] = set()
        for item in items:
            key = item.lower()
            if key not in seen:
                seen.add(key)
                deduped.append(item)
        return deduped

    async def answer_prompt(
        self,
        *,
        prompt: str,
        mode: AppMode,
        parsed_resume: ParsedResume | None,
        analysis: ResumeAnalysis | None,
        question_count: int = 0,
        question_topics: list[str] | None = None,
    ) -> dict:
        cleaned_prompt = prompt.strip()
        if not cleaned_prompt:
            return {
                "answer": "Ask a specific question about the candidate, the score, the learning plan, or the interview flow.",
                "source": "grounded",
                "assistant_state": "idle",
            }

        question_topics = [topic for topic in (question_topics or []) if topic.strip()][:5]
        assistant_state = analysis.assistant_state if analysis else "idle"

        if not parsed_resume:
            return {
                "answer": (
                    "Upload a resume first and I will switch into a candidate-specific briefing mode. "
                    if mode == "HR"
                    else "Upload your resume first and I will map skills, surface evidence gaps, and build an improvement plan. "
                )
                + "I can still explain the workflow and the next step if you need help navigating the platform.",
                "source": "grounded",
                "assistant_state": "idle",
            }

        messages = [
            {
                "role": "system",
                "content": (
                    "You are SentinelX inside Vigil-AI, a real-time recruiting intelligence assistant. "
                    f"The active workspace mode is {mode}. "
                    "Use only the supplied candidate dossier and analysis context. "
                    "Do not invent facts, dates, employers, scores, or evidence. "
                    "If something is missing, say so clearly and suggest the next useful verification or learning step. "
                    + (
                        "In HR mode, behave like a sharp recruiter copilot focused on risk, interview depth, and hiring judgment."
                        if mode == "HR"
                        else "In STUDENT mode, behave like a candidate coach focused on skill reality, learning guidance, and improvement planning."
                    )
                ),
            },
            {
                "role": "user",
                "content": json.dumps(
                    {
                        "prompt": cleaned_prompt,
                        "mode": mode,
                        "context": {
                            "candidate_name": parsed_resume.candidate_name,
                            "summary": parsed_resume.summary,
                            "skills": parsed_resume.skills[:12],
                            "experience": [entry.model_dump() for entry in parsed_resume.experience[:6]],
                            "education": [entry.model_dump() for entry in parsed_resume.education[:4]],
                            "certifications": parsed_resume.certifications[:6],
                            "analysis": analysis.model_dump(mode="json") if analysis else None,
                            "question_context": {
                                "question_count": question_count,
                                "question_topics": question_topics,
                            },
                        },
                    }
                ),
            },
        ]
        content = await self._chat_completion(messages=messages, temperature=0.25)

        if content:
            return {
                "answer": content,
                "source": "live_ai",
                "assistant_state": assistant_state,
            }

        return {
            "answer": self._grounded_chat_fallback(
                prompt=cleaned_prompt,
                mode=mode,
                parsed_resume=parsed_resume,
                analysis=analysis,
                question_count=question_count,
                question_topics=question_topics,
            ),
            "source": "grounded",
            "assistant_state": assistant_state,
        }

    def _grounded_chat_fallback(
        self,
        *,
        prompt: str,
        mode: AppMode,
        parsed_resume: ParsedResume,
        analysis: ResumeAnalysis | None,
        question_count: int,
        question_topics: list[str],
    ) -> str:
        input_text = prompt.lower()

        if not analysis:
            return (
                f"{parsed_resume.candidate_name}'s resume is uploaded, but the full analysis is not available yet. "
                + (
                    "Run the recruiter analysis to unlock trust score, risk reasons, and interview guidance."
                    if mode == "HR"
                    else "Run the evaluation workflow to unlock skill gaps, performance guidance, and the improvement roadmap."
                )
            )

        if any(token in input_text for token in ["score", "trust", "rating"]):
            primary_signal = analysis.reasons[0] if analysis.reasons else "No major risk reason is available yet."
            return (
                f"The current trust score is {analysis.score}/100 with {analysis.risk_level.lower()} risk. "
                f"The leading signal behind that score is: {primary_signal}"
            )

        if any(token in input_text for token in ["suspicious", "risk", "alert", "red flag"]):
            if analysis.alerts:
                return "The most important risk signals are: " + " ".join(analysis.alerts[:3])
            return (
                "No major alert is active right now, but the profile should still be validated with evidence-based interview questions."
                if mode == "HR"
                else "There is no critical alert right now, but the weaker evidence-backed skills still need practice and proof."
            )

        if any(token in input_text for token in ["interview", "question", "ask", "test"]):
            topic_summary = ", ".join(question_topics[:3]) if question_topics else "the weakest evidence-backed claims"
            return (
                f"There are currently {question_count} generated prompts available. Focus on {topic_summary}. "
                + (
                    f"The current hiring recommendation is: {analysis.recommendation}"
                    if mode == "HR"
                    else "Use the prompt set to turn weak skill claims into practice answers with proof and ownership."
                )
            )

        if any(token in input_text for token in ["skill", "skills", "stack"]):
            skills = analysis.skill_matrix[:4]
            if not skills:
                return "No verified skill matrix is available yet. Run the analysis first."
            summary = " | ".join(
                f"{item.skill}: {item.verified_level.lower()} confidence at {item.confidence}%"
                for item in skills
            )
            return f"Verified skill view for {parsed_resume.candidate_name}: {summary}"

        if any(token in input_text for token in ["improve", "fix", "better", "prepare", "roadmap"]):
            weaker_skills = [item.skill for item in analysis.skill_matrix if item.confidence < 70][:2]
            focus = ", ".join(weaker_skills) if weaker_skills else "the weaker evidence-backed claims"
            if mode == "HR":
                return f"{analysis.recommendation} Preparation should focus on {focus}."
            return f"Your fastest improvement path is to strengthen {focus} with project-level proof, clearer explanations, and measurable outcomes."

        return (
            f"{parsed_resume.candidate_name} is currently assessed at {analysis.score}/100 with {analysis.risk_level.lower()} risk. "
            f"{analysis.ai_summary} Recommendation: {analysis.recommendation}"
        )


groq_evaluator = ResumeIntelligenceEngine()
