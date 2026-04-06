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
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <div className="pointer-events-none absolute inset-0 translate-y-1 rounded-full bg-neon/20 blur-2xl animate-pulse-slow" />

      <button
        type="button"
        onClick={openSentinel}
        className="pointer-events-auto group relative flex h-16 w-16 items-center justify-center rounded-full border border-neon/20 bg-[linear-gradient(180deg,rgba(10,18,38,0.96),rgba(6,10,24,0.98))] shadow-[0_0_0_1px_rgba(var(--neon-rgb),0.08),0_24px_64px_rgba(var(--neon-rgb),0.18)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(var(--neon-rgb),0.12),0_30px_72px_rgba(var(--neon-rgb),0.24)]"
      >
        <div className="absolute inset-1 rounded-full border border-white/10" />
        <div className="absolute inset-[-6px] rounded-full border border-neon/10 opacity-70 transition duration-300 group-hover:scale-105 group-hover:opacity-100" />
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-neon/20 bg-neon/10 text-neon">
          {isAssistantResponding ? (
            <Sparkles size={18} className="animate-pulse" />
          ) : (
            <MessageSquareText size={18} />
          )}
        </div>
      </button>

      <div className="pointer-events-none absolute right-[4.65rem] top-1/2 hidden -translate-y-1/2 sm:block">
        <div className="surface-outline min-w-[176px] rounded-full px-4 py-3 shadow-[0_18px_44px_rgba(3,8,24,0.28)]">
          <p className="section-kicker">SentinelX</p>
          <p className="mt-1 text-sm font-medium text-white">
            {isAssistantResponding ? "Streaming response..." : "Open assistant"}
          </p>
          <p className="mt-1 max-w-[220px] truncate text-xs text-white/48">{context.label}</p>
        </div>
      </div>
    </div>
  );
}
