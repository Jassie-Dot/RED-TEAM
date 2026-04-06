"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BrainCircuit, FileUp, LoaderCircle, ScanSearch, Sparkles, X } from "lucide-react";

import { useAnalysisActions } from "@/components/analysis-provider";
import { useAppMode, useResumeStore } from "@/store/app-store";

export function EntryIntakeModal() {
  const router = useRouter();
  const pathname = usePathname();
  const { mode } = useAppMode();
  const analysis = useResumeStore((state) => state.analysis);
  const error = useResumeStore((state) => state.error);
  const isAnalyzing = useResumeStore((state) => state.isAnalyzing);
  const isUploading = useResumeStore((state) => state.isUploading);
  const parsedResume = useResumeStore((state) => state.parsedResume);
  const questions = useResumeStore((state) => state.questions);
  const uploadProgress = useResumeStore((state) => state.uploadProgress);
  const { handleResumeUpload } = useAnalysisActions();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [shouldAutoLaunchTest, setShouldAutoLaunchTest] = useState(false);

  useEffect(() => {
    if (parsedResume) {
      setOpen(false);
      return;
    }

    if (!dismissed) {
      setOpen(true);
    }
  }, [dismissed, parsedResume]);

  useEffect(() => {
    if (!shouldAutoLaunchTest || !analysis || !questions?.questions.length) {
      return;
    }

    setOpen(false);
    setDismissed(true);
    setShouldAutoLaunchTest(false);

    if (pathname !== "/student-lab") {
      router.push("/student-lab");
    }
  }, [analysis, pathname, questions?.questions.length, router, shouldAutoLaunchTest]);

  async function beginUpload(file?: File) {
    if (!file) {
      return;
    }

    setShouldAutoLaunchTest(true);
    await handleResumeUpload(file);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    void beginUpload(file);
    event.target.value = "";
  }

  const active = isUploading || isAnalyzing;

  return (
    <>
      <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleChange} />

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-[#020712]/78 backdrop-blur-md"
            />
            <motion.section
              initial={{ opacity: 0, y: 22, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed inset-x-4 top-1/2 z-[80] mx-auto w-full max-w-3xl -translate-y-1/2"
            >
              <div className="glass-panel-strong neon-border overflow-hidden rounded-[32px] p-6 md:p-7">
                <div className="scan-line opacity-20" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="section-kicker text-neon/85">Start With A Resume</p>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/65">
                          {mode === "HR" ? "Upload -> Test -> Verdict" : "Upload -> Practice -> Reality Check"}
                        </span>
                      </div>
                      <h2 className="mt-3 font-display text-3xl text-white md:text-[2.4rem]">
                        {mode === "HR"
                          ? "Upload the candidate resume to launch the verification test."
                          : "Upload your resume to launch the capability reality test."}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-white/66">
                        {mode === "HR"
                          ? "Vigil-AI will parse the resume, build the baseline risk scan, open the live capability test, and then generate a fake-vs-real verdict with claimed versus demonstrated skills."
                          : "Vigil-AI will parse the resume, extract claimed skills, open the adaptive test, and then show what looks real versus what still needs stronger proof."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setDismissed(true);
                        setOpen(false);
                      }}
                      className="surface-outline flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white/65 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    <StageCard icon={FileUp} title="1. Resume Upload" detail="Bring in the source document and parse the claims." />
                    <StageCard icon={BrainCircuit} title="2. Capability Test" detail="Pressure-test the strongest and weakest claims live." />
                    <StageCard icon={Sparkles} title="3. Authenticity Verdict" detail="See whether the profile looks real, mixed, or exaggerated." />
                  </div>

                  <div className="mt-6 rounded-[28px] border border-dashed border-white/15 bg-black/20 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="section-kicker text-white/55">{mode === "HR" ? "Candidate Intake" : "Skill Intake"}</p>
                        <p className="mt-2 font-display text-xl text-white">Upload a `.pdf` or `.docx` resume to begin.</p>
                        <p className="mt-2 text-sm text-white/62">
                          {active
                            ? mode === "HR"
                              ? "Parsing the resume and preparing the recruiter validation test..."
                              : "Parsing the resume and preparing the adaptive skill test..."
                            : "The test will open automatically as soon as the baseline analysis is ready."}
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
                        style={{ width: `${Math.max(uploadProgress, active ? 84 : 6)}%` }}
                      />
                    </div>

                    {active ? (
                      <div className="mt-3 flex items-center gap-2 text-sm text-white/68">
                        <ScanSearch size={16} className="text-pulse" />
                        {uploadProgress}% complete
                      </div>
                    ) : null}

                    {error ? <p className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p> : null}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="inline-flex h-11 items-center gap-2 rounded-2xl border border-neon/25 bg-neon/10 px-4 text-sm font-medium text-neon transition hover:border-neon/40 hover:bg-neon/14"
                    >
                      <ArrowRight size={15} />
                      Upload And Start Test
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDismissed(true);
                        setOpen(false);
                      }}
                      className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/78 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                    >
                      Continue To Workspace
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function StageCard({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof FileUp;
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
