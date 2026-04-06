"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, LoaderCircle, RefreshCcw, Sparkles, Target } from "lucide-react";

import { useAnalysisActions } from "@/components/analysis-provider";
import { ResumeIntakeCard } from "@/components/shared/resume-intake-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/workspace/page-header";
import { buildDifficultyMix } from "@/lib/derived-insights";
import { getStatusVariant } from "@/lib/utils";
import { useAppMode, useResumeStore } from "@/store/app-store";

export function InterviewEngineWorkspace() {
  const router = useRouter();
  const { mode } = useAppMode();
  const parsedResume = useResumeStore((state) => state.parsedResume);
  const analysis = useResumeStore((state) => state.analysis);
  const assessment = useResumeStore((state) => state.assessment);
  const questions = useResumeStore((state) => state.questions);
  const isEvaluatingAnswers = useResumeStore((state) => state.isEvaluatingAnswers);
  const { evaluateAnswers, loadQuestions } = useAnalysisActions();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pendingAssessmentKey, setPendingAssessmentKey] = useState<string | null>(null);

  useEffect(() => {
    setAnswers({});
  }, [questions]);

  useEffect(() => {
    if (!pendingAssessmentKey || !assessment || isEvaluatingAnswers) {
      return;
    }

    if (assessment.generated_at === pendingAssessmentKey) {
      return;
    }

    setPendingAssessmentKey(null);
    router.push("/reports");
  }, [assessment, isEvaluatingAnswers, pendingAssessmentKey, router]);

  const resultsMap = useMemo(
    () => new Map((assessment?.results || []).map((item) => [item.question_id, item])),
    [assessment]
  );
  const difficultyMix = buildDifficultyMix(questions);

  async function gradeAll() {
    if (!questions?.questions.length) {
      return;
    }

    setPendingAssessmentKey(assessment?.generated_at || "new-assessment");
    await evaluateAnswers(
      questions.questions.map((question) => ({
        question_id: question.id,
        answer: answers[question.id] || "",
      }))
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Interview Engine"
        title={
          mode === "HR"
            ? "AI-generated validation loops for live candidate interviews."
            : "AI-generated practice loops for defending your strongest claims."
        }
        description={
          mode === "HR"
            ? "This screen is only for interview execution: adaptive difficulty, generated prompts, live answer capture, and candidate scoring."
            : "This screen is only for interview practice: adaptive difficulty, generated prompts, live answer capture, and scoring."
        }
        actions={
          <>
            <Button onClick={() => void loadQuestions(5)} variant="secondary">
              <RefreshCcw size={15} />
              Regenerate Questions
            </Button>
            <Button onClick={() => void gradeAll()} disabled={isEvaluatingAnswers} variant="primary">
              {isEvaluatingAnswers ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <BrainCircuit size={15} />
              )}
              {isEvaluatingAnswers ? "Evaluating" : "Submit Test And Score"}
            </Button>
          </>
        }
      />

      {!parsedResume ? (
        <ResumeIntakeCard />
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
            <Card variant="default" className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Question Pack</Badge>
                {analysis ? (
                  <Badge variant={getStatusVariant(analysis.risk_level)}>{analysis.risk_level}</Badge>
                ) : null}
              </div>

              <h2 className="mt-4 font-display text-3xl text-white">{parsedResume.candidate_name}</h2>
              <p className="mt-3 text-sm leading-7 text-white/62">
                {analysis?.recommendation ||
                  "Generate adaptive prompts, then capture answers to unlock structured capability scoring."}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {difficultyMix.map((item) => (
                  <div key={item.label} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
                      {item.label}
                    </p>
                    <p className="mt-2 font-display text-2xl text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[28px] border border-white/10 bg-black/20 p-5">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-neon" />
                  <p className="section-kicker">Adaptive Difficulty System</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/78">
                  Easy questions confirm fundamentals, medium questions validate applied experience, and hard questions pressure-test depth and credibility.
                </p>

                <div className="mt-4 space-y-2 text-sm leading-7 text-white/72">
                  {(questions?.suggestions || []).slice(0, 3).map((suggestion) => (
                    <p key={suggestion}>{suggestion}</p>
                  ))}
                </div>
              </div>
            </Card>

            <Card variant="default" className="p-6">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-pulse" />
                <p className="section-kicker">Candidate Scoring</p>
              </div>
              <h2 className="mt-3 font-display text-2xl text-white">
                {assessment ? "Scored interview outcome" : "Scorecard will appear after evaluation"}
              </h2>

              {assessment ? (
                <>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <MetricCard label="Overall Score" value={`${assessment.overall_score}%`} />
                    <MetricCard label="Performance Band" value={assessment.performance_band} />
                    <MetricCard label="Credibility Score" value={`${assessment.credibility_score}%`} />
                  </div>

                  <div className="mt-5 grid gap-4 xl:grid-cols-3">
                    <ResultColumn title="Strengths" items={assessment.strengths} tone="positive" />
                    <ResultColumn title="Risks" items={assessment.risks} tone="risk" />
                    <ResultColumn title="Roadmap" items={assessment.roadmap} tone="watch" />
                  </div>
                </>
              ) : (
                <div className="mt-5 rounded-[28px] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/68">
                  Answer the generated prompts and score the candidate to unlock the final verdict. Once scoring finishes, the report opens automatically with the decision, score breakdown, and claim-versus-actual comparison.
                </div>
              )}
            </Card>
          </div>

          {!questions?.questions.length ? (
            <Card variant="default" className="p-6">
              <p className="text-sm text-white/62">
                No interview questions are loaded yet. Regenerate the question pack to continue.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {questions.questions.map((question, index) => {
                const result = resultsMap.get(question.id);
                return (
                  <Card key={question.id} variant="default" className="p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">Question {index + 1}</Badge>
                          <Badge
                            variant={
                              question.difficulty === "Easy"
                                ? "success"
                                : question.difficulty === "Medium"
                                  ? "warning"
                                  : "danger"
                            }
                          >
                            {question.difficulty}
                          </Badge>
                          {question.target_skill ? <Badge variant="neutral">{question.target_skill}</Badge> : null}
                        </div>
                        <h3 className="mt-4 font-display text-2xl text-white">{question.prompt}</h3>
                        {question.intent ? (
                          <p className="mt-3 text-sm leading-7 text-white/56">{question.intent}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 xl:grid-cols-[1.06fr_0.94fr]">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
                          {mode === "HR" ? "Candidate Answer" : "Your Answer"}
                        </p>
                        <textarea
                          value={answers[question.id] || ""}
                          onChange={(event) =>
                            setAnswers((current) => ({ ...current, [question.id]: event.target.value }))
                          }
                          rows={6}
                          className="mt-3 w-full rounded-[24px] border border-white/10 bg-black/25 px-4 py-3 text-sm leading-7 text-white outline-none transition focus:border-neon/35"
                          placeholder={
                            mode === "HR"
                              ? "Capture the candidate's response or your observed summary..."
                              : "Write a concrete, evidence-backed answer..."
                          }
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
                            Expected Points
                          </p>
                          <div className="mt-3 space-y-2 text-sm leading-7 text-white/78">
                            {question.expected_points.map((point) => (
                              <p key={point}>{point}</p>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
                            Coaching Tip
                          </p>
                          <p className="mt-3 text-sm leading-7 text-white/78">{question.coaching_tip}</p>
                        </div>

                        {result ? (
                          <div
                            className={`rounded-[24px] border p-4 ${
                              result.score >= 70
                                ? "border-neon/20 bg-neon/10"
                                : result.score >= 40
                                  ? "border-pulse/20 bg-pulse/10"
                                  : "border-danger/20 bg-danger/10"
                            }`}
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant={
                                  result.score >= 70
                                    ? "success"
                                    : result.score >= 40
                                      ? "warning"
                                      : "danger"
                                }
                              >
                                {result.verdict}
                              </Badge>
                              <Badge variant="outline">{result.score}%</Badge>
                            </div>
                            <p className="mt-3 text-sm leading-7 text-white/84">{result.feedback}</p>
                            <p className="mt-3 text-sm text-white/66">
                              Next step: {result.recommended_next_step}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">{label}</p>
      <p className="mt-2 font-display text-2xl text-white">{value}</p>
    </div>
  );
}

function ResultColumn({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "positive" | "watch" | "risk";
}) {
  return (
    <div
      className={`rounded-[24px] border p-4 ${
        tone === "positive"
          ? "border-neon/20 bg-neon/10"
          : tone === "watch"
            ? "border-pulse/20 bg-pulse/10"
            : "border-danger/20 bg-danger/10"
      }`}
    >
      <p className="section-kicker">{title}</p>
      <div className="mt-3 space-y-2 text-sm leading-7 text-white/82">
        {items.length ? items.map((item) => <p key={item}>{item}</p>) : <p>No items yet.</p>}
      </div>
    </div>
  );
}
