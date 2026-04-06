"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, FileUp, LoaderCircle, ScanSearch, ShieldCheck, Sparkles } from "lucide-react";

import { useAnalysisActions } from "@/components/analysis-provider";
import { buildAuthenticityInsight } from "@/lib/capability-insights";
import { useAppMode, useResumeStore } from "@/store/app-store";

export function UploadZone() {
  const router = useRouter();
  const { mode } = useAppMode();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [shouldLaunchTest, setShouldLaunchTest] = useState(false);
  const analysis = useResumeStore((state) => state.analysis);
  const assessment = useResumeStore((state) => state.assessment);
  const error = useResumeStore((state) => state.error);
  const isAnalyzing = useResumeStore((state) => state.isAnalyzing);
  const isUploading = useResumeStore((state) => state.isUploading);
  const lastFileName = useResumeStore((state) => state.lastFileName);
  const parsedResume = useResumeStore((state) => state.parsedResume);
  const questions = useResumeStore((state) => state.questions);
  const uploadProgress = useResumeStore((state) => state.uploadProgress);
  const { handleResumeUpload } = useAnalysisActions();
  const insight = buildAuthenticityInsight(mode, analysis, assessment);

  useEffect(() => {
    if (!shouldLaunchTest || !parsedResume || !analysis || !questions?.questions.length || assessment) {
      return;
    }

    setShouldLaunchTest(false);
    router.push("/student-lab");
  }, [analysis, assessment, parsedResume, questions?.questions.length, router, shouldLaunchTest]);

  async function beginUpload(file?: File) {
    if (!file) {
      return;
    }
    setShouldLaunchTest(true);
    await handleResumeUpload(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    void beginUpload(file);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    void beginUpload(file);
    event.target.value = "";
  }

  const isActive = isUploading || isAnalyzing;
  const testReady = Boolean(parsedResume && analysis && questions?.questions.length && !assessment);
  const verdictReady = Boolean(parsedResume && analysis && assessment);

  if (testReady) {
    return (
      <section className="glass-panel neon-border rounded-[30px] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker text-neon/85">{mode === "HR" ? "Capability Test Ready" : "Adaptive Test Ready"}</p>
            <h2 className="mt-3 font-display text-2xl text-white md:text-[2rem]">
              {mode === "HR"
                ? `${parsedResume?.candidate_name || "Candidate"} is ready for live claim verification.`
                : `${parsedResume?.candidate_name || "Candidate"} is ready for the capability reality test.`}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/66">
              {mode === "HR"
                ? "The resume has been parsed and the baseline risk scan is complete. Start the test now to see whether the strongest claims hold up in live answers."
                : "The resume baseline is complete. Start the test now to compare claimed skills against what can actually be explained and defended."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.push("/student-lab")}
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-neon to-pulse px-5 font-semibold uppercase tracking-[0.22em] text-[#04111d] transition hover:scale-[1.02]"
            >
              <BrainCircuit size={16} />
              Begin Test
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-5 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:border-neon/30 hover:bg-neon/10"
            >
              <FileUp size={16} />
              Upload Another Resume
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <StateCard label="Candidate" value={parsedResume?.candidate_name || "Awaiting upload"} detail={lastFileName || "No file loaded"} />
          <StateCard label={mode === "HR" ? "Baseline Score" : "Credibility Baseline"} value={analysis ? `${analysis.score}/100` : "--"} detail={analysis?.risk_level || "Pending"} />
          <StateCard label="Question Pack" value={`${questions?.questions.length || 0} prompts`} detail={mode === "HR" ? "Live verification ready" : "Adaptive practice ready"} />
        </div>

        <input ref={inputRef} type="file" accept=".pdf,.docx" onChange={handleChange} className="hidden" />
      </section>
    );
  }

  if (verdictReady) {
    return (
      <section className="glass-panel neon-border rounded-[30px] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker text-pulse/85">{mode === "HR" ? "Authenticity Verdict Ready" : "Capability Verdict Ready"}</p>
            <h2 className="mt-3 font-display text-2xl text-white md:text-[2rem]">{insight?.verdict || "Final analysis ready"}</h2>
            <p className="mt-3 text-sm leading-7 text-white/66">{insight?.summary}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.push("/reports")}
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-neon to-pulse px-5 font-semibold uppercase tracking-[0.22em] text-[#04111d] transition hover:scale-[1.02]"
            >
              <Sparkles size={16} />
              Open Final Report
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-5 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:border-neon/30 hover:bg-neon/10"
            >
              <FileUp size={16} />
              Upload Another Resume
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <StateCard label="Authenticity Score" value={`${insight?.authenticityScore || 0}/100`} detail={`Baseline ${insight?.baselineScore || 0}/100`} />
          <StateCard label={mode === "HR" ? "Live Capability Score" : "Test Capability Score"} value={insight?.liveScore !== null ? `${insight?.liveScore}/100` : "Pending"} detail={mode === "HR" ? "Interview pressure result" : "Adaptive test result"} />
          <StateCard label={mode === "HR" ? "Claims To Verify" : "Skills To Rebuild"} value={`${insight?.exaggeratedCount || 0}`} detail={mode === "HR" ? "Potential exaggeration areas" : "Weakly defended capabilities"} />
        </div>

        <input ref={inputRef} type="file" accept=".pdf,.docx" onChange={handleChange} className="hidden" />
      </section>
    );
  }

  return (
    <section
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`glass-panel neon-border relative overflow-hidden rounded-[30px] p-5 sm:p-6 ${
        dragging ? "scale-[1.005] border-neon/40 shadow-neon" : ""
      }`}
    >
      {isActive ? <div className="scan-line opacity-40" /> : null}
      <div className="relative">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker text-neon/85">{mode === "HR" ? "Resume Intake" : "Candidate Entry Point"}</p>
            <h2 className="mt-3 font-display text-2xl text-white md:text-[2rem]">
              {mode === "HR"
                ? "Upload a candidate resume for live scoring and risk review."
                : "Upload a resume to map real skills, launch adaptive testing, and build an improvement roadmap."}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/66">
              {mode === "HR"
                ? "Vigil-AI parses PDF and DOCX resumes, builds structured candidate data, validates skill evidence, and prepares interview questions in one workflow."
                : "Vigil-AI parses PDF and DOCX resumes, extracts the claimed stack, measures evidence strength, and turns weak claims into targeted practice drills."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-neon to-pulse px-5 font-semibold uppercase tracking-[0.22em] text-[#04111d] transition hover:scale-[1.02]"
          >
            {isActive ? <LoaderCircle className="animate-spin" size={16} /> : <FileUp size={16} />}
            {isUploading ? "Uploading" : isAnalyzing ? "Analyzing" : "Select Resume"}
          </button>
        </div>

        <div
          className={`mt-6 rounded-[28px] border border-dashed p-6 text-center transition ${
            dragging ? "border-neon/60 bg-neon/10" : "border-white/15 bg-black/20"
          }`}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.04]">
            {isAnalyzing ? <ScanSearch className="text-pulse" size={28} /> : <ShieldCheck className="text-neon" size={28} />}
          </div>
          <h3 className="mt-4 font-display text-xl text-white">Drop resume here or browse your files</h3>
          <p className="mt-2 text-sm text-white/62">
            Supports `.pdf` and `.docx`. Upload progress, parsing, and {mode === "HR" ? "AI scoring" : "skill-reality analysis"} update in real time.
          </p>

          <div className="mx-auto mt-6 max-w-xl rounded-full border border-white/10 bg-white/[0.03] p-1">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-neon to-pulse transition-all duration-300"
              style={{ width: `${Math.max(uploadProgress, isAnalyzing ? 88 : 6)}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-white/60">
            <span>
              {isAnalyzing
                ? mode === "HR"
                  ? "Running candidate integrity analysis..."
                  : "Running candidate evaluation analysis..."
                : isUploading
                  ? "Uploading securely..."
                  : mode === "HR"
                    ? "Ready for the next candidate"
                    : "Ready for the next skill reality check"}
            </span>
            {isActive ? (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-semibold uppercase tracking-[0.22em] text-white/75">
                {uploadProgress || 0}%
              </span>
            ) : null}
          </div>

          {lastFileName ? <p className="mt-4 text-sm text-neon/88">Current file: {lastFileName}</p> : null}
          {error ? <p className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p> : null}
        </div>

        <input ref={inputRef} type="file" accept=".pdf,.docx" onChange={handleChange} className="hidden" />
      </div>
    </section>
  );
}

function StateCard({
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
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">{label}</p>
      <p className="mt-2 font-display text-2xl text-white">{value}</p>
      <p className="mt-2 text-sm text-white/62">{detail}</p>
    </div>
  );
}
