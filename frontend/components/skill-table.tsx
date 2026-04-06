import type { ResumeAnalysis } from "@/types/resume";
import { useAppMode } from "@/store/app-store";

export function SkillTable({ analysis }: { analysis: ResumeAnalysis | null }) {
  const { mode } = useAppMode();
  return (
    <div className="glass-panel neon-border rounded-[30px] p-5">
      <p className="section-kicker text-neon/82">{mode === "HR" ? "Verification Grid" : "Skill Evidence Grid"}</p>
      <h3 className="mt-2 font-display text-2xl text-white">
        {mode === "HR" ? "Claimed versus verified skill evidence" : "Where the resume looks credible versus where it needs stronger proof"}
      </h3>

      {!analysis ? (
        <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-6 text-center text-sm text-white/60">
          Upload and analyze a resume to populate the verification matrix.
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10">
          <div className="hidden grid-cols-[1.25fr_1fr_1fr_1.1fr] bg-white/[0.04] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45 md:grid">
            <span>Skill</span>
            <span>Claimed Level</span>
            <span>Verified Level</span>
            <span>Confidence</span>
          </div>
          <div className="divide-y divide-white/10">
            {analysis.skill_matrix.map((item) => (
              <div key={item.skill} className="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[1.25fr_1fr_1fr_1.1fr] md:items-center">
                <div>
                  <p className="font-display text-lg text-white">{item.skill}</p>
                  <p className="mt-1 text-sm leading-7 text-white/58">{item.evidence}</p>
                </div>
                <span className="text-sm text-pulse">{item.claimed_level}</span>
                <span className="text-sm text-neon">{item.verified_level}</span>
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs text-white/65">
                    <span>{item.confidence}%</span>
                    <span>{item.confidence >= 75 ? "Strong" : item.confidence >= 50 ? "Watch" : "Weak"}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className={`h-2 rounded-full ${
                        item.confidence >= 75
                          ? "bg-gradient-to-r from-neon to-[#93ddff]"
                          : item.confidence >= 50
                            ? "bg-gradient-to-r from-pulse to-neon"
                            : "bg-gradient-to-r from-danger to-pulse"
                      }`}
                      style={{ width: `${item.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
