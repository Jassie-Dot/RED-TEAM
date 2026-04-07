export default function QuestionBubble({ question, questionNumber, animate = false }) {
  return (
    <div className={`flex justify-start ${animate ? "fade-in-up" : ""}`}>
      <div className="max-w-3xl rounded-[28px] border border-white/10 bg-white/[0.045] px-5 py-4 shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-slate-400">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.85)]" />
          <span>SentinelX AI</span>
          <span className="text-slate-500">Question {questionNumber}</span>
        </div>
        <p className="text-lg font-semibold leading-8 text-slate-100 md:text-xl">{question}</p>
      </div>
    </div>
  );
}
