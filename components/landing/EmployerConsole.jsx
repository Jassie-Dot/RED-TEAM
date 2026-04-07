"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const stages = [
  { id: "intake", label: "Resume Intake" },
  { id: "interrogation", label: "Skill Interrogation" },
  { id: "verdict", label: "Authenticity Verdict" },
];

function toneClass(tone) {
  if (tone === "good") return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
  if (tone === "warn") return "border-amber-400/25 bg-amber-400/10 text-amber-100";
  if (tone === "risk") return "border-rose-400/25 bg-rose-400/10 text-rose-100";
  return "border-cyan-300/20 bg-cyan-400/10 text-cyan-100";
}

export default function EmployerConsole({ onBack }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [report, setReport] = useState(null);
  const [currentStage, setCurrentStage] = useState("intake");
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const stageIndex = stages.findIndex((stage) => stage.id === currentStage);
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  const heroBadge = useMemo(() => {
    if (report) return report.authenticityVerdict;
    if (resumeData) return resumeData.analysisMode;
    return "Awaiting resume upload";
  }, [report, resumeData]);

  function resetFlow() {
    setResumeFile(null);
    setResumeData(null);
    setQuestions([]);
    setAnswers({});
    setReport(null);
    setCurrentStage("intake");
    setLoading("");
    setError("");
  }

  async function handleUpload(event) {
    event.preventDefault();
    setError("");
    setReport(null);

    if (!resumeFile) {
      setError("Choose a resume file before launching the authenticity scan.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      setLoading("Decrypting resume signals, extracting skill graph, and generating Groq questions...");
      const response = await fetch("/api/resume", { method: "POST", body: formData });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Resume analysis failed.");
      }

      setResumeData(payload.resumeData);
      setQuestions(payload.questions ?? []);
      setAnswers({});
      setCurrentStage("interrogation");
    } catch (uploadError) {
      setError(uploadError.message || "Resume analysis failed.");
    } finally {
      setLoading("");
    }
  }

  async function handleEvaluate(event) {
    event.preventDefault();
    setError("");

    const unanswered = questions.filter((question) => !answers[question.id]);
    if (unanswered.length) {
      setError("Answer every generated question before requesting the authenticity verdict.");
      return;
    }

    try {
      setLoading("Comparing live answers against resume claims and calculating authenticity confidence...");
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, questions, resumeData }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Evaluation failed.");
      }

      setReport(payload.report);
      setCurrentStage("verdict");
    } catch (evaluationError) {
      setError(evaluationError.message || "Evaluation failed.");
    } finally {
      setLoading("");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040814] px-4 py-5 text-slate-100 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.15),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.14),transparent_26%),linear-gradient(180deg,#050816_0%,#08101f_52%,#040814_100%)]" />
      <div className="grid-overlay absolute inset-0 opacity-35" />
      <div className="scanline-overlay absolute inset-0 opacity-25" />

      <section className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[30px] border border-white/10 bg-slate-950/70 px-5 py-5 shadow-[0_0_70px_rgba(34,211,238,0.12)] backdrop-blur-2xl">
          <div>
            <p className="text-xs uppercase tracking-[0.36em] text-cyan-300/80">Employer Command Center</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white sm:text-4xl">Fake Resume Detector</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-100">
              {heroBadge}
            </div>
            <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5" onClick={onBack} type="button">
              Back
            </button>
            <button className="rounded-full bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15" onClick={resetFlow} type="button">
              Reset
            </button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <section className="space-y-6">
            <article className="overflow-hidden rounded-[32px] border border-cyan-300/15 bg-slate-950/70 p-6 backdrop-blur-2xl">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Pipeline</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">Upload, interrogate, verify</h2>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Question Progress</p>
                  <strong className="mt-1 block text-2xl tracking-[-0.05em] text-white">{progress}%</strong>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {stages.map((stage, index) => {
                  const active = currentStage === stage.id;
                  const complete = stageIndex > index;
                  return (
                    <div
                      className={`rounded-2xl border px-4 py-4 text-sm transition ${active ? "border-cyan-300/35 bg-cyan-400/10 text-white shadow-[0_0_24px_rgba(34,211,238,0.18)]" : complete ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-50" : "border-white/10 bg-white/[0.03] text-slate-400"}`}
                      key={stage.id}
                    >
                      <p className="text-xs uppercase tracking-[0.26em] opacity-70">Stage {index + 1}</p>
                      <p className="mt-2 font-medium">{stage.label}</p>
                    </div>
                  );
                })}
              </div>
            </article>

            {loading ? <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-4 text-sm text-cyan-100">{loading}</div> : null}
            {error ? <div className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-4 text-sm text-rose-100">{error}</div> : null}

            {currentStage === "intake" ? (
              <form className="grid gap-6 rounded-[32px] border border-white/10 bg-slate-950/70 p-6 backdrop-blur-2xl lg:grid-cols-[1fr_0.9fr]" onSubmit={handleUpload}>
                <div>
                  <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Intake Dock</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">Upload a digital resume artifact</h3>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                    The file is parsed, summarized, scored for suspicious signals, and sent into a Groq-generated technical interrogation flow.
                  </p>

                  <label className="mt-6 block rounded-[28px] border border-dashed border-cyan-300/30 bg-black/20 p-6 text-center transition hover:border-cyan-300/50 hover:bg-cyan-400/5">
                    <span className="block text-xs uppercase tracking-[0.3em] text-cyan-200/75">Supported: PDF, DOCX, TXT</span>
                    <span className="mt-4 block text-lg font-medium text-white">{resumeFile ? resumeFile.name : "Drop in a resume or click to browse"}</span>
                    <span className="mt-3 block text-sm text-slate-400">Once uploaded, the dashboard auto-jumps into the question phase.</span>
                    <input accept=".pdf,.docx,.txt,.md,.doc" className="hidden" onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)} type="file" />
                  </label>

                  <button className="mt-6 rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-200" disabled={Boolean(loading)} type="submit">
                    Launch authenticity scan
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    "Groq extracts candidate claims, role fit, and suspicion signals.",
                    "The engine auto-generates technical questions from the resume itself.",
                    "Final verdict blends resume risk signals with answer quality.",
                  ].map((item, index) => (
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5" key={item}>
                      <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">Signal {index + 1}</p>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{item}</p>
                    </div>
                  ))}
                </div>
              </form>
            ) : null}

            {currentStage === "interrogation" && resumeData ? (
              <form className="space-y-5 rounded-[32px] border border-white/10 bg-slate-950/70 p-6 backdrop-blur-2xl" onSubmit={handleEvaluate}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Generated Questions</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">Interrogate the claimed skills</h3>
                  </div>
                  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                    {answeredCount}/{questions.length} answered
                  </div>
                </div>

                {questions.map((question, index) => (
                  <article className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5" key={question.id}>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-300">Q{index + 1}</span>
                      <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-100">{question.skill}</span>
                    </div>
                    <h4 className="text-xl font-medium tracking-[-0.04em] text-white">{question.prompt}</h4>
                    <div className="mt-5 grid gap-3">
                      {question.options.map((option) => (
                        <label
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-4 text-sm transition ${answers[question.id] === option.id ? "border-cyan-300/35 bg-cyan-400/10 text-white" : "border-white/10 bg-black/20 text-slate-300 hover:border-cyan-300/20 hover:bg-white/[0.04]"}`}
                          key={option.id}
                        >
                          <input
                            checked={answers[question.id] === option.id}
                            className="h-4 w-4 accent-cyan-300"
                            name={question.id}
                            onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                            type="radio"
                            value={option.id}
                          />
                          <span>{option.text}</span>
                        </label>
                      ))}
                    </div>
                  </article>
                ))}

                <button className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-200" disabled={Boolean(loading)} type="submit">
                  Generate authenticity verdict
                </button>
              </form>
            ) : null}

            {currentStage === "verdict" && report ? (
              <section className="space-y-5 rounded-[32px] border border-white/10 bg-slate-950/70 p-6 backdrop-blur-2xl">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {report.signalCards.map((card) => (
                    <article className={`rounded-[24px] border p-5 ${toneClass(card.tone)}`} key={card.label}>
                      <p className="text-xs uppercase tracking-[0.28em]">{card.label}</p>
                      <strong className="mt-3 block text-2xl tracking-[-0.05em]">{card.value}</strong>
                    </article>
                  ))}
                </div>

                <article className="rounded-[28px] border border-cyan-300/20 bg-cyan-400/10 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/85">Final Call</p>
                      <h3 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white">{report.authenticityVerdict}</h3>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-right">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Authenticity Score</p>
                      <strong className="mt-1 block text-3xl tracking-[-0.05em] text-white">{report.authenticityScore}%</strong>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-slate-100/85">{report.narrative}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-200/85">
                    <span className="font-semibold text-white">Recommendation:</span> {report.recommendation}
                  </p>
                </article>

                <div className="grid gap-5 lg:grid-cols-2">
                  <article className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Interview Insights</p>
                    <div className="mt-4 space-y-3">
                      {report.interviewInsights.map((insight) => (
                        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-slate-200" key={insight}>
                          {insight}
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Follow-ups</p>
                    <div className="mt-4 space-y-3">
                      {report.followUps.map((item) => (
                        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-slate-200" key={item}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </article>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  {report.skillBreakdown.map((skill) => (
                    <article className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5" key={skill.skill}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="text-xl font-medium tracking-[-0.04em] text-white">{skill.skill}</h4>
                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">{skill.score}% observed</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-300">Claimed: {skill.claimedLevel} | Demonstrated: {skill.actualLevel}</p>
                      <p className="mt-4 text-sm leading-7 text-slate-200">{skill.insight}</p>
                    </article>
                  ))}
                </div>

                <article className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Question Review</p>
                  <div className="mt-4 grid gap-4">
                    {report.questionResults.map((item, index) => (
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4" key={item.id}>
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">Q{index + 1}</span>
                          <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.24em] ${item.isCorrect ? "border border-emerald-400/25 bg-emerald-400/10 text-emerald-200" : "border border-rose-400/25 bg-rose-400/10 text-rose-100"}`}>
                            {item.isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        </div>
                        <h4 className="text-lg font-medium tracking-[-0.03em] text-white">{item.prompt}</h4>
                        <p className="mt-3 text-sm text-slate-300">Selected: {item.selectedOption}</p>
                        <p className="mt-1 text-sm text-slate-300">Expected: {item.correctOption}</p>
                        <p className="mt-3 text-sm leading-7 text-slate-200">{item.rationale}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            ) : null}
          </section>

          <aside className="space-y-6">
            <section className="sticky top-5 overflow-hidden rounded-[32px] border border-cyan-300/15 bg-slate-950/70 p-6 backdrop-blur-2xl">
              <div className="aurora-ring absolute -right-10 top-8 h-36 w-36 rounded-full bg-cyan-400/15 blur-3xl" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Digital Resume Twin</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">{resumeData ? resumeData.candidateName : "Waiting for upload"}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {resumeData ? resumeData.summary : "Once a resume is uploaded, the extracted digital profile, claimed skills, and suspicion signals appear here in real time."}
                </p>

                {resumeData ? (
                  <div className="mt-6 space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Role Fit</p>
                        <p className="mt-2 text-sm text-white">{resumeData.roleFit}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Experience</p>
                        <p className="mt-2 text-sm text-white">{resumeData.yearsOfExperience}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Claimed Skills</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {resumeData.skills.map((skill) => (
                          <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs uppercase tracking-[0.22em] text-cyan-100" key={skill.name}>
                            {skill.name} | {skill.level}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Risk Signals</p>
                      <div className="mt-3 space-y-3">
                        {resumeData.riskSignals.length ? resumeData.riskSignals.map((signal) => (
                          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-4 text-sm leading-7 text-rose-100" key={signal}>
                            {signal}
                          </div>
                        )) : <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm leading-7 text-emerald-100">No major suspicion signal was found before the interview phase.</div>}
                      </div>
                    </div>

                    {report ? (
                      <div className="h-72 rounded-[28px] border border-white/10 bg-black/20 p-4">
                        <p className="mb-4 text-xs uppercase tracking-[0.26em] text-slate-400">Claimed vs observed</p>
                        <ResponsiveContainer height="100%" width="100%">
                          <BarChart data={report.chartData}>
                            <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="4 4" />
                            <XAxis dataKey="skill" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                            <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="Claimed" fill="#67e8f9" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="Observed" fill="#2dd4bf" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
