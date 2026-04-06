import type { ParsedResume } from "@/types/resume";
import { useAppMode } from "@/store/app-store";

export function DigitalResume({ parsedResume }: { parsedResume: ParsedResume | null }) {
  const { mode } = useAppMode();
  return (
    <div className="glass-panel neon-border rounded-[30px] p-5">
      <p className="section-kicker text-neon/82">{mode === "HR" ? "Structured Resume" : "Candidate Source Profile"}</p>
      <h3 className="mt-2 font-display text-2xl text-white">
        {mode === "HR" ? "Candidate profile extracted from the source document" : "Resume details the system is using for skill and readiness evaluation"}
      </h3>

      {!parsedResume ? (
        <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-6 text-center text-sm text-white/60">
          Parsed resume fields appear here after upload.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <section className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="font-display text-3xl text-white">{parsedResume.candidate_name}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-white/65">
              {parsedResume.email ? <span>{parsedResume.email}</span> : null}
              {parsedResume.phone ? <span>{parsedResume.phone}</span> : null}
            </div>
            {parsedResume.summary ? <p className="mt-4 max-w-4xl text-sm leading-7 text-white/82">{parsedResume.summary}</p> : null}
          </section>

          <section className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="section-kicker text-white/55">Skills</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {parsedResume.skills.length ? (
                parsedResume.skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-neon/20 bg-neon/10 px-3 py-1.5 text-xs font-medium text-neon">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-white/60">No discrete skills detected.</p>
              )}
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
              <p className="section-kicker text-white/55">Experience</p>
              <div className="mt-4 space-y-3">
                {parsedResume.experience.length ? (
                  parsedResume.experience.map((item, index) => (
                    <div key={`${item.role}-${index}`} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                      <p className="font-display text-lg text-white">{item.role}</p>
                      <p className="mt-1 text-sm text-white/60">{item.organization || "Organization not specified"}</p>
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
                        {item.start_date || "Unknown"} to {item.end_date || "Unknown"}
                      </p>
                      <div className="mt-3 space-y-2 text-sm leading-7 text-white/78">
                        {item.highlights.length ? item.highlights.map((point) => <p key={point}>{point}</p>) : <p>No detailed highlights parsed.</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/60">No structured experience blocks detected.</p>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
              <p className="section-kicker text-white/55">Education and Credentials</p>
              <div className="mt-4 space-y-3">
                {parsedResume.education.length ? (
                  parsedResume.education.map((item, index) => (
                    <div key={`${item.degree}-${index}`} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                      <p className="font-display text-lg text-white">{item.degree}</p>
                      <p className="mt-1 text-sm text-white/60">{item.institution || "Institution not specified"}</p>
                      {item.graduation_date ? <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">{item.graduation_date}</p> : null}
                      {item.details.length ? <p className="mt-3 text-sm leading-7 text-white/78">{item.details.join(" ")}</p> : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/60">No structured education entries detected.</p>
                )}

                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-display text-lg text-white">Certifications</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {parsedResume.certifications.length ? (
                      parsedResume.certifications.map((item) => (
                        <span key={item} className="rounded-full border border-pulse/25 bg-pulse/10 px-3 py-1.5 text-xs font-medium text-pulse">
                          {item}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-white/60">No certifications parsed.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
