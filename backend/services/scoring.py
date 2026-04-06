from __future__ import annotations

import re
from collections import Counter
from datetime import datetime

from dateutil import parser as date_parser

from models import ParsedResume, ProfileStrength, ResumeAnalysis, SkillAssessment, TimelineAnalysis, TimelineEvent
from services.ai_service import groq_evaluator
from services.parser import DATE_RANGE_RE, keyword_density

LEVELS = ["Foundational", "Working", "Strong", "Expert"]
ADVANCED_TITLES = ("senior", "lead", "principal", "architect", "manager", "director", "chief")


async def analyze_resume(parsed_resume: ParsedResume) -> ResumeAnalysis:
    skill_matrix, skill_penalty, skill_strengths, mismatch_reasons = build_skill_matrix(parsed_resume)
    timeline, timeline_penalty, timeline_reasons = analyze_timeline(parsed_resume)
    stuffing_penalty, stuffing_reason = detect_keyword_stuffing(parsed_resume)
    communication_score = assess_communication_clarity(parsed_resume)
    education_alignment = assess_education_alignment(parsed_resume)

    strengths = list(skill_strengths)
    if not timeline.gaps and not timeline.overlaps:
        strengths.append("Career chronology is internally consistent with no obvious unexplained breaks.")
    if communication_score >= 75:
        strengths.append("Resume language is structured and concise, which improves verification confidence.")
    if education_alignment >= 70:
        strengths.append("Education and resume focus are aligned with the claimed technical direction.")

    reasons = list(mismatch_reasons) + list(timeline_reasons)
    if stuffing_reason:
        reasons.append(stuffing_reason)

    rule_score = max(100 - skill_penalty - timeline_penalty - stuffing_penalty, 25)
    rule_snapshot = {
        "rule_score": rule_score,
        "reasons": reasons,
        "strengths": strengths,
        "timeline_gaps": timeline.gaps,
        "timeline_overlaps": timeline.overlaps,
    }
    ai_result = await groq_evaluator.evaluate(parsed_resume, rule_snapshot)

    final_score = round(rule_score * 0.65 + ai_result["ai_score"] * 0.35)
    risk_level = "Low" if final_score >= 75 else "Medium" if final_score >= 50 else "High"
    assistant_state = "alert" if risk_level == "High" else "speaking" if risk_level == "Medium" else "idle"

    profile_strength = ProfileStrength(
        credibility=max(min(final_score, 100), 0),
        technical_depth=calculate_technical_depth(skill_matrix),
        career_consistency=max(100 - timeline_penalty * 2, 20),
        communication_clarity=communication_score,
        education_alignment=education_alignment,
    )

    alerts = [reason for reason in reasons if "gap" in reason.lower() or "mismatch" in reason.lower() or "overlap" in reason.lower()]
    if risk_level == "High" and "Multiple high-risk indicators were found across evidence consistency checks." not in alerts:
        alerts.insert(0, "Multiple high-risk indicators were found across evidence consistency checks.")

    deduped_reasons = dedupe_preserve_order(reasons)[:6]
    deduped_strengths = dedupe_preserve_order(strengths + ai_result["strengths"])[:5]

    return ResumeAnalysis(
        resume_id=parsed_resume.resume_id,
        score=final_score,
        risk_level=risk_level,
        reasons=deduped_reasons,
        strengths=deduped_strengths,
        alerts=dedupe_preserve_order(alerts)[:4],
        ai_summary=ai_result["summary"],
        recommendation=ai_result["recommendation"],
        assistant_state=assistant_state,
        skill_matrix=skill_matrix,
        timeline=timeline,
        profile_strength=profile_strength,
        created_at=datetime.utcnow(),
    )


