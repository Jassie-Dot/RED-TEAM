export default function InterviewInput({
  draftAnswer,
  isSubmitted,
  onChange,
  onNext,
  onSubmit,
}) {
  return (
    <div className="space-y-4 border-t border-white/10 pt-6">
      <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-4">
        <div className="mb-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.24em] text-slate-500">
          <span>Your Answer</span>
          <span>{draftAnswer.length} chars</span>
        </div>
        <textarea
          className="min-h-40 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-base leading-7 text-slate-100 outline-none transition duration-200 placeholder:text-slate-500 focus:border-cyan-400/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitted}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type your answer..."
          value={draftAnswer}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-300 px-5 text-sm font-semibold text-slate-950 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(34,211,238,0.35)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
          disabled={!draftAnswer.trim() || isSubmitted}
          onClick={onSubmit}
          type="button"
        >
          Submit Answer
        </button>

        <button
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-5 text-sm font-semibold text-slate-100 transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!isSubmitted}
          onClick={onNext}
          type="button"
        >
          Next Question
        </button>
      </div>
    </div>
  );
}
