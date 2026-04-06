"use client";

import { GraduationCap, ShieldCheck } from "lucide-react";
import { memo } from "react";

import { Badge } from "@/components/ui/badge";
import { getModeConfig } from "@/lib/mode-config";
import { cn } from "@/lib/utils";
import { useAppMode } from "@/store/app-store";
import type { AppMode } from "@/types/app";

function ToggleButton({
  mode,
  activeMode,
  onSelect,
}: {
  mode: AppMode;
  activeMode: AppMode;
  onSelect: (mode: AppMode) => void;
}) {
  const active = mode === activeMode;
  const config = getModeConfig(mode);
  const Icon = mode === "HR" ? ShieldCheck : GraduationCap;

  return (
    <button
      type="button"
      onClick={() => onSelect(mode)}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-full px-3 py-2 text-left text-sm transition",
        active ? "bg-white/[0.08] text-white" : "text-white/55 hover:bg-white/[0.05] hover:text-white"
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border",
          active ? "border-neon/25 bg-neon/12 text-neon" : "border-white/10 bg-white/[0.04]"
        )}
      >
        <Icon size={15} />
      </span>
      <span className="min-w-0 leading-none">
        <span className="block font-medium">{config.label}</span>
        <span className="mt-1 block text-[11px] text-white/40">{config.badge}</span>
      </span>
    </button>
  );
}

export const ModeToggle = memo(function ModeToggle() {
  const { mode, setMode } = useAppMode();

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1">
      <Badge variant="outline" className="hidden md:inline-flex">
        Mode
      </Badge>
      <ToggleButton mode="HR" activeMode={mode} onSelect={setMode} />
      <ToggleButton mode="STUDENT" activeMode={mode} onSelect={setMode} />
    </div>
  );
});
