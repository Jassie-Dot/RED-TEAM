"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { StartupResumeGate } from "@/components/startup-resume-gate";
import { useAppMode, useResumeStore, useUIStore } from "@/store/app-store";

const BOOT_SEEN_KEY = "vigil-ai-boot-seen";

export function BootScreen({ children }: { children: React.ReactNode }) {
  const { mode } = useAppMode();
  const bootComplete = useUIStore((state) => state.bootComplete);
  const completeBoot = useUIStore((state) => state.completeBoot);
  const resetBoot = useUIStore((state) => state.resetBoot);
  const resumeHydrated = useResumeStore((state) => state.hydrated);
  const parsedResume = useResumeStore((state) => state.parsedResume);
  const analysis = useResumeStore((state) => state.analysis);
  const isUploading = useResumeStore((state) => state.isUploading);
  const isAnalyzing = useResumeStore((state) => state.isAnalyzing);
  const [appVisible, setAppVisible] = useState(false);
  const [intakeUnlocked, setIntakeUnlocked] = useState(false);
  const resumeReady = Boolean(parsedResume && analysis && !isUploading && !isAnalyzing);
  const showResumeGate = bootComplete && (!resumeHydrated || !intakeUnlocked);

  useEffect(() => {
    const alreadySeen =
      typeof window !== "undefined" && window.sessionStorage.getItem(BOOT_SEEN_KEY) === "true";

    setAppVisible(true);

    if (alreadySeen) {
      completeBoot();
      return;
    }

    resetBoot();
    const finishTimer = window.setTimeout(() => {
      window.sessionStorage.setItem(BOOT_SEEN_KEY, "true");
      completeBoot();
    }, 3000);

    return () => {
      window.clearTimeout(finishTimer);
    };
  }, [completeBoot, resetBoot]);

  useEffect(() => {
    if (!resumeHydrated) {
      return;
    }

    if (resumeReady) {
      setIntakeUnlocked(true);
      return;
    }

    if (!parsedResume && !analysis && !isUploading && !isAnalyzing) {
      setIntakeUnlocked(false);
    }
  }, [analysis, isAnalyzing, isUploading, parsedResume, resumeHydrated, resumeReady]);

  return (
    <>
      {appVisible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: showResumeGate ? 0.22 : 1,
            scale: showResumeGate ? 0.992 : 1,
            filter: showResumeGate ? "blur(5px)" : "blur(0px)",
          }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className={showResumeGate ? "pointer-events-none select-none" : ""}
          aria-hidden={showResumeGate}
        >
          {children}
        </motion.div>
      ) : null}

      <AnimatePresence>
        {!bootComplete ? (
          <motion.div
            key="boot-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
            className="fixed inset-0 z-[140] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_30%),linear-gradient(180deg,#061019,#091621_40%,#061019)]"
          >
            <div className="boot-glow absolute inset-0" />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="glass-panel-strong neon-border w-[min(560px,calc(100vw-2rem))] rounded-[32px] px-8 py-10 text-center"
            >
              <p className="section-kicker text-neon/90">Vigil-AI</p>
              <h1 className="mt-4 font-display text-4xl text-white md:text-[3.2rem]">Booting SentinelX</h1>
              <p className="mt-3 text-sm leading-7 text-white/68">
                {mode === "HR"
                  ? "Preparing recruiting intelligence, resume analysis, and live assistant context."
                  : "Preparing capability analysis, improvement signals, and live assistant context."}
              </p>

              <div className="mt-8 rounded-full border border-white/10 bg-white/[0.05] p-1">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.7, ease: "easeInOut" }}
                  className="h-2 rounded-full bg-gradient-to-r from-neon to-pulse"
                />
              </div>

              <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
                {[
                  "Initializing workspace",
                  "Syncing evidence state",
                  "Linking assistant panel",
                ].map((label, index) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0.2, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.22, duration: 0.28 }}
                    className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/76"
                  >
                    {label}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {bootComplete ? <StartupResumeGate /> : null}
    </>
  );
}
