from __future__ import annotations

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from models import (
    AnalyzeRequest,
    AssessmentEvaluationRequest,
    AssessmentEvaluationResponse,
    AssistantChatRequest,
    AssistantChatResponse,
    GeneratedResumeArtifact,
    QuestionRequest,
    QuestionResponse,
    ResumeGenerationRequest,
    ScoreResponse,
    UploadResponse,
)
from services.assessment_engine import evaluate_answers
from services.ai_service import groq_evaluator
from services.parser import parse_resume_file
from services.question_engine import generate_questions
from services.scoring import analyze_resume
from services.storage import store

app = FastAPI(title=settings.app_name, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/upload_resume", response_model=UploadResponse)
async def upload_resume(file: UploadFile = File(...)) -> UploadResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="A resume filename is required.")
    filename = file.filename
    extension = filename.lower().split(".")[-1]
    if extension not in {"pdf", "docx"}:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        parsed_resume = parse_resume_file(filename, content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive API guard
        raise HTTPException(status_code=500, detail="Resume parsing failed.") from exc

    store.save_resume(parsed_resume)
    return UploadResponse(
        resume_id=parsed_resume.resume_id,
        parsed_resume=parsed_resume,
        detected_sections=sorted(parsed_resume.raw_sections.keys()),
    )


@app.post("/analyze_resume")
async def analyze_resume_endpoint(payload: AnalyzeRequest):
    parsed_resume = store.get_resume(payload.resume_id)
    if not parsed_resume:
        raise HTTPException(status_code=404, detail="Resume not found. Upload the resume first.")

    analysis = await analyze_resume(parsed_resume)
    store.save_analysis(analysis)
    return analysis


@app.get("/get_score", response_model=ScoreResponse)
async def get_score(resume_id: str = Query(..., description="Resume identifier returned by /upload_resume")) -> ScoreResponse:
    analysis = store.get_analysis(resume_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="No score found. Analyze the resume first.")
    return ScoreResponse(
        resume_id=analysis.resume_id,
        score=analysis.score,
        risk_level=analysis.risk_level,
        reasons=analysis.reasons,
        last_analyzed_at=analysis.created_at,
    )


@app.post("/generate_questions", response_model=QuestionResponse)
async def generate_questions_endpoint(payload: QuestionRequest) -> QuestionResponse:
    parsed_resume = store.get_resume(payload.resume_id)
    if not parsed_resume:
        raise HTTPException(status_code=404, detail="Resume not found. Upload the resume first.")
    analysis = store.get_analysis(payload.resume_id)
    if not analysis:
        analysis = await analyze_resume(parsed_resume)
        store.save_analysis(analysis)

    questions, suggestions = generate_questions(parsed_resume, analysis, payload.count, payload.mode)
    return QuestionResponse(resume_id=payload.resume_id, mode=payload.mode, questions=questions, suggestions=suggestions)


@app.post("/generate_free_resume", response_model=GeneratedResumeArtifact)
async def generate_free_resume_endpoint(payload: ResumeGenerationRequest) -> GeneratedResumeArtifact:
    parsed_resume = store.get_resume(payload.resume_id)
    if not parsed_resume:
        raise HTTPException(status_code=404, detail="Resume not found. Upload the resume first.")

    analysis = store.get_analysis(payload.resume_id)
    if not analysis:
        analysis = await analyze_resume(parsed_resume)
        store.save_analysis(analysis)

    artifact = await groq_evaluator.generate_resume_artifact(
        parsed_resume=parsed_resume,
        analysis=analysis,
        template=payload.template,
        target_role=payload.target_role,
    )
    return GeneratedResumeArtifact(**artifact)


@app.post("/evaluate_answers", response_model=AssessmentEvaluationResponse)
async def evaluate_answers_endpoint(payload: AssessmentEvaluationRequest) -> AssessmentEvaluationResponse:
    parsed_resume = store.get_resume(payload.resume_id)
    if not parsed_resume:
        raise HTTPException(status_code=404, detail="Resume not found. Upload the resume first.")

    analysis = store.get_analysis(payload.resume_id)
    if not analysis:
        analysis = await analyze_resume(parsed_resume)
        store.save_analysis(analysis)

    if not payload.questions:
        raise HTTPException(status_code=400, detail="Questions are required to evaluate answers.")

    return evaluate_answers(
        resume_id=payload.resume_id,
        mode=payload.mode,
        answers=payload.answers,
        questions=payload.questions,
        analysis=analysis,
    )


@app.post("/assistant_chat", response_model=AssistantChatResponse)
async def assistant_chat(payload: AssistantChatRequest) -> AssistantChatResponse:
    parsed_resume = None
    analysis = None

    if payload.resume_id:
        parsed_resume = store.get_resume(payload.resume_id)
        if not parsed_resume:
            raise HTTPException(status_code=404, detail="Resume not found. Upload the resume first.")

        analysis = store.get_analysis(payload.resume_id)
        if not analysis:
            analysis = await analyze_resume(parsed_resume)
            store.save_analysis(analysis)

    result = await groq_evaluator.answer_prompt(
        prompt=payload.prompt,
        mode=payload.mode,
        parsed_resume=parsed_resume,
        analysis=analysis,
        question_count=payload.question_count,
        question_topics=payload.question_topics,
    )
    return AssistantChatResponse(**result)
