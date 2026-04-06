from __future__ import annotations

import uuid

from models import AppMode, ParsedResume, QuestionItem, ResumeAnalysis


def generate_questions(
    parsed_resume: ParsedResume,
    analysis: ResumeAnalysis,
    count: int = 5,
    mode: AppMode = "HR",
) -> tuple[list[QuestionItem], list[str]]:
    if mode == "STUDENT":
        return _generate_student_questions(parsed_resume, analysis, count)
    return _generate_hr_questions(parsed_resume, analysis, count)


def _generate_hr_questions(
    parsed_resume: ParsedResume,
    analysis: ResumeAnalysis,
    count: int,
) -> tuple[list[QuestionItem], list[str]]:
    questions: list[QuestionItem] = []

    for skill in analysis.skill_matrix[:4]:
        questions.append(
            QuestionItem(
                id=str(uuid.uuid4()),
                category="Technical Deep Dive",
                prompt=f"Walk me through a production-grade problem where you used {skill.skill}. What architecture did you choose, what tradeoffs did you make, and what outcome did you own personally?",
                difficulty="Medium" if skill.confidence >= 65 else "Hard",
                intent="Validate claimed depth with implementation detail and ownership.",
                target_skill=skill.skill,
                expected_points=[
                    f"Specific project context using {skill.skill}",
                    "Direct ownership, decisions, and technical tradeoffs",
                    "A measurable result or operating impact",
                ],
                sample_answer=f"A strong answer should tie {skill.skill} to a real system, show personal ownership, explain tradeoffs, and end with impact.",
                coaching_tip="Push past buzzwords. Ask for exact design choices, constraints, and proof of ownership.",
            )
        )

    if analysis.timeline.gaps:
        questions.append(
            QuestionItem(
                id=str(uuid.uuid4()),
                category="Timeline Integrity",
                prompt="There is a noticeable gap in the timeline. Explain what you were doing during that period, how you stayed current, and why it is not represented as a formal role.",
                difficulty="Hard",
                intent="Check chronology credibility and explanatory clarity.",
                expected_points=[
                    "Clear dates and factual explanation",
                    "Credible activity during the gap",
                    "Evidence of maintained or improved capability",
                ],
                sample_answer="A strong answer anchors the dates, explains the gap directly, and shows growth evidence without defensiveness.",
                coaching_tip="Honest clarity builds more trust than trying to smooth over a gap.",
            )
        )

    if analysis.timeline.growth_alerts:
        questions.append(
            QuestionItem(
                id=str(uuid.uuid4()),
                category="Career Progression",
                prompt="Your title progression appears fast. What achievements, shipped systems, or scope changes justified the move into more senior responsibilities?",
                difficulty="Hard",
                intent="Verify whether the title growth is supported by evidence.",
                expected_points=[
                    "Named achievements or promotions",
                    "Examples of higher scope or autonomy",
                    "Evidence of influence, leadership, or system ownership",
                ],
                sample_answer="A strong answer supports title progression with shipped work, larger scope, and visible impact rather than title language alone.",
                coaching_tip="Seniority claims should be backed by scope, judgment, and delivery proof.",
            )
        )

    questions.append(
        QuestionItem(
            id=str(uuid.uuid4()),
            category="Credibility Close",
            prompt=f"If you were presenting {parsed_resume.candidate_name} as a hiring recommendation, what is the single strongest piece of evidence in the profile and what still needs verification?",
            difficulty="Medium",
            intent="Force a concise, evidence-led summary of the candidate profile.",
            expected_points=[
                "Most credible signal in the profile",
                "Largest open verification risk",
                "A clear next-step recommendation",
            ],
            sample_answer="A strong answer identifies one trustworthy signal, one unresolved concern, and one specific hiring next step.",
            coaching_tip="The best recruiter summaries stay specific, balanced, and actionable.",
        )
    )

    suggestions = [
        "Press for measurable outcomes, not just tool names or title claims.",
        "Use follow-ups to test ownership, architecture depth, and decision quality.",
        "Clarify any timeline gaps, overlaps, or rapid title progression before moving forward.",
    ]
    if analysis.risk_level == "High":
        suggestions.insert(0, "Require a deeper verification round and ask for work samples or references before advancing.")

    return questions[:count], suggestions[:4]


def _generate_student_questions(
    parsed_resume: ParsedResume,
    analysis: ResumeAnalysis,
    count: int,
) -> tuple[list[QuestionItem], list[str]]:
    questions: list[QuestionItem] = []
    ranked_skills = sorted(analysis.skill_matrix, key=lambda item: item.confidence)[:4] or analysis.skill_matrix[:4]

    for skill in ranked_skills:
        difficulty = "Easy" if skill.confidence < 45 else "Medium" if skill.confidence < 70 else "Hard"
        questions.append(
            QuestionItem(
                id=str(uuid.uuid4()),
                category="Adaptive Skill Check",
                prompt=f"You listed {skill.skill} on your resume. Explain a real problem you solved with it, how the system worked, what went wrong, and how you would improve it now.",
                difficulty=difficulty,
                intent="Measure actual skill depth against the claimed stack.",
                target_skill=skill.skill,
                expected_points=[
                    f"Concrete use case involving {skill.skill}",
                    "Step-by-step explanation of the implementation or debugging process",
                    "A lesson learned, tradeoff, or improvement idea",
                ],
                sample_answer=f"A strong answer shows real hands-on use of {skill.skill}, explains the reasoning, and includes at least one concrete outcome or mistake learned from.",
                coaching_tip="Stay concrete. Mention architecture, debugging, constraints, and what you would change next time.",
            )
        )

    questions.append(
        QuestionItem(
            id=str(uuid.uuid4()),
            category="Evidence Communication",
            prompt="In 60 seconds, summarize your strongest technical project and explain exactly what part was yours.",
            difficulty="Medium",
            intent="Measure communication clarity and ownership.",
            expected_points=[
                "Project context and business or user outcome",
                "Personal contribution and scope",
                "A measurable result or technical takeaway",
            ],
            sample_answer="A strong answer is concise, ownership-led, and anchored in proof rather than broad claims.",
            coaching_tip="Use a simple structure: context, your role, the technical move, then the result.",
        )
    )

    if analysis.timeline.gaps:
        questions.append(
            QuestionItem(
                id=str(uuid.uuid4()),
                category="Growth Narrative",
                prompt="There is a gap in your timeline. How did you keep learning during that period, and what evidence can you show from it?",
                difficulty="Medium",
                intent="Turn a potential weakness into a learning narrative.",
                expected_points=[
                    "Honest explanation of the gap",
                    "Specific learning or practice activity",
                    "Evidence such as projects, certificates, or shipped work",
                ],
                sample_answer="A strong answer is honest about the gap and reframes it with concrete learning evidence.",
                coaching_tip="Show proof of growth, not just intent.",
            )
        )

    suggestions = [
        "Turn each claimed skill into one project story with architecture, debugging, and results.",
        "Practice explaining technical work with clear ownership instead of team-level summaries.",
        "Use metrics, constraints, and lessons learned to make answers more believable.",
        f"Focus first on {ranked_skills[0].skill if ranked_skills else 'your weakest verified skill'} because it currently has the largest evidence gap.",
    ]

    return questions[:count], suggestions[:4]
