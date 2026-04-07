"use client";

const studentCards = [
  {
    label: "How you are judged",
    body: "The system compares claimed skill depth against live answers, project ownership detail, and resume signal consistency.",
  },
  {
    label: "What raises suspicion",
    body: "Overclaimed expertise, shallow explanations, timeline gaps, and overly broad skill spreads will push the risk score upward.",
  },
  {
    label: "How to prepare",
    body: "Be ready to explain architecture choices, tradeoffs, mistakes, metrics, and exactly what part of each project you owned.",
  },
];

const sampleSignals = [
  "Project walk-throughs beat memorized buzzwords.",
  "Specific failure stories increase authenticity confidence.",
  "Exact tooling choices matter less than your reasoning.",
];

export default function StudentConsole({ onBack, onSwitchToEmployer }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040814] px-4 py-5 text-slate-100 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.1),transparent_25%),linear-gradient(180deg,#050816_0%,#08101f_52%,#040814_100%)]" />
      <div className="grid-overlay absolute inset-0 opacity-35" />

      <section className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-slate-950/70 px-5 py-5 backdrop-blur-2xl">
          <div>
            <p className="text-xs uppercase tracking-[0.36em] text-cyan-300/80">Student Mode</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white sm:text-4xl">Candidate Readiness Chamber</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5" onClick={onBack} type="button">
              Back
            </button>
            <button className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-200" onClick={onSwitchToEmployer} type="button">
              Open employer dashboard
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6 rounded-[30px] border border-cyan-300/15 bg-slate-950/70 p-6 shadow-[0_0_70px_rgba(34,211,238,0.12)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Authenticity Map</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">How the fake resume detector thinks</h2>
              </div>
              <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-300">
                Transparent mode
              </div>
            </div>

            <div className="grid gap-4">
              {studentCards.map((card) => (
                <article className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5" key={card.label}>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">{card.label}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{card.body}</p>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Signal Stream</p>
              <div className="mt-5 space-y-4">
                {sampleSignals.map((signal) => (
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-slate-200" key={signal}>
                    {signal}
                  </div>
                ))}
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[30px] border border-cyan-300/20 bg-cyan-400/10 p-6">
              <div className="aurora-ring absolute -right-6 -top-6 h-32 w-32 rounded-full bg-cyan-300/15 blur-3xl" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.34em] text-cyan-200/80">Best Practice</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">Tell the real story</h3>
                <p className="mt-4 text-sm leading-7 text-slate-100/85">
                  If you truly built something, you can explain why it exists, what broke, how you debugged it, and what you would change in v2. That is exactly what this system is looking for.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
