"use client";

import { Copy, Download, FileText, LoaderCircle, Sparkles, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAnalysisActions } from "@/components/analysis-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppMode, useResumeStore } from "@/store/app-store";
import type { ResumeTemplate } from "@/types/resume";

const TEMPLATE_OPTIONS: Array<{
  value: ResumeTemplate;
  label: string;
  blurb: string;
}> = [
  {
    value: "Executive",
    label: "Executive",
    blurb: "Crisp, premium, recruiter-friendly structure.",
  },
  {
    value: "Modern",
    label: "Modern",
    blurb: "Smoother headline and a sharper personal brand tone.",
  },
  {
    value: "Impact",
    label: "Impact",
    blurb: "Pushes ownership, outcomes, and high-signal phrasing harder.",
  },
];

export function FreeResumeStudio() {
  const { mode } = useAppMode();
  const parsedResume = useResumeStore((state) => state.parsedResume);
  const analysis = useResumeStore((state) => state.analysis);
  const generatedResume = useResumeStore((state) => state.generatedResume);
  const isGeneratingResume = useResumeStore((state) => state.isGeneratingResume);
  const error = useResumeStore((state) => state.error);
  const { generateResume } = useAnalysisActions();

  const [template, setTemplate] = useState<ResumeTemplate>("Executive");
  const [targetRole, setTargetRole] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (targetRole.trim() || !parsedResume?.experience.length) {
      return;
    }

    setTargetRole(parsedResume.experience[0]?.role || "");
  }, [parsedResume?.experience, targetRole]);

  const previewTemplateMeta = useMemo(
    () =>
      TEMPLATE_OPTIONS.find((option) => option.value === (generatedResume?.template || template)) || TEMPLATE_OPTIONS[0],
    [generatedResume?.template, template]
  );

  async function handleGenerate() {
    await generateResume({
      template,
      targetRole: targetRole.trim() || undefined,
    });
  }

  async function copyText(value: string, successLabel: string) {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback(successLabel);
      window.setTimeout(() => setFeedback(null), 2200);
    } catch {
      setFeedback("Clipboard access was blocked.");
      window.setTimeout(() => setFeedback(null), 2200);
    }
  }

  function downloadMarkdown() {
    if (!generatedResume) {
      return;
    }

    const blob = new Blob([generatedResume.markdown], { type: "text/markdown;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = (parsedResume?.candidate_name || "resume").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
    link.href = url;
    link.download = `${safeName || "resume"}-premium-free-resume.md`;
    link.click();
    window.URL.revokeObjectURL(url);
    setFeedback("Markdown download started.");
    window.setTimeout(() => setFeedback(null), 2200);
  }

  return (
    <Card id="resume-studio" variant="strong" className="overflow-hidden p-6 md:p-7">
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">Free Resume Studio</Badge>
            <Badge variant="outline">Premium-style Output</Badge>
            {generatedResume ? (
              <Badge variant={generatedResume.generation_source === "live_ai" ? "success" : "warning"}>
                {generatedResume.generation_source === "live_ai" ? "AI Enhanced" : "Smart Rewrite"}
              </Badge>
            ) : null}
          </div>

          <div>
            <p className="section-kicker text-neon/82">
              {mode === "HR" ? "Candidate Resume Upgrade" : "Free Premium Resume Builder"}
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-white">
              Generate a resume that feels paid, polished, and immediately useful.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/66">
              This uses the parsed resume plus the evidence scan to rewrite the profile into sharper headline
              copy, tighter summaries, better bullets, ATS-friendly skills, and a cleaner recruiter-first layout.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-neon" />
              <p className="section-kicker">Role Target</p>
            </div>
            <input
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
              placeholder="Example: Frontend Engineer"
              disabled={!parsedResume || isGeneratingResume}
              className="mt-4 h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-neon/30"
            />
            <p className="mt-3 text-xs leading-6 text-white/48">
              Leave it as-is or point the rewrite at a specific role before generating.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-pulse" />
              <p className="section-kicker">Style Presets</p>
            </div>

            <div className="mt-4 grid gap-3">
              {TEMPLATE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTemplate(option.value)}
                  disabled={!parsedResume || isGeneratingResume}
                  className={cn(
                    "rounded-[24px] border p-4 text-left transition",
                    template === option.value
                      ? "border-neon/26 bg-neon/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.05]"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-lg text-white">{option.label}</p>
                    {template === option.value ? <Badge variant="success">Active</Badge> : null}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-white/62">{option.blurb}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleGenerate} variant="primary" size="lg" disabled={!parsedResume || isGeneratingResume}>
              {isGeneratingResume ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {isGeneratingResume ? "Generating Premium Resume" : generatedResume ? "Regenerate Resume" : "Generate Free Resume"}
            </Button>
            <Button
              onClick={() => generatedResume && void copyText(generatedResume.markdown, "Resume markdown copied.")}
              variant="secondary"
              size="lg"
              disabled={!generatedResume || isGeneratingResume}
            >
              <Copy size={16} />
              Copy Markdown
            </Button>
            <Button onClick={downloadMarkdown} variant="secondary" size="lg" disabled={!generatedResume || isGeneratingResume}>
              <Download size={16} />
              Download .md
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MetricTile
              label="Headline"
              value={generatedResume?.headline ? "Ready" : "Pending"}
              detail={generatedResume?.headline || "Sharper personal positioning lands here."}
            />
            <MetricTile
              label="ATS Keywords"
              value={generatedResume ? `${generatedResume.ats_keywords.length}` : "--"}
              detail={generatedResume ? "Role and skill terms are organized for scan quality." : "The keyword stack appears after generation."}
            />
            <MetricTile
              label="Signal"
              value={analysis ? `${analysis.score}/100` : "--"}
              detail={analysis ? `${analysis.risk_level} risk baseline is informing the rewrite.` : "Upload and analyze a resume to unlock the evidence-backed rewrite."}
            />
          </div>

          {feedback ? (
            <p className="rounded-[20px] border border-neon/20 bg-neon/10 px-4 py-3 text-sm text-neon">{feedback}</p>
          ) : null}

          {error && !generatedResume ? (
            <p className="rounded-[20px] border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(106,233,214,0.12),transparent_26%),rgba(4,9,18,0.46)] p-3">
            {generatedResume && parsedResume ? (
              <article className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff,#eef7f2)] p-6 text-slate-900 shadow-[0_28px_80px_rgba(3,7,18,0.32)] md:p-7">
                <div className="border-b border-slate-200 pb-5">
                  <p className="font-display text-3xl text-slate-950">{parsedResume.candidate_name}</p>
                  <p className="mt-2 text-base font-medium text-slate-700">{generatedResume.headline}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                    {parsedResume.email ? <span>{parsedResume.email}</span> : null}
                    {parsedResume.phone ? <span>{parsedResume.phone}</span> : null}
                    <span>{previewTemplateMeta.label} template</span>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-[1.06fr_0.94fr]">
                  <section>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">Summary</p>
                    <p className="mt-3 text-sm leading-7 text-slate-700">{generatedResume.professional_summary}</p>
                  </section>
                  <section>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">Core Skills</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {generatedResume.core_skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>

                {generatedResume.impact_highlights.length ? (
                  <section className="mt-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">Selected Highlights</p>
                    <div className="mt-3 grid gap-3">
                      {generatedResume.impact_highlights.map((item) => (
                        <div key={item} className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm leading-7 text-slate-700">
                          {item}
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section className="mt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">Professional Experience</p>
                  <div className="mt-3 space-y-4">
                    {generatedResume.experience.map((item, index) => (
                      <div key={`${item.role}-${index}`} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="font-display text-lg text-slate-900">{item.role}</p>
                            <p className="text-sm text-slate-600">{item.organization || "Organization not specified"}</p>
                          </div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.period}</p>
                        </div>
                        <div className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
                          {item.bullets.map((bullet) => (
                            <p key={bullet}>- {bullet}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {(generatedResume.education.length || generatedResume.certifications.length) ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <section className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">Education</p>
                      <div className="mt-3 space-y-3">
                        {generatedResume.education.length ? (
                          generatedResume.education.map((item, index) => (
                            <div key={`${item.degree}-${index}`}>
                              <p className="font-medium text-slate-900">{item.degree}</p>
                              <p className="text-sm text-slate-600">
                                {[item.institution, item.graduation_date].filter(Boolean).join(" | ") || "Institution not specified"}
                              </p>
                              {item.details.length ? (
                                <p className="mt-1 text-sm leading-6 text-slate-700">{item.details.join(" ")}</p>
                              ) : null}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-600">No education block was available to rewrite.</p>
                        )}
                      </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">Certifications</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {generatedResume.certifications.length ? (
                          generatedResume.certifications.map((item) => (
                            <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                              {item}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-slate-600">No certifications were present in the source resume.</p>
                        )}
                      </div>
                    </section>
                  </div>
                ) : null}
              </article>
            ) : (
              <div className="rounded-[28px] border border-slate-200/70 bg-[linear-gradient(180deg,#ffffff,#eef7f2)] p-6 text-slate-900 shadow-[0_28px_80px_rgba(3,7,18,0.32)] md:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-display text-2xl text-slate-950">Premium preview will appear here</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Generate once and the studio will render a cleaner, recruiter-first version of the uploaded resume.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">What Gets Better</p>
                    <div className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
                      <p>- Headline copy that sounds targeted instead of generic.</p>
                      <p>- Summary phrasing that feels tighter, clearer, and faster to scan.</p>
                      <p>- Experience bullets rewritten to lead with ownership and action.</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">What Users Notice</p>
                    <div className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
                      <p>- Better ATS keyword organization.</p>
                      <p>- Stronger premium-style layout without a paid wall.</p>
                      <p>- Copy and download actions that make it usable immediately.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <p className="section-kicker">ATS Stack</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(generatedResume?.ats_keywords || []).length ? (
                  generatedResume?.ats_keywords.map((item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/82">
                      {item}
                    </span>
                  ))
                ) : (
                  <p className="text-sm leading-7 text-white/58">
                    Generate the resume to see the optimized keyword stack for the chosen role target.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <p className="section-kicker">Premium Touches</p>
              <div className="mt-4 space-y-2 text-sm leading-7 text-white/76">
                {(generatedResume?.recruiter_notes || []).length ? (
                  generatedResume?.recruiter_notes.map((item) => <p key={item}>{item}</p>)
                ) : (
                  <p>
                    The studio will explain which parts of the rewrite were tightened, reordered, or made easier for recruiters to scan.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </Card>
  );
}

function MetricTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">{label}</p>
      <p className="mt-2 font-display text-xl text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/58">{detail}</p>
    </div>
  );
}
