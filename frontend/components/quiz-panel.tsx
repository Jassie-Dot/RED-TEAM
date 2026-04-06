"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BrainCircuit, LoaderCircle, RefreshCcw } from "lucide-react";

import { CapabilityRealityPanel } from "@/components/capability-reality-panel";
import { PerformanceBoard } from "@/components/performance-board";
import { WorkflowStrip } from "@/components/workflow-strip";
import { useAnalysisActions } from "@/components/analysis-provider";
import { useAppMode, useResumeStore } from "@/store/app-store";

export function QuizPanel() {
  const { mode } = useAppMode();
  const analysis = useResumeStore((state) => state.analysis);
  const assessment = useResumeStore((state) => state.assessment);
  const isEvaluatingAnswers = useResumeStore((state) => state.isEvaluatingAnswers);
  const parsedResume = useResumeStore((state) => state.parsedResume);
  const questions = useResumeStore((state) => state.questions);
  const { evaluateAnswers, loadQuestions } = useAnalysisActions();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const verdictRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setAnswers({});
  }, [questions]);

  useEffect(() => {
    if (!assessment) {
      return;
    }

    verdictRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [assessment]);

  const resultMap = useMemo(
    () => new Map((assessment?.results || []).map((item) => [item.question_id, item])),
    [assessment]
  );

  if (!parsedResume) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="glass-panel-strong neon-border mx-auto max-w-xl rounded-[32px] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.04]">
            <BrainCircuit className="text-pulse" size={28} />
          </div>
          <h2 className="mt-5 font-display text-2xl text-white">{mode === "HR" ? "Interview Engine is waiting for a candidate" : "Adaptive Test Engine is waiting for a candidate"}</h2>
          <p className="mt-3 text-sm leading-7 text-white/64">
            {mode === "HR"
              ? "Upload and analyze a resume first to generate recruiter-ready validation questions and answer scoring."
              : "Upload and analyze a resume first to generate adaptive skill checks and a real improvement loop."}
          </p>
        </div>
      </div>
    );
  }

  async function gradeAll() {
    if (!questions?.questions.length) {
      return;
    }

    await evaluateAnswers(
      questions.questions.map((question) => ({
        question_id: question.id,
        answer: answers[question.id] || "",
      }))
    );
  }

  return (
    <div className="space-y-5">
      <div className="glass-panel-strong neon-border rounded-[32px] p-6 md:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="section-kicker text-pulse/85">{mode === "HR" ? "Interview Engine" : "Adaptive Test Engine"}</p>
            <h2 className="mt-3 font-display text-3xl text-white md:text-[2.2rem]">
              {mode === "HR" ? `Validation drills for ${parsedResume.candidate_name}` : `Skill validation drills for ${parsedResume.candidate_name}`}
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-8 text-white/66">
              {mode === "HR"
                ? "Turn the resume into evidence-based interview questions, score candidate answers, and see where the profile still needs deeper proof."
                : "Turn the resume into adaptive skill checks, score each explanation, and surface the next concepts or project stories to strengthen."}
            </p>
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => void loadQuestions(5)}
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-5 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:border-neon/30 hover:bg-neon/10"
            >
              <RefreshCcw size={14} />
              Regenerate
            </button>
            <button
              type="button"
              onClick={() => void gradeAll()}
              disabled={isEvaluatingAnswers}
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-neon to-pulse px-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#04111d] disabled:opacity-60"
            >
              {isEvaluatingAnswers ? <LoaderCircle size={14} className="animate-spin" /> : <BrainCircuit size={14} />}
              {isEvaluatingAnswers ? "Evaluating" : mode === "HR" ? "Finish Test And Unlock Verdict" : "Finish Test And Unlock Verdict"}
            </button>
          </div>
        </div>

        {analysis ? (
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <MetaCard label={mode === "HR" ? "Risk level" : "Credibility baseline"} value={mode === "HR" ? analysis.risk_level : `${analysis.score}/100`} />
            <MetaCard label="Top focus" value={analysis.reasons[0] || "Reinforce project evidence and clarity."} />
            <MetaCard label={mode === "HR" ? "Directive" : "Learning directive"} value={analysis.recommendation} />
          </div>
        ) : null}
      </div>

      <WorkflowStrip />

      {!questions?.questions.length ? (
        <div className="glass-panel neon-border rounded-[30px] p-6 text-center">
          <p className="text-sm text-white/62">
            {mode === "HR"
              ? "Questions have not been generated yet. Use regenerate to create the recruiter validation set."
              : "Questions have not been generated yet. Use regenerate to create the adaptive practice set."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {questions.questions.map((question, index) => {
              const result = resultMap.get(question.id);
              return (
                <div key={question.id} className="glass-panel neon-border rounded-[30px] p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="section-kicker text-neon/82">
                        Question {index + 1} / {question.category}
                      </p>
                      <h3 className="mt-2 font-display text-2xl text-white">{question.prompt}</h3>
                      {question.intent ? <p className="mt-2 text-sm leading-6 text-white/55">{question.intent}</p> : null}
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/65">
                      {question.difficulty}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">{mode === "HR" ? "Candidate Answer" : "Your Answer"}</p>
                      <textarea
                        value={answers[question.id] || ""}
                        onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
                        rows={6}
                        className="mt-2 w-full rounded-[24px] border border-white/10 bg-black/25 px-4 py-3 text-sm leading-7 text-white outline-none transition focus:border-neon/35"
                        placeholder={
                          mode === "HR" ? "Capture the candidate's response or your observed summary..." : "Write a concrete, evidence-backed answer..."
                        }
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Expected Points</p>
                        <div className="mt-3 space-y-2 text-sm text-white/82">
                          {question.expected_points.map((point) => (
                            <p key={point}>{point}</p>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Coaching Tip</p>
                        <p className="mt-3 text-sm leading-7 text-white/82">{question.coaching_tip}</p>
                      </div>

                      {result ? (
                        <div
                          className={`rounded-[24px] border p-4 ${
                            result.score >= 70
                              ? "border-neon/30 bg-neon/10"
                              : result.score >= 40
                                ? "border-pulse/30 bg-pulse/10"
                                : "border-danger/30 bg-danger/10"
                          }`}
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Feedback</p>
                          <p className="mt-3 font-display text-xl text-white">{result.verdict}</p>
                          <p className="mt-2 text-sm text-white/82">Score: {result.score}%</p>
                          <p className="mt-2 text-sm leading-7 text-white/82">{result.feedback}</p>
                          {result.gaps.length ? (
                            <div className="mt-3 space-y-1 text-xs leading-6 text-white/70">
                              {result.gaps.map((gap) => (
                                <p key={gap}>{gap}</p>
                              ))}
                            </div>
                          ) : null}
                          <p className="mt-3 text-xs leading-6 text-neon/90">Next step: {result.recommended_next_step}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="glass-panel neon-border rounded-[30px] p-5">
            <p className="section-kicker text-pulse/85">{mode === "HR" ? "Interviewer Notes" : "Improvement Suggestions"}</p>
            <div className="mt-4 space-y-2 text-sm leading-7 text-white/82">
              {questions.suggestions.map((suggestion) => (
                <p key={suggestion}>{suggestion}</p>
              ))}
            </div>
          </div>

          <div ref={verdictRef} className="space-y-5">
            <PerformanceBoard assessment={assessment} />
            <CapabilityRealityPanel analysis={analysis} assessment={assessment} />
          </div>
        </>
      )}
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">{label}</p>
      <p className="mt-2 text-sm leading-7 text-white/82">{value}</p>
    </div>
  );
}