def build_skill_matrix(parsed_resume: ParsedResume) -> tuple[list[SkillAssessment], int, list[str], list[str]]:
    skills = parsed_resume.skills[:10] or infer_skills_from_text(parsed_resume.raw_text)
    experience_text = " ".join(
        " ".join([entry.role, entry.organization or "", *entry.highlights]) for entry in parsed_resume.experience
    ).lower()
    raw_text = parsed_resume.raw_text.lower()

    matrix: list[SkillAssessment] = []
    penalty = 0
    strengths: list[str] = []
    reasons: list[str] = []

    for skill in skills[:8]:
        claimed_level = infer_claimed_level(skill, raw_text)
        verified_level, confidence, evidence = infer_verified_level(skill, parsed_resume, experience_text)
        matrix.append(
            SkillAssessment(
                skill=skill,
                claimed_level=claimed_level,
                verified_level=verified_level,
                confidence=confidence,
                evidence=evidence,
            )
        )
        claimed_index = LEVELS.index(claimed_level)
        verified_index = LEVELS.index(verified_level)
        if claimed_index - verified_index >= 2:
            penalty += 10
            reasons.append(
                f"Skill-to-evidence mismatch: {skill} is claimed at {claimed_level.lower()} level but verified evidence stays at {verified_level.lower()} level."
            )
        elif confidence >= 75:
            strengths.append(f"{skill} is supported by role history or project evidence.")

    if len(matrix) >= 5:
        strengths.append("Skill coverage is broad enough to support a balanced technical profile.")

    return matrix, penalty, strengths, reasons


def infer_skills_from_text(text: str) -> list[str]:
    common_skills = ["Python", "React", "AWS", "SQL", "Docker", "Cybersecurity", "Node.js", "FastAPI"]
    matches = [skill for skill in common_skills if skill.lower() in text.lower()]
    return matches[:6]


def infer_claimed_level(skill: str, raw_text: str) -> str:
    patterns = [
        (rf"(expert|advanced|lead|senior)[\w\s,/-]{{0,18}}{re.escape(skill.lower())}", "Expert"),
        (rf"(advanced|strong)[\w\s,/-]{{0,18}}{re.escape(skill.lower())}", "Strong"),
        (rf"(intermediate|hands-on|practical)[\w\s,/-]{{0,18}}{re.escape(skill.lower())}", "Working"),
        (rf"(\d+)\+?\s+years[\w\s,/-]{{0,12}}{re.escape(skill.lower())}", None),
    ]
    for pattern, mapped in patterns:
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if not match:
            continue
        if mapped:
            return mapped
        years = int(match.group(1))
        if years >= 6:
            return "Expert"
        if years >= 3:
            return "Strong"
        if years >= 1:
            return "Working"
    return "Strong" if raw_text.count(skill.lower()) >= 3 else "Working"


