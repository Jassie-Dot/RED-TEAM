from __future__ import annotations

import re
from statistics import mean

from models import (
    AppMode,
    AssessmentAnswerInput,
    AssessmentEvaluationItem,
    AssessmentEvaluationResponse,
    QuestionItem,
    ResumeAnalysis,
)


def tokenize(value: str) -> list[str]:
    return [
        token
        for token in re.sub(r"[^a-z0-9\s]", " ", value.lower()).split()
        if len(token) > 2
    ]


def _extract_answer_features(answer: str) -> dict[str, int]:
    lowered = answer.lower()
    return {
        "length": len(answer.split()),
        "metrics": len(re.findall(r"\b\d+(?:\.\d+)?%?\b", answer)),
        "ownership": sum(1 for token in [" i ", " my ", " built ", " led ", " designed ", " implemented "] if token in f" {lowered} "),
        "reasoning": sum(1 for token in ["because", "tradeoff", "constraint", "impact", "result", "debug", "improve"] if token in lowered),
    }


def _coverage_score(question: QuestionItem, answer: str) -> tuple[int, list[str], list[str]]:
    answer_tokens = set(tokenize(answer))
    expected_tokens = []
    for point in question.expected_points:
        expected_tokens.extend(tokenize(point))

    unique_expected = list(dict.fromkeys(expected_tokens))
    matched = [token for token in unique_expected if token in answer_tokens]
    missing = [token for token in unique_expected if token not in answer_tokens]
    ratio = (len(matched) / len(unique_expected)) if unique_expected else 0
    return round(ratio * 100), matched[:5], missing[:5]


def _verdict(score: int, mode: AppMode) -> str:
    if score >= 80:
        return "Validated signal" if mode == "HR" else "Strong command"
    if score >= 60:
        return "Promising but verify deeper" if mode == "HR" else "Developing confidence"
    if score >= 40:
        return "Needs evidence" if mode == "HR" else "Knowledge gap detected"
    return "High-risk answer" if mode == "HR" else "Needs focused improvement"


def _feedback(mode: AppMode, score: int, question: QuestionItem, answer: str, features: dict[str, int], missing: list[str]) -> str:
    if not answer.strip():
        return (
            "No answer was provided. Ask for a concrete project walkthrough with ownership, technical detail, and measurable outcomes."
            if mode == "HR"
            else "No answer was provided. Start with one real project or study example and explain what you did, why it worked, and what you would improve."
        )

    missing_summary = ", ".join(missing[:3]) if missing else "the expected evidence points"
    if mode == "HR":
        if score >= 80:
            return "This answer is recruiter-usable. It shows ownership, evidence, and enough technical substance to support the claim."
        if score >= 60:
            return f"The answer has a believable outline, but SentinelX would still probe {missing_summary} before trusting the claim."
        return f"The response stays too broad. Push for clearer ownership, technical choices, and proof around {missing_summary}."

    if score >= 80:
        return "This answer shows real working knowledge. Keep adding metrics, tradeoffs, and debugging detail to make it interview-ready."
    if score >= 60:
        return f"You understand the direction, but you should deepen {missing_summary} and explain your reasoning more explicitly."
    return f"The response suggests a skill gap. Rebuild this topic around one project, the core concept, and the missing pieces: {missing_summary}."


def evaluate_answers(
    *,
    resume_id: str,
    mode: AppMode,
    answers: list[AssessmentAnswerInput],
    questions: list[QuestionItem],
    analysis: ResumeAnalysis,
) -> AssessmentEvaluationResponse:
    answer_map = {item.question_id: item.answer for item in answers}
    results: list[AssessmentEvaluationItem] = []

    for question in questions:
        answer = answer_map.get(question.id, "")
        coverage, matched, missing = _coverage_score(question, answer)
        features = _extract_answer_features(answer)

        depth_bonus = min(features["metrics"] * 4, 12) + min(features["ownership"] * 6, 18) + min(features["reasoning"] * 4, 12)
        length_penalty = 16 if features["length"] < 25 else 6 if features["length"] < 45 else 0

        if mode == "STUDENT":
            score = max(min(coverage + depth_bonus - length_penalty + 6, 100), 8)
            next_step = (
                f"Rebuild confidence in {question.target_skill or 'this topic'} with one project-based explanation and a short practice drill."
            )
        else:
            score = max(min(coverage + depth_bonus - length_penalty, 100), 5)
            next_step = (
                f"Ask a deeper follow-up on {question.target_skill or question.category.lower()} and request specific implementation proof."
            )

        results.append(
            AssessmentEvaluationItem(
                question_id=question.id,
                category=question.category,
                prompt=question.prompt,
                target_skill=question.target_skill,
                score=score,
                verdict=_verdict(score, mode),
                strengths=[
                    ("Touched the expected evidence points." if matched else "Attempted a direct response."),
                    ("Included measurable proof." if features["metrics"] else "Can be strengthened with concrete metrics."),
                    ("Explained ownership clearly." if features["ownership"] else "Needs clearer ownership language."),
                ],
                gaps=[
                    f"Missing or weak coverage around {token}." for token in missing[:3]
                ] or ["SentinelX wants stronger technical detail and clearer proof."],
                feedback=_feedback(mode, score, question, answer, features, missing),
                recommended_next_step=next_step,
            )
        )

    overall_score = round(mean(item.score for item in results)) if results else 0
    credibility_score = max(min(round((overall_score * 0.72) + (analysis.score * 0.28)), 100), 0)

    if overall_score >= 82:
        performance_band = "Advanced"
    elif overall_score >= 68:
        performance_band = "Validated"
    elif overall_score >= 48:
        performance_band = "Developing"
    else:
        performance_band = "Emerging"

    strongest_items = sorted(results, key=lambda item: item.score, reverse=True)[:3]
    weakest_items = sorted(results, key=lambda item: item.score)[:3]

    strengths = [
        (
            f"High confidence on {item.target_skill or item.category.lower()} with a {item.score}% response score."
            if item.target_skill
            else f"Strong performance in {item.category.lower()} with a {item.score}% response score."
        )
        for item in strongest_items
    ]
    risks = [
        (
            f"{item.target_skill or item.category} still looks exaggerated because the answer lacked proof."
            if mode == "HR"
            else f"{item.target_skill or item.category} needs reinforcement before it can be defended confidently."
        )
        for item in weakest_items
        if item.score < 70
    ]

    low_confidence_skills = [
        skill.skill
        for skill in analysis.skill_matrix
        if skill.confidence < 70
    ]

    roadmap = []
    if mode == "STUDENT":
        for skill in low_confidence_skills[:3]:
            roadmap.append(f"Build one portfolio-ready project story around {skill} with architecture, debugging, and measurable results.")
        for item in weakest_items:
            if len(roadmap) >= 4:
                break
            roadmap.append(item.recommended_next_step)
    else:
        for item in weakest_items:
            roadmap.append(item.recommended_next_step)
        if analysis.risk_level == "High":
            roadmap.append("Require portfolio links, references, or code samples before advancing to the next interview stage.")

    return AssessmentEvaluationResponse(
        resume_id=resume_id,
        mode=mode,
        overall_score=overall_score,
        performance_band=performance_band,
        credibility_score=credibility_score,
        strengths=strengths[:4],
        risks=risks[:4],
        roadmap=list(dict.fromkeys(roadmap))[:5],
        results=results,
    )
