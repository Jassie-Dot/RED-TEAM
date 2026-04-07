export default function AnswerBubble({ answer }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-3xl rounded-[28px] border border-cyan-400/30 bg-cyan-400/12 px-5 py-4 text-right shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
        <div className="mb-2 flex items-center justify-end gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-100/80">
          <span>Candidate</span>
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.85)]" />
        </div>
        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-100">{answer}</p>
      </div>
    </div>
  );
}
