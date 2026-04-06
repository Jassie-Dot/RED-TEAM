"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, DragEvent, useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BrainCircuit,
  FileUp,
  LoaderCircle,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
  ChevronRight
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
        className="fixed inset-0 z-[130] overflow-y-auto bg-[#09090b]/80 backdrop-blur-2xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleChange} />

        <motion.section
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto flex min-h-full w-full max-w-5xl items-center"
        >
          <div className="glass-panel-strong relative w-full overflow-hidden rounded-[24px] p-6 sm:p-8 xl:p-10 shadow-[0_0_100px_rgba(255,255,255,0.02)]">
            <div className="absolute inset-0 bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none" />

            <div className="relative grid gap-10 xl:grid-cols-[1fr_1fr]">
              <div className="flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 shadow-sm">
                    <div className="h-4 w-4 rounded-full bg-white text-black flex items-center justify-center">
                      <ShieldCheck size={10} />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wide text-white/70">
                      Checkpoint
                    </span>
                  </div>
                </div>

                <h1 className="font-display text-4xl font-semibold tracking-tight text-white md:text-5xl lg:leading-[1.1]">
                  {mode === "HR"
                    ? "Initialize Workspace"
                    : "Initialize Skill Lab"}
                </h1>

                <p className="mt-4 text-[15px] leading-relaxed text-white/50 max-w-md">
                  {mode === "HR"
                    ? "Upload the candidate's resume. Vigil-AI will parse the data, run verification checks, and prepare the recruiting suite."
                    : "Upload your resume. Vigil-AI will parse your claims, build your capability baseline, and spin up the environment."}
                </p>

                <div className="mt-10 grid gap-3">
                  <GateStep icon={FileUp} title="Extract" detail="Parse the raw document." />
                  <GateStep icon={BrainCircuit} title="Analyze" detail="Score baseline and verify claims." />
                  <GateStep icon={Sparkles} title="Initialize" detail="Enter the active dashboard." />
                </div>
              </div>

              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`relative flex flex-col justify-center overflow-hidden rounded-[20px] transition-all duration-300 ${
                  dragging ? "bg-white/[0.04] border-white/20 scale-[1.01]" : "bg-[#0c0c0e] border border-white/10 hover:border-white/15"
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='20' ry='20' stroke='white' stroke-width='2' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-opacity='0.1' stroke-linecap='square'/%3e%3c/svg%3e")`,
                  borderRadius: '20px'
                }}
              >
                <div className="p-8 sm:p-10 flex flex-col items-center text-center">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl mb-6 shadow-sm transition-all duration-500
                    ${active ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'bg-white/5 border border-white/10 text-white/80'}`}>
                    {active ? (
                      isUploading ? (
                        <LoaderCircle size={24} className="animate-spin" />
                      ) : (
                        <ScanSearch size={24} className="animate-pulse" />
                      )
                    ) : (
                      <FileUp size={24} />
                    )}
                  </div>

                  <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-white/90">
                    {active ? "Processing document..." : "Upload Resume"}
                  </h2>
                  <p className="mt-2.5 text-[14px] text-white/50 max-w-xs leading-relaxed">
                    {active
                      ? "Running the AI ingestion pipeline."
                      : "Drag and drop your .pdf or .docx here to begin the workflow."}
                  </p>

                  <div className="mt-8 w-full max-w-sm">
                    {active ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 pr-4">
                          <div className="h-8 w-8 rounded-lg bg-black/40 flex items-center justify-center border border-white/5">
                            <span className="text-xs uppercase text-white/40 tracking-wider">Doc</span>
                          </div>
                          <div className="min-w-0 flex-1 text-left">
                            <p className="text-[13px] font-medium text-white truncate">{lastFileName}</p>
                            <p className="text-[11px] text-white/40">{isUploading ? "Uploading..." : "Analyzing..."}</p>
                          </div>
                          <p className="text-[13px] font-medium text-white">{uploadProgress}%</p>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                          <div 
                            className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-300 ease-out"
                            style={{ width: `${Math.max(uploadProgress, 5)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-6 font-medium text-black transition-all hover:bg-neutral-200"
                      >
                        Select a file
                        <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                      </button>
                    )}
                  </div>

                  {error ? (
                    <div className="mt-5 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger text-left m-auto">
                      {error}
                    </div>
                  ) : null}
                </div>
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
    <div className="flex items-center gap-4 bg-white/[0.02] border border-white-[0.04] p-3 rounded-2xl">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/60">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[14px] font-medium text-white/90">{title}</p>
        <p className="text-[13px] text-white/40">{detail}</p>
      </div>
    </div>
  );
}
