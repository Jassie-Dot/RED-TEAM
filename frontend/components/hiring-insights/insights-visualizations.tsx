"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import { buildClaimVsActualChartData } from "@/lib/capability-insights";
import type { AssessmentEvaluationResponse, ResumeAnalysis } from "@/types/resume";

export function InsightsVisualizations({
  analysis,
  assessment,
}: {
  analysis: ResumeAnalysis;
  assessment: AssessmentEvaluationResponse | null;
}) {
  const comparisonData = buildClaimVsActualChartData(analysis, assessment).slice(0, 6);

  const radarData = [
    { subject: "Credibility", value: analysis.profile_strength.credibility },
    { subject: "Tech Depth", value: analysis.profile_strength.technical_depth },
    { subject: "Consistency", value: analysis.profile_strength.career_consistency },
    { subject: "Communication", value: analysis.profile_strength.communication_clarity },
    { subject: "Education", value: analysis.profile_strength.education_alignment },
  ];

  return (
    <Card variant="default" className="p-6">
      <div className="flex items-center gap-2">
        <p className="section-kicker">Visual Insights</p>
      </div>
      <h2 className="mt-3 font-display text-2xl text-white">
        Skill distribution and capability balance
      </h2>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-medium text-white">Claimed vs actual level</p>
          <p className="mt-1 text-sm text-white/56">
            Claimed level comes from the resume. Actual level comes from the scored test when available.
          </p>
          <ChartSurface>
            {({ width, height }) => (
              <BarChart width={width} height={height} data={comparisonData}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="skill" stroke="#93a6c3" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="#93a6c3" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  formatter={(value, name) => [`${value ?? 0}/100`, String(name)]}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(8,12,21,0.96)",
                    color: "#f8fbff",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="claimedScore" name="Claimed level" fill="rgba(255,190,108,0.95)" radius={[12, 12, 6, 6]} />
                <Bar dataKey="actualScore" name="Actual level" fill="rgba(106,233,214,0.95)" radius={[12, 12, 6, 6]} />
              </BarChart>
            )}
          </ChartSurface>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-medium text-white">Capability radar</p>
          <p className="mt-1 text-sm text-white/56">
            Distribution across core recruiting dimensions
          </p>
          <ChartSurface>
            {({ width, height }) => (
              <RadarChart width={width} height={height} data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#d9e5f5", fontSize: 11 }} />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: "#8ea4c2", fontSize: 10 }}
                  tickCount={5}
                />
                <Radar
                  dataKey="value"
                  stroke="rgba(255,190,108,1)"
                  fill="rgba(255,190,108,0.24)"
                  fillOpacity={1}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(8,12,21,0.96)",
                    color: "#f8fbff",
                  }}
                />
              </RadarChart>
            )}
          </ChartSurface>
        </div>
      </div>
    </Card>
  );
}

function ChartSurface({
  children,
}: {
  children: (size: { width: number; height: number }) => ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const nextWidth = Math.round(entry.contentRect.width);
      const nextHeight = Math.round(entry.contentRect.height);

      if (nextWidth > 0 && nextHeight > 0) {
        setSize({ width: nextWidth, height: nextHeight });
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="mt-5 h-[280px] min-w-0">
      {size.width > 0 && size.height > 0 ? children(size) : null}
    </div>
  );
}
