"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BrainCircuit,
  FileUp,
  LoaderCircle,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { useAnalysisActions } from "@/components/analysis-provider";
import { useAppMode, useResumeStore } from "@/store/app-store";

export function StartupResumeGate() {
  const { mode } = useAppMode();
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const parsedResume = useResumeStore((state) => state.parsedResume);
  const analysis = useResumeStore((state) => state.analysis);
  const assessment = useResumeStore((state) => state.assessment);
  const error = useResumeStore((state) => state.error);
  const isUploading = useResumeStore((state) => state.isUploading);
  const isAnalyzing = useResumeStore((state) => state.isAnalyzing);
  const uploadProgress = useResumeStore((state) => state.uploadProgress);
  const lastFileName = useResumeStore((state) => state.lastFileName);
  const { handleResumeUpload } = useAnalysisActions();

  const active = isUploading || isAnalyzing;
  const readyToProceed = Boolean(parsedResume && analysis && !active);

  useEffect(() => {
    if (!readyToProceed || assessment || pathname === "/student-lab") {
      return;
    }

    router.replace("/student-lab");
  }, [assessment, pathname, readyToProceed, router]);

  async function beginUpload(file?: File) {
    if (!file) {
      return;
    }

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

  if (readyToProceed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        key="startup-resume-gate"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[130] overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_30%),linear-gradient(180deg,rgba(4,10,18,0.9),rgba(3,8,15,0.96))] px-4 py-8 backdrop-blur-xl sm:px-6 lg:px-8"
      >
        <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleChange} />

        <motion.section
          initial={{ opacity: 0, y: 26, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="mx-auto flex min-h-full w-full max-w-5xl items-center"
        >
          <div className="glass-panel-strong neon-border relative w-full overflow-hidden rounded-[34px] p-6 sm:p-8 xl:p-10">
            <div className="boot-glow absolute inset-0 opacity-45" />
            <div className="scan-line opacity-20" />

            <div className="relative grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="section-kicker text-neon/90">Startup Checkpoint</p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/62">
                    Resume Required
                  </span>
                </div>

                <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight text-white md:text-[3.15rem]">
                  {mode === "HR"
                    ? "Upload a resume before the recruiting workspace opens."
                    : "Upload your resume before the skill workspace opens."}
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">
                  {mode === "HR"
                    ? "We will parse the resume, generate the baseline trust scan, and prep the interview workflow before handing you the full workspace."
                    : "We will parse your resume, build the baseline capability scan, and prepare the adaptive practice flow before handing you the full workspace."}
                </p>

                <div className="mt-7 grid gap-3 md:grid-cols-3">
                  <GateStep
                    icon={FileUp}
                    title="1. Upload Resume"
                    detail="Bring in the source document that anchors the rest of the workflow."
                  />
                  <GateStep
                    icon={BrainCircuit}
                    title="2. Build Baseline"
                    detail="Parse the claims, score the evidence, and prepare the next actions."
                  />
                  <GateStep
                    icon={Sparkles}
                    title="3. Enter Workspace"
                    detail="Proceed into the dashboard once the startup analysis is ready."
                  />
                </div>
              </div>

              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`relative overflow-hidden rounded-[30px] border border-dashed p-6 transition sm:p-7 ${
                  dragging ? "border-neon/55 bg-neon/12" : "border-white/15 bg-black/25"
                }`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.05] text-neon">
                  {active ? (
                    isUploading ? (
                      <LoaderCircle size={28} className="animate-spin text-pulse" />
                    ) : (
                      <ScanSearch size={28} className="text-pulse" />
                    )
                  ) : (
                    <ShieldCheck size={28} />
                  )}
                </div>

                <p className="section-kicker mt-5 text-white/54">
                  {mode === "HR" ? "Candidate Intake" : "Skill Intake"}
                </p>
                <h2 className="mt-3 font-display text-[2rem] leading-tight text-white">
                  {active ? "Preparing your workspace..." : "Upload a `.pdf` or `.docx` resume to continue."}
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/64">
                  {active
                    ? mode === "HR"
                      ? "Parsing the resume, building the trust baseline, and generating the next verification flow."
                      : "Parsing the resume, building the capability baseline, and generating the next practice flow."
                    : "Drop the file here or choose it from your device. The app will continue automatically once the startup analysis is complete."}
                </p>

                <div className="mt-6 rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {lastFileName || "No resume selected yet"}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/42">
                        {active ? "Startup analysis in progress" : "PDF and DOCX supported"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-neon to-pulse px-5 font-semibold uppercase tracking-[0.22em] text-[#04111d] transition hover:scale-[1.02]"
                    >
                      {active ? <LoaderCircle size={16} className="animate-spin" /> : <FileUp size={16} />}
                      {isUploading ? "Uploading" : isAnalyzing ? "Analyzing" : "Upload Resume"}
                    </button>
                  </div>

                  <div className="mt-5 rounded-full border border-white/10 bg-white/[0.04] p-1">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-neon to-pulse transition-all duration-300"
                      style={{ width: `${Math.max(uploadProgress, active ? 88 : lastFileName ? 20 : 6)}%` }}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/66">
                    <span>
                      {active
                        ? mode === "HR"
                          ? "Recruiter workflow is initializing from the uploaded resume."
                          : "Skill workspace is initializing from the uploaded resume."
                        : "The rest of the app unlocks right after the startup pipeline succeeds."}
                    </span>
                    {active ? (
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/78">
                        {uploadProgress}%
                      </span>
                    ) : null}
                  </div>
                </div>

                {error ? (
                  <p className="mt-4 rounded-[22px] border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                    {error}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}

function GateStep({
  icon: Icon,
  title,
  detail,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neon/20 bg-neon/10 text-neon">
        <Icon size={18} />
      </div>
      <p className="mt-4 font-display text-lg text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/62">{detail}</p>
    </div>
  );
}
