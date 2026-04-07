"use client";

import { useEffect, useRef, useState } from "react";
import AnswerBubble from "./AnswerBubble";
import InterviewInput from "./InterviewInput";
import ProgressBar from "./ProgressBar";
import QuestionBubble from "./QuestionBubble";

const questions = [
  "Tell me about a project you worked on.",
  "What challenges did you face?",
  "How did you solve them?",
  "What technologies did you use?",
  "What would you improve?",
];

export default function InterviewContainer() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(() => questions.map(() => ""));
  const [draftAnswer, setDraftAnswer] = useState("");
  const conversationRef = useRef(null);

  const isSummaryScreen = currentQuestionIndex >= questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const isSubmitted = !isSummaryScreen && Boolean(answers[currentQuestionIndex]);

  useEffect(() => {
    if (!conversationRef.current) {
      return;
    }

    conversationRef.current.scrollTo({
      top: conversationRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [currentQuestionIndex, answers]);

  function handleSubmit() {
    if (!draftAnswer.trim() || isSummaryScreen) {
      return;
    }

    setAnswers((currentAnswers) => {
      const nextAnswers = [...currentAnswers];
      nextAnswers[currentQuestionIndex] = draftAnswer.trim();
      return nextAnswers;
    });
  }

  function handleNext() {
    if (!isSubmitted) {
      return;
    }

    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    setDraftAnswer(nextIndex < questions.length ? answers[nextIndex] : "");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_24%),linear-gradient(180deg,#020617_0%,#050b14_46%,#020617_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center justify-center">
        <section className="flex h-[min(880px,100vh-3rem)] w-full flex-col rounded-[32px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_30px_120px_rgba(2,6,23,0.6)] backdrop-blur-2xl sm:p-6 lg:p-8">
          <ProgressBar
            currentQuestionIndex={Math.min(currentQuestionIndex, questions.length - 1)}
            isComplete={isSummaryScreen}
            totalQuestions={questions.length}
          />

          <div className="min-h-0 flex-1 py-6">
            {isSummaryScreen ? (
              <div className="flex h-full flex-col rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-5 border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Interview Summary</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                      Submitted Answers
                    </h2>
                  </div>
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
                  {questions.map((question, index) => (
                    <div className="space-y-3" key={question}>
                      <QuestionBubble question={question} questionNumber={index + 1} />
                      <AnswerBubble answer={answers[index]} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col rounded-[28px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.24em] text-slate-500">
                  <span>Structured Interview Flow</span>
                  <span>{answers.filter(Boolean).length}/{questions.length} answered</span>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto pr-1" ref={conversationRef}>
                  <div className="space-y-4">
                    {questions.slice(0, currentQuestionIndex).map((question, index) => (
                      <div className="space-y-3" key={question}>
                        <QuestionBubble question={question} questionNumber={index + 1} />
                        <AnswerBubble answer={answers[index]} />
                      </div>
                    ))}

                    <div className="space-y-3" key={currentQuestionIndex}>
                      <QuestionBubble
                        animate
                        question={currentQuestion}
                        questionNumber={currentQuestionIndex + 1}
                      />
                      {isSubmitted ? <AnswerBubble answer={answers[currentQuestionIndex]} /> : null}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!isSummaryScreen ? (
            <InterviewInput
              draftAnswer={draftAnswer}
              isSubmitted={isSubmitted}
              onChange={setDraftAnswer}
              onNext={handleNext}
              onSubmit={handleSubmit}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}