def infer_verified_level(skill: str, parsed_resume: ParsedResume, experience_text: str) -> tuple[str, int, str]:
    skill_lower = skill.lower()
    mention_count = parsed_resume.raw_text.lower().count(skill_lower)
    evidence_hits = experience_text.count(skill_lower)
    duration_support = sum(entry.duration_months for entry in parsed_resume.experience if skill_lower in " ".join(entry.highlights).lower())
    confidence = min(35 + evidence_hits * 15 + min(duration_support // 6, 20) + min(mention_count * 4, 20), 96)

    if confidence >= 82:
        level = "Expert"
    elif confidence >= 68:
        level = "Strong"
    elif confidence >= 48:
        level = "Working"
    else:
        level = "Foundational"

    evidence = (
        f"{evidence_hits or 1} role-linked mentions and {duration_support or 0} months of contextual evidence detected."
        if evidence_hits
        else "Skill is present, but concrete project or role evidence is limited."
    )
    return level, confidence, evidence


def analyze_timeline(parsed_resume: ParsedResume) -> tuple[TimelineAnalysis, int, list[str]]:
    dated_entries = []
    for entry in parsed_resume.experience:
        if not entry.start_date:
            continue
        start = safe_date(entry.start_date)
        end = datetime.utcnow() if entry.end_date == "Present" else safe_date(entry.end_date or "")
        if start:
            dated_entries.append((start, end or start, entry))

    dated_entries.sort(key=lambda item: item[0])
    timeline = TimelineAnalysis()
    penalty = 0
    reasons: list[str] = []
    prior_total_months = 0
    previous_end = None

    for start, end, entry in dated_entries:
        marker = "stable"
        note = None
        if previous_end and start < previous_end:
            penalty += 12
            marker = "overlap"
            note = f"Overlap detected between {entry.role} and a previous role."
            timeline.overlaps.append(note)
            reasons.append("Timeline overlap suggests simultaneous roles without clear explanation.")
        elif previous_end:
            gap_days = (start - previous_end).days
            if gap_days > 120:
                penalty += 8
                marker = "gap"
                note = f"{gap_days // 30} month gap before {entry.role}."
                timeline.gaps.append(note)
                reasons.append("Timeline gap exceeds four months and should be explained during screening.")

        if any(token in entry.role.lower() for token in ADVANCED_TITLES) and prior_total_months < 24:
            penalty += 9
            marker = "growth_alert"
            note = f"Rapid seniority jump into '{entry.role}' appears faster than the documented career length."
            timeline.growth_alerts.append(note)
            reasons.append("Career growth appears unusually fast relative to documented experience.")

        timeline.events.append(
            TimelineEvent(
                role=entry.role,
                organization=entry.organization,
                start_date=entry.start_date,
                end_date=entry.end_date,
                duration_months=entry.duration_months,
                marker=marker,
                note=note,
            )
        )
        previous_end = max(previous_end, end) if previous_end else end
        prior_total_months += entry.duration_months

    return timeline, penalty, reasons


def detect_keyword_stuffing(parsed_resume: ParsedResume) -> tuple[int, str | None]:
    tracked_keywords = parsed_resume.skills[:10]
    if not tracked_keywords:
        return 0, None
    counts = keyword_density(parsed_resume.raw_text, tracked_keywords)
    repeated = [skill for skill, count in counts.items() if count >= 6]
    if repeated:
        penalty = min(12, len(repeated) * 4)
        return penalty, f"Keyword density is unusually high for {', '.join(repeated[:3])}, which may indicate stuffing."
    return 0, None


def assess_communication_clarity(parsed_resume: ParsedResume) -> int:
    word_count = len(parsed_resume.raw_text.split())
    avg_bullets = (
        sum(len(entry.highlights) for entry in parsed_resume.experience) / max(len(parsed_resume.experience), 1)
    )
    repeated_terms = Counter(re.findall(r"\b[a-zA-Z]{4,}\b", parsed_resume.raw_text.lower())).most_common(5)
    repeat_penalty = sum(1 for _, count in repeated_terms if count > max(word_count / 35, 7))
    score = 72 + min(int(avg_bullets * 3), 12) - repeat_penalty * 5
    if parsed_resume.summary:
        score += 6
    return max(min(score, 95), 35)


def assess_education_alignment(parsed_resume: ParsedResume) -> int:
    if not parsed_resume.education:
        return 52
    combined = " ".join(" ".join(filter(None, [entry.degree, entry.institution])) for entry in parsed_resume.education).lower()
    if any(token in combined for token in ["computer", "software", "information", "cyber", "engineering", "data"]):
        return 86
    if any(token in combined for token in ["science", "technology", "mathematics"]):
        return 74
    return 64


def calculate_technical_depth(skill_matrix: list[SkillAssessment]) -> int:
    if not skill_matrix:
        return 45
    confidence_avg = sum(item.confidence for item in skill_matrix) / len(skill_matrix)
    verification_bonus = sum(1 for item in skill_matrix if LEVELS.index(item.verified_level) >= 2) * 4
    return max(min(round(confidence_avg + verification_bonus), 96), 35)


def safe_date(value: str) -> datetime | None:
    try:
        if re.fullmatch(r"[A-Za-z]{3}\s\d{4}", value):
            return date_parser.parse(value)
        if DATE_RANGE_RE.search(value):
            match = DATE_RANGE_RE.search(value)
            if match:
                return date_parser.parse(match.group("start"))
        return date_parser.parse(value)
    except (ValueError, TypeError, OverflowError):
        return None


def dedupe_preserve_order(items: list[str]) -> list[str]:
    seen = set()
    result = []
    for item in items:
        normalized = item.strip().lower()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        result.append(item)
    return result
