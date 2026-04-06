"use client";

import Link from "next/link";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { ArrowRight, FileUp, LoaderCircle, ScanSearch } from "lucide-react";

import { useAnalysisActions } from "@/components/analysis-provider";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatScore } from "@/lib/utils";
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
    const file = event.dataTransfer.files?.[0];
    void beginUpload(file);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    void beginUpload(file);
    event.target.value = "";
  }

  return (
    <Card variant="default" className="h-full p-6">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleChange}
        className="hidden"
      />

      <CardHeader>
        <Badge variant="outline">Resume Intake</Badge>
        <CardTitle>{parsedResume ? "Candidate dossier is live" : "Start with a resume upload"}</CardTitle>
        <CardDescription>
          {parsedResume
            ? "Refresh the source file any time. Parsing, trust scoring, premium resume generation, and question generation continue in the background."
            : "Upload a PDF or DOCX file to unlock the dashboard, resume analysis, the free premium resume generator, insights, and the interview engine."}
        </CardDescription>
      </CardHeader>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`mt-6 rounded-[28px] border border-dashed p-5 transition ${
          dragging ? "border-neon/40 bg-neon/[0.08]" : "border-white/10 bg-black/20"
        }`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.04] text-neon">
          {active ? (
            <LoaderCircle size={24} className="animate-spin text-pulse" />
          ) : (
            <FileUp size={24} />
          )}
        </div>

        {parsedResume ? (
          <>
            <div className="mt-5 space-y-2">
              <p className="font-display text-2xl text-white">{parsedResume.candidate_name}</p>
              <p className="text-sm text-white/58">
                {lastFileName || "Resume artifact loaded"}
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <StatusTile
                label="Trust Score"
                value={analysis ? formatScore(analysis.score) : "Pending"}
                detail={analysis?.risk_level || "Awaiting analysis"}
              />
              <StatusTile
                label="Active Artifact"
                value={lastFileName || "Current resume"}
                detail={active ? "Refreshing in background" : "Ready for review"}
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
            <h3 className="mt-5 font-display text-2xl text-white">
              {active ? "Processing candidate resume..." : "Drop a resume here or browse files"}
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/62">
              {active
                ? "Parsing, scoring, and question generation run asynchronously so the workspace stays responsive."
                : "Clean SaaS flow: upload once, then review overview, resume analysis, insights, and interview execution in separate screens."}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={() => inputRef.current?.click()} variant="primary">
                {active ? <ScanSearch size={16} /> : <FileUp size={16} />}
                {isUploading ? "Uploading" : isAnalyzing ? "Analyzing" : "Select Resume"}
              </Button>
              <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white/55">
                PDF and DOCX supported
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
      <p className="mt-2 text-sm text-white/58">{detail}</p>
    </div>
  );
}
