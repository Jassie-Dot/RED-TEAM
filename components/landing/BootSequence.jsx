"use client";

export default function BootSequence({ lines, visibleCount, onSkip }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040814] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.16),transparent_28%),radial-gradient(circle_at_right,rgba(56,189,248,0.14),transparent_24%),linear-gradient(180deg,#030712_0%,#061120_45%,#040814_100%)]" />
      <div className="grid-overlay absolute inset-0 opacity-40" />
      <div className="scanline-overlay absolute inset-0 opacity-25" />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <div className="w-full overflow-hidden rounded-[32px] border border-cyan-400/20 bg-slate-950/70 p-6 shadow-[0_0_80px_rgba(34,211,238,0.18)] backdrop-blur-2xl sm:p-8 lg:p-12">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/80">VIGIL-AI Boot Sequence</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.08em] text-white sm:text-5xl lg:text-6xl">Resume Integrity Engine</h1>
            </div>
            <button
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/5"
              onClick={onSkip}
              type="button"
            >
              Skip intro
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[28px] border border-cyan-300/15 bg-black/35 p-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_22px_rgba(52,211,153,0.9)]" />
                <p className="text-xs uppercase tracking-[0.38em] text-slate-400">System Console</p>
              </div>

              <div className="space-y-3 font-mono text-sm text-cyan-100/90">
                {lines.slice(0, visibleCount).map((line, index) => (
                  <div className="boot-line" key={line}>
                    <span className="mr-3 text-cyan-300/55">0{index + 1}</span>
                    <span>{line}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-cyan-200/80">
                  <span className="text-cyan-300/55">&gt;</span>
                  <span className="boot-cursor inline-flex h-5 w-3 rounded-sm bg-cyan-300/85" />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
              <div className="aurora-ring absolute -left-10 top-8 h-36 w-36 rounded-full bg-cyan-400/15 blur-3xl" />
              <div className="aurora-ring absolute bottom-0 right-0 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

              <div className="relative space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Pipeline Readiness</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">Preparing cyber interview environment</h2>
                </div>

                <div className="space-y-4">
                  {[
                    "Resume upload deconstruction",
                    "Groq reasoning channel",
                    "Skill interrogation graph",
                    "Originality verdict model",
                  ].map((item, index) => (
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3" key={item}>
                      <span className="text-sm text-slate-200">{item}</span>
                      <span className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">{index < visibleCount ? "armed" : "waiting"}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm text-slate-200">
                  The resume enters as a digital artifact, the model generates technical probes, and the dashboard returns a fake-vs-original confidence call.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
