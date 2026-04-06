"use client";

import type { ResumeAnalysis } from "@/types/resume";

export function StudentSkillGapPanel({ analysis }: { analysis: ResumeAnalysis | null }) {
  const skillGaps = analysis?.skill_matrix.slice().sort((left, right) => left.confidence - right.confidence) || [];

  return (
    <section className="glass-panel neon-border rounded-[30px] p-5">
      <p className="section-kicker text-neon/85">Skill Reality</p>
      <h2 className="mt-2 font-display text-2xl text-white">Claimed stack versus believable evidence</h2>

      {!analysis ? (
        <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-6 text-center text-sm text-white/60">
          Upload and analyze a resume to reveal which skills are solid, which look exaggerated, and which need stronger proof.
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {skillGaps.map((item) => {
            const isWeak = item.confidence < 55;
            return (
              <div key={item.skill} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-display text-xl text-white">{item.skill}</p>
                    <p className="mt-1 text-sm leading-6 text-white/62">{item.evidence}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] ${isWeak ? "bg-danger/12 text-danger" : "bg-neon/12 text-neon"}`}>
                    {isWeak ? "Needs stronger proof" : "Believable signal"}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <Metric title="Claimed Level" value={item.claimed_level} />
                  <Metric title="Verified Level" value={item.verified_level} />
                  <Metric title="Confidence" value={`${item.confidence}%`} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">{title}</p>
      <p className="mt-2 text-sm text-white/82">{value}</p>
    </div>
  );
}
