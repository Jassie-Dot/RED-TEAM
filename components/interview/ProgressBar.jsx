export default function ProgressBar({ currentQuestionIndex, totalQuestions, isComplete }) {
  const questionNumber = Math.min(currentQuestionIndex + 1, totalQuestions);
  const progressWidth = isComplete
    ? 100
    : Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  return (
    <div className="space-y-4 border-b border-white/10 pb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">
            AI Interview Session
          </h1>
          <p className="text-sm leading-7 text-slate-400 md:text-base">
            Answer based on your resume
          </p>
        </div>

        <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.9)]" />
          <span className="font-medium">SentinelX AI Interviewer</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-2 overflow-hidden rounded-full bg-white/8">
          <div
            aria-hidden="true"
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-300 transition-all duration-500 ease-out"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
          <span className="font-medium text-slate-200">
            {isComplete ? "Interview Complete" : `Question ${questionNumber} of ${totalQuestions}`}
          </span>
          <span>{progressWidth}% complete</span>
        </div>
      </div>
    </div>
  );
}
