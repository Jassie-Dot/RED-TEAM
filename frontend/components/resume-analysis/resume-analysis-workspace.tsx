"use client";

import { AlertTriangle, BriefcaseBusiness, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";

import { ResumeIntakeCard } from "@/components/shared/resume-intake-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FreeResumeStudio } from "@/components/resume-analysis/free-resume-studio";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/workspace/page-header";
import { buildAtsInsights, buildEvidenceChecks } from "@/lib/derived-insights";
import { getStatusVariant } from "@/lib/utils";
import { useAppMode, useResumeStore } from "@/store/app-store";
import type { TimelineAnalysis } from "@/types/resume";

export function ResumeAnalysisWorkspace() {
  const { mode } = useAppMode();
  const parsedResume = useResumeStore((state) => state.parsedResume);
  const analysis = useResumeStore((state) => state.analysis);
  const isAnalyzing = useResumeStore((state) => state.isAnalyzing);
  const evidenceChecks = buildEvidenceChecks(analysis);
  const atsInsights = buildAtsInsights(parsedResume, analysis);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Resume Studio"
        title={
          mode === "HR"
            ? "Structured resume review plus a premium-feeling free resume generator."
            : "Structured claim-to-proof review with ATS guidance and a premium free rewrite."
        }
        description={
          mode === "HR"
            ? "This screen combines resume analysis with a free premium-style generator: parsed data, claimed versus verified skills, evidence validation, timeline analysis, ATS optimization, and a polished rewrite."
            : "This screen combines claim-to-proof analysis with a premium free rewrite: parsed data, evidence validation, timeline integrity, ATS guidance, and a sharper resume output."
        }
      />

      <FreeResumeStudio />

      {!parsedResume ? (
        <ResumeIntakeCard />
      ) : isAnalyzing && !analysis ? (
        <AnalysisSkeleton />
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card variant="default" className="p-6">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Parsed Resume Data</Badge>
                {analysis ? (
                  <Badge variant={getStatusVariant(analysis.risk_level)}>{analysis.risk_level}</Badge>
                ) : null}
              </div>

              <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                <p className="font-display text-3xl text-white">{parsedResume.candidate_name}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-white/58">
                  {parsedResume.email ? <span>{parsedResume.email}</span> : null}
                  {parsedResume.phone ? <span>{parsedResume.phone}</span> : null}
                </div>
                {parsedResume.summary ? (
                  <p className="mt-4 text-sm leading-7 text-white/82">{parsedResume.summary}</p>
                ) : null}
              </div>

              <div className="mt-5 rounded-[28px] border border-white/10 bg-black/20 p-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-neon" />
                  <p className="section-kicker">Skills</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {parsedResume.skills.length ? (
                    parsedResume.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-neon/20 bg-neon/10 px-3 py-1.5 text-xs font-medium text-neon"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-white/58">No structured skills were detected.</p>
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness size={16} className="text-pulse" />
                    <p className="section-kicker">Experience</p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {parsedResume.experience.length ? (
                      parsedResume.experience.map((item, index) => (
                        <div
                          key={`${item.role}-${index}`}
                          className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4"
                        >
                          <p className="font-display text-lg text-white">{item.role}</p>
                          <p className="mt-1 text-sm text-white/58">
                            {item.organization || "Organization not specified"}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/42">
                            {item.start_date || "Unknown"} to {item.end_date || "Unknown"}
                          </p>
                          <div className="mt-3 space-y-2 text-sm leading-7 text-white/78">
                            {item.highlights.length ? (
                              item.highlights.map((point) => <p key={point}>{point}</p>)
                            ) : (
                              <p>No role highlights were parsed.</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-white/58">No structured experience entries detected.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-neon" />
                    <p className="section-kicker">Education and Credentials</p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {parsedResume.education.length ? (
                      parsedResume.education.map((item, index) => (
                        <div
                          key={`${item.degree}-${index}`}
                          className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4"
                        >
                          <p className="font-display text-lg text-white">{item.degree}</p>
                          <p className="mt-1 text-sm text-white/58">
                            {item.institution || "Institution not specified"}
                          </p>
                          {item.graduation_date ? (
                            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/42">
                              {item.graduation_date}
                            </p>
                          ) : null}
                          {item.details.length ? (
                            <p className="mt-3 text-sm leading-7 text-white/78">
                              {item.details.join(" ")}
                            </p>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-white/58">No education data was parsed.</p>
                    )}

                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                      <p className="font-display text-lg text-white">Certifications</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {parsedResume.certifications.length ? (
                          parsedResume.certifications.map((certification) => (
                            <span
                              key={certification}
                              className="rounded-full border border-pulse/20 bg-pulse/10 px-3 py-1.5 text-xs font-medium text-pulse"
                            >
                              {certification}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-white/58">No certifications were detected.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <Card variant="default" className="p-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-neon" />
                  <p className="section-kicker">Evidence Validation</p>
                </div>
                <h2 className="mt-3 font-display text-2xl text-white">
                  What looks validated versus what needs follow-up
                </h2>
                <div className="mt-5 space-y-3">
                  {evidenceChecks.length ? (
                    evidenceChecks.map((item) => (
                      <div
                        key={`${item.title}-${item.detail}`}
                        className={`rounded-[24px] border p-4 ${
                          item.tone === "validated"
                            ? "border-neon/20 bg-neon/10"
                            : item.tone === "watch"
                              ? "border-pulse/20 bg-pulse/10"
                              : "border-danger/20 bg-danger/10"
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={
                              item.tone === "validated"
                                ? "success"
                                : item.tone === "watch"
                                  ? "warning"
                                  : "danger"
                            }
                          >
                            {item.title}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-white/84">{item.detail}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-white/58">
                      Run analysis to populate validation signals and review flags.
                    </p>
                  )}
                </div>
              </Card>

              <Card variant="default" className="p-6">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-pulse" />
                  <p className="section-kicker">ATS Optimization Insights</p>
                </div>
                <h2 className="mt-3 font-display text-2xl text-white">
                  Resume improvements that raise scan quality
                </h2>
                <div className="mt-5 space-y-3">
                  {atsInsights.map((insight) => (
                    <div
                      key={insight.title}
                      className={`rounded-[24px] border p-4 ${
                        insight.tone === "positive"
                          ? "border-neon/20 bg-neon/10"
                          : "border-pulse/20 bg-pulse/10"
                      }`}
                    >
                      <p className="font-medium text-white">{insight.title}</p>
                      <p className="mt-2 text-sm leading-7 text-white/78">{insight.detail}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <Card variant="default" className="p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-neon" />
              <p className="section-kicker">Skills vs Claimed Comparison</p>
            </div>
            <h2 className="mt-3 font-display text-2xl text-white">
              Compare claimed proficiency with verified evidence
            </h2>

            {analysis?.skill_matrix.length ? (
              <div className="mt-5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill</TableHead>
                      <TableHead>Claimed</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Evidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysis.skill_matrix.map((item) => (
                      <TableRow key={item.skill}>
                        <TableCell className="font-medium text-white">{item.skill}</TableCell>
                        <TableCell>{item.claimed_level}</TableCell>
                        <TableCell>{item.verified_level}</TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3 text-sm text-white/66">
                              <span>{item.confidence}%</span>
                              <span>
                                {item.confidence >= 75
                                  ? "Strong"
                                  : item.confidence >= 50
                                    ? "Watch"
                                    : "Weak"}
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-white/[0.06]">
                              <div
                                className={`h-2 rounded-full ${
                                  item.confidence >= 75
                                    ? "bg-[linear-gradient(90deg,rgba(106,233,214,1),rgba(125,211,252,1))]"
                                    : item.confidence >= 50
                                      ? "bg-[linear-gradient(90deg,rgba(255,190,108,1),rgba(106,233,214,1))]"
                                      : "bg-[linear-gradient(90deg,rgba(255,124,150,1),rgba(255,190,108,1))]"
                                }`}
                                style={{ width: `${item.confidence}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.evidence}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="mt-5 text-sm text-white/58">
                Analyze the resume to populate the claimed-versus-verified comparison table.
              </p>
            )}
          </Card>

          <TimelinePanel timeline={analysis?.timeline || null} />
        </>
      )}
    </div>
  );
}

function TimelinePanel({ timeline }: { timeline: TimelineAnalysis | null }) {
  return (
    <Card variant="default" className="p-6">
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className="text-pulse" />
        <p className="section-kicker">Timeline Analysis</p>
      </div>
      <h2 className="mt-3 font-display text-2xl text-white">Career chronology and integrity review</h2>

      {!timeline?.events.length ? (
        <p className="mt-5 text-sm text-white/58">
          Timeline events will appear here after analysis finishes.
        </p>
      ) : (
        <>
          <div className="mt-5 space-y-3">
            {timeline.events.map((event, index) => (
              <div
                key={`${event.role}-${index}`}
                className="rounded-[28px] border border-white/10 bg-black/20 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-3">
                    <div className={`mt-1 h-3 w-3 rounded-full ${timelineMarkerClass(event.marker)}`} />
                    <div>
                      <p className="font-display text-lg text-white">{event.role}</p>
                      <p className="mt-1 text-sm text-white/58">
                        {event.organization || "Organization not specified"}
                      </p>
                      {event.note ? (
                        <p className="mt-3 text-sm leading-7 text-white/78">{event.note}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/68">
                    <p>
                      {event.start_date || "Unknown"} to {event.end_date || "Unknown"}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/42">
                      {event.duration_months} months
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <InsightColumn title="Gaps" items={timeline.gaps} tone="warning" />
            <InsightColumn title="Overlaps" items={timeline.overlaps} tone="danger" />
            <InsightColumn title="Growth Alerts" items={timeline.growth_alerts} tone="danger" />
          </div>
        </>
      )}
    </Card>
  );
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card variant="default" className="p-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-5 h-14 w-72" />
          <Skeleton className="mt-3 h-24 w-full" />
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </Card>
        <div className="space-y-6">
          <Card variant="default" className="p-6">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="mt-5 h-36 w-full" />
            <Skeleton className="mt-3 h-24 w-full" />
          </Card>
          <Card variant="default" className="p-6">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-5 h-24 w-full" />
            <Skeleton className="mt-3 h-24 w-full" />
          </Card>
        </div>
      </div>
      <Card variant="default" className="p-6">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="mt-5 h-64 w-full" />
      </Card>
    </div>
  );
}

function InsightColumn({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "warning" | "danger";
}) {
  return (
    <div
      className={`rounded-[24px] border p-4 ${
        tone === "danger" ? "border-danger/20 bg-danger/10" : "border-pulse/20 bg-pulse/10"
      }`}
    >
      <p className="section-kicker">{title}</p>
      <div className="mt-3 space-y-2 text-sm leading-7 text-white/78">
        {items.length ? items.map((item) => <p key={item}>{item}</p>) : <p>No issues detected.</p>}
      </div>
    </div>
  );
}

function timelineMarkerClass(marker: TimelineAnalysis["events"][number]["marker"]) {
  switch (marker) {
    case "gap":
      return "bg-pulse";
    case "overlap":
    case "growth_alert":
      return "bg-danger";
    default:
      return "bg-neon";
  }
}
