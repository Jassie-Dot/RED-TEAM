"use client";

import { memo } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Radar } from "react-chartjs-2";

import type { ResumeAnalysis } from "@/types/resume";
import { useAppMode } from "@/store/app-store";

ChartJS.register(BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, RadialLinearScale, Tooltip);

const commonOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#E9F6FF",
        font: { size: 11 },
      },
    },
  },
};

export const ChartsPanel = memo(function ChartsPanel({ analysis }: { analysis: ResumeAnalysis | null }) {
  const { mode } = useAppMode();
  if (!analysis) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        {[0, 1].map((item) => (
          <div key={item} className="glass-panel rounded-[30px] p-5">
            <div className="mb-4">
              <div className="h-3 w-20 rounded-full bg-white/10" />
              <div className="mt-3 h-6 w-52 rounded-full bg-white/10" />
            </div>
            <div className="flex h-[280px] items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.03] text-sm text-white/30">
              Analyze a resume to populate visual reporting.
            </div>
          </div>
        ))}
      </div>
    );
  }

  const barData = {
    labels: analysis.skill_matrix.map((entry) => entry.skill),
    datasets: [
      {
        label: "Skill confidence",
        data: analysis.skill_matrix.map((entry) => entry.confidence),
        borderRadius: 10,
        backgroundColor: ["#5EEAD4", "#7DD3FC", "#5EEAD4", "#7DD3FC", "#5EEAD4", "#7DD3FC"],
      },
    ],
  };

  const radarData = {
    labels: ["Credibility", "Technical Depth", "Career Consistency", "Communication", "Education"],
    datasets: [
      {
        label: "Profile signature",
        data: [
          analysis.profile_strength.credibility,
          analysis.profile_strength.technical_depth,
          analysis.profile_strength.career_consistency,
          analysis.profile_strength.communication_clarity,
          analysis.profile_strength.education_alignment,
        ],
        fill: true,
        borderColor: "#7DD3FC",
        backgroundColor: "rgba(125, 211, 252, 0.18)",
        pointBackgroundColor: "#5EEAD4",
        pointBorderColor: "#FFFFFF",
      },
    ],
  };

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="glass-panel neon-border rounded-[30px] p-5">
        <div className="mb-4">
          <p className="section-kicker text-neon/80">{mode === "HR" ? "Skill Matrix" : "Skill Reality Matrix"}</p>
          <h3 className="mt-2 font-display text-2xl text-white">
            {mode === "HR" ? "Evidence confidence by claimed skill" : "How strong the resume evidence is for each claimed skill"}
          </h3>
        </div>
        <div className="h-[280px]">
          <Bar
            data={barData}
            options={{
              ...commonOptions,
              scales: {
                x: {
                  ticks: { color: "#9FB1D0", font: { size: 10 } },
                  grid: { color: "rgba(255,255,255,0.06)" },
                },
                y: {
                  ticks: { color: "#9FB1D0", font: { size: 10 } },
                  grid: { color: "rgba(255,255,255,0.06)" },
                  suggestedMax: 100,
                },
              },
            }}
          />
        </div>
      </div>

      <div className="glass-panel neon-border rounded-[30px] p-5">
        <div className="mb-4">
          <p className="section-kicker text-pulse/85">{mode === "HR" ? "Strength Signature" : "Readiness Signature"}</p>
          <h3 className="mt-2 font-display text-2xl text-white">{mode === "HR" ? "Candidate profile balance" : "Candidate growth profile"}</h3>
        </div>
        <div className="h-[280px]">
          <Radar
            data={radarData}
            options={{
              ...commonOptions,
              scales: {
                r: {
                  angleLines: { color: "rgba(255,255,255,0.08)" },
                  grid: { color: "rgba(255,255,255,0.08)" },
                  pointLabels: { color: "#E6F6FF", font: { size: 10 } },
                  ticks: {
                    color: "#9FB1D0",
                    backdropColor: "transparent",
                    font: { size: 9 },
                  },
                  suggestedMin: 0,
                  suggestedMax: 100,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
});
