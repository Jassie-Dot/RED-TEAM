"use client";

import Link from "next/link";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { ArrowRight, FileUp, LoaderCircle, ScanSearch } from "lucide-react";

import { useAnalysisActions } from "@/components/analysis-provider";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatScore, getStatusVariant } from "@/lib/utils";
import { useResumeStore } from "@/store/app-store";

export function ResumeIntakeCard() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const parsedResume = useResumeStore((state) => state.parsedResume);
  const analysis = useResumeStore((state) => state.analysis);
  const isUploading = useResumeStore((state) => state.isUploading);
  const isAnalyzing = useResumeStore((state) => state.isAnalyzing);
  const uploadProgress = useResumeStore((state) => state.uploadProgress);
  const error = useResumeStore((state) => state.error);
  const lastFileName = useResumeStore((state) => state.lastFileName);
  const { handleResumeUpload } = useAnalysisActions();

  const active = isUploading || isAnalyzing;

  async function beginUpload(file?: File) {
    if (!file) {
      return;
    }

    await handleResumeUpload(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void beginUpload(event.dataTransfer.files?.[0]);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    void beginUpload(event.target.files?.[0]);
    event.target.value = "";
  }

  return (
    <Card variant="default" className="h-full p-6 md:p-7">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleChange}
        className="hidden"
      />

      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Resume Intake</Badge>
          <Badge variant={parsedResume ? "success" : "neutral"}>
            {parsedResume ? "Live dossier" : "Awaiting upload"}
          </Badge>
        </div>
        <CardTitle>{parsedResume ? "Candidate dossier is live" : "Start with a premium upload flow"}</CardTitle>
        <CardDescription>
          {parsedResume
            ? "Refresh the source file at any time. Vigil-AI keeps parsing, trust scoring, resume generation, and question preparation aligned in the background."
            : "Upload a PDF or DOCX file to unlock the dashboard, AI analysis, premium resume studio, insights, and capability testing."}
        </CardDescription>
      </CardHeader>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative mt-6 overflow-hidden rounded-[30px] border p-5 transition duration-300 ${
          dragging
            ? "border-neon/30 bg-neon/[0.08] shadow-[0_0_0_1px_rgba(var(--neon-rgb),0.08),0_20px_56px_rgba(var(--neon-rgb),0.14)]"
            : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]"
        }`}
      >
        <div className="pointer-events-none absolute -right-10 top-[-2rem] h-32 w-32 rounded-full bg-neon/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-3rem] left-[-2rem] h-32 w-32 rounded-full bg-pulse/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] text-neon shadow-[0_12px_28px_rgba(var(--neon-rgb),0.12)]">
              {active ? (
                <LoaderCircle size={24} className="animate-spin text-pulse" />
              ) : (
                <FileUp size={24} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="section-kicker">Drag and drop</p>
              <h3 className="mt-2 font-display text-[1.65rem] leading-tight text-white">
                {parsedResume ? "Upload a fresh version any time" : "Drop a resume here or browse securely"}
              </h3>
              <p className="mt-2 text-sm leading-7 text-white/58">
                {active
                  ? "The parser, trust engine, and question builder are running in parallel so the workspace stays fast."
                  : "Glassmorphism upload flow, clear status feedback, and a live file card once the resume is ingested."}
              </p>
            </div>
          </div>

          {parsedResume ? (
            <>
              <div className="mt-6 rounded-[26px] border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-display text-2xl text-white">{parsedResume.candidate_name}</p>
                    <p className="mt-1 text-sm text-white/56">{lastFileName || "Resume artifact loaded"}</p>
                  </div>
                  <Badge variant={getStatusVariant(analysis?.risk_level)}>
                    {analysis?.risk_level || "Pending"}
                  </Badge>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <StatusTile
                  label="Trust Score"
                  value={analysis ? formatScore(analysis.score) : "Pending"}
                  detail={analysis?.risk_level || "Awaiting analysis"}
                />
                <StatusTile
                  label="Workspace State"
                  value={active ? "Refreshing" : "Ready"}
                  detail={active ? "AI tasks still running" : "Profile is ready for review"}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={() => inputRef.current?.click()} variant="secondary">
                  <FileUp size={16} />
                  Upload Another
                </Button>
                <Link href="/resume-analysis" className={buttonStyles({ variant: "ghost" })}>
                  View Analysis
                  <ArrowRight size={15} />
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <StatusTile label="Formats" value="PDF / DOCX" detail="Secure upload and parsing" />
                <StatusTile label="AI Output" value="Trust + Summary" detail="Signals, scoring, and evidence review" />
                <StatusTile label="Capability" value="Adaptive Test" detail="Question pack generated after analysis" />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={() => inputRef.current?.click()} variant="primary">
                  {active ? <ScanSearch size={16} /> : <FileUp size={16} />}
                  {isUploading ? "Uploading" : isAnalyzing ? "Analyzing" : "Select Resume"}
                </Button>
                <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white/55">
                  Production-ready intake flow
                </div>
              </div>
            </>
          )}

          <div className="mt-5">
            <Progress value={Math.max(uploadProgress, active ? 84 : parsedResume ? 100 : 8)} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/58">
            <span>
              {active
                ? "Running parser, trust review, and interview preparation"
                : parsedResume
                  ? "Workspace is ready for focused review"
                  : "No candidate artifact loaded yet"}
            </span>
            {active ? (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/72">
                {uploadProgress}%
              </span>
            ) : null}
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function StatusTile({
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
