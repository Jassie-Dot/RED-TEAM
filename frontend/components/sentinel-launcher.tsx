"use client";

import { MessageSquareText, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import { getSentinelContext } from "@/lib/workspace";
import { useAppMode, useChatStore, useUIStore } from "@/store/app-store";

export function SentinelLauncher() {
  const pathname = usePathname();
  const { mode } = useAppMode();
  const openSentinel = useUIStore((state) => state.openSentinel);
  const isAssistantResponding = useChatStore((state) => state.isAssistantResponding);
  const context = getSentinelContext(mode, pathname || "/");

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 sm:bottom-5 sm:right-5">
      <button
        type="button"
        onClick={openSentinel}
        className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/10 bg-[rgba(10,14,24,0.92)] px-3 py-2.5 pr-4 shadow-[0_22px_60px_rgba(3,7,18,0.34)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/14"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-neon/20 bg-neon/10 text-neon">
          {isAssistantResponding ? (
            <Sparkles size={18} className="animate-pulse" />
          ) : (
            <MessageSquareText size={18} />
          )}
        </div>
        <div className="hidden text-left sm:block">
          <p className="section-kicker">Sentinel X</p>
          <p className="mt-1 text-sm font-medium text-white">
            {isAssistantResponding ? "Streaming response..." : "Open assistant"}
          </p>
          <p className="mt-1 max-w-[220px] truncate text-xs text-white/48">{context.label}</p>
        </div>
      </button>
    </div>
  );
}
