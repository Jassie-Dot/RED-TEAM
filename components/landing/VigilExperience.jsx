"use client";

import { useEffect, useState } from "react";
import BootSequence from "./BootSequence";
import EmployerConsole from "./EmployerConsole";
import StudentConsole from "./StudentConsole";

const bootLines = [
  "handshake:: employer console online",
  "parser:: resume extraction mesh primed",
  "groq:: reasoning channel authorized",
  "interrogator:: technical question lattice ready",
  "verdict:: originality confidence model synchronized",
];

const roleCards = [
  {
    id: "employer",
    label: "Employer",
    title: "Run deep authenticity screening",
    body: "Upload a resume, generate Groq-backed technical questions, and receive a fake-vs-original confidence verdict.",
  },
  {
    id: "student",
    label: "Student",
    title: "See how the detector evaluates you",
    body: "Understand what raises risk, what improves confidence, and how to explain your real project work under pressure.",
  },
];

export default function VigilExperience() {
  const [bootComplete, setBootComplete] = useState(false);
  const [visibleLines, setVisibleLines] = useState(1);
  const [activeMode, setActiveMode] = useState(null);

  useEffect(() => {
    if (bootComplete) return undefined;

    const timers = bootLines.map((_, index) =>
      setTimeout(() => {
        setVisibleLines(index + 1);
      }, 320 * (index + 1)),
    );

    const completionTimer = setTimeout(() => {
      setBootComplete(true);
    }, 320 * (bootLines.length + 2));

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      clearTimeout(completionTimer);
    };
  }, [bootComplete]);

  if (!bootComplete) {
    return <BootSequence lines={bootLines} onSkip={() => setBootComplete(true)} visibleCount={visibleLines} />;
  }

  if (activeMode === "employer") {
    return <EmployerConsole onBack={() => setActiveMode(null)} />;
  }

  if (activeMode === "student") {
    return <StudentConsole onBack={() => setActiveMode(null)} onSwitchToEmployer={() => setActiveMode("employer")} />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040814] px-4 py-5 text-slate-100 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_right,rgba(45,212,191,0.1),transparent_25%),linear-gradient(180deg,#050816_0%,#08101f_52%,#040814_100%)]" />
      <div className="grid-overlay absolute inset-0 opacity-35" />
      <div className="scanline-overlay absolute inset-0 opacity-20" />

      <section className="relative z-10 mx-auto max-w-7xl">
        <article className="overflow-hidden rounded-[36px] border border-cyan-300/15 bg-slate-950/70 p-6 shadow-[0_0_70px_rgba(34,211,238,0.12)] backdrop-blur-2xl sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.44em] text-cyan-300/80">VIGIL-AI</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.08em] text-white sm:text-5xl lg:text-7xl">
                Detect fake resumes with a cyber interview engine
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                A futuristic employer dashboard that parses a resume, maps claimed skills, generates Groq-powered technical questions, and returns an originality verdict with visual intelligence.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                "Boot sequence and role gateway",
                "Digital resume twin for employers",
                "Auto-generated skill interrogation",
                "Fake-vs-original verdict analytics",
              ].map((item, index) => (
                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5" key={item}>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Node 0{index + 1}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {roleCards.map((card) => (
            <button
              className="group relative overflow-hidden rounded-[34px] border border-white/10 bg-slate-950/70 p-6 text-left shadow-[0_0_50px_rgba(34,211,238,0.08)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-slate-900/80"
              key={card.id}
              onClick={() => setActiveMode(card.id)}
              type="button"
            >
              <div className="aurora-ring absolute -right-10 top-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl transition duration-300 group-hover:bg-cyan-300/20" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.38em] text-cyan-300/80">{card.label}</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-white">{card.title}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">{card.body}</p>
                <span className="mt-8 inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100">
                  Open mode
                </span>
              </div>
            </button>
          ))}
        </section>
      </section>
    </main>
  );
}
