"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, Mic, MicOff, Send, Square, X } from "lucide-react";
import {
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import { useAnalysisActions } from "@/components/analysis-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getModeConfig } from "@/lib/mode-config";
import { cn } from "@/lib/utils";
import { getSentinelContext } from "@/lib/workspace";
import { useAppMode, useChatStore, useResumeStore, useUIStore } from "@/store/app-store";
import type { AssistantState } from "@/types/resume";

const SentinelOrb = dynamic(
  () => import("@/components/sentinel-orb").then((module) => module.SentinelOrb),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto flex h-[120px] w-[120px] items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.04]">
        <div className="h-16 w-16 animate-pulse rounded-full bg-neon/20 shadow-[0_0_40px_rgba(106,233,214,0.25)]" />
      </div>
    ),
  }
);

function sourceLabel(source?: string) {
  if (source === "live_ai") {
    return "Live AI";
  }
  if (source === "grounded") {
    return "Grounded AI";
  }
  return "System";
}

function getVoiceErrorMessage(error?: string, message?: string) {
  if (message?.trim()) {
    return message;
  }

  switch (error) {
    case "not-allowed":
      return "Microphone permission is blocked. Enable it in the browser and try again.";
    case "audio-capture":
      return "No microphone was detected for voice input.";
    case "network":
      return "Voice recognition lost connection. Please try again.";
    case "no-speech":
      return "No speech was detected. Try speaking a bit closer to the mic.";
    default:
      return "Voice input could not start right now.";
  }
}

export function SentinelChatPanel() {
  const pathname = usePathname();
  const { mode } = useAppMode();
  const modeConfig = getModeConfig(mode);
  const context = getSentinelContext(mode, pathname || "/");
  const open = useUIStore((state) => state.sentinelOpen);
  const closeSentinel = useUIStore((state) => state.closeSentinel);
  const messages = useChatStore((state) => state.messages);
  const isAssistantResponding = useChatStore((state) => state.isAssistantResponding);
  const analysis = useResumeStore((state) => state.analysis);
  const assistantState = useResumeStore((state) => state.assistantState);
  const parsedResume = useResumeStore((state) => state.parsedResume);
  const { sendPrompt, stopAssistant } = useAnalysisActions();

  const [draft, setDraft] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const voiceDraftRef = useRef("");

  const quickActions = context.actions.length ? context.actions : modeConfig.assistantQuickActions;
  const lastAssistantMessage = useMemo(
    () =>
      [...messages]
        .reverse()
        .find((message) => message.role === "assistant" && message.content.trim()),
    [messages]
  );
  const panelState: AssistantState = isListening ? "listening" : assistantState;
  const directive =
    analysis?.recommendation || "Upload a resume to unlock grounded assistant guidance.";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecognitionCtor) {
      setVoiceSupported(false);
      return;
    }

    setVoiceSupported(true);

    const recognition = new RecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError(null);
      setInterimTranscript("");
    };

    recognition.onresult = (event) => {
      const finalParts: string[] = [];
      const interimParts: string[] = [];

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript?.trim();
        if (!transcript) {
          continue;
        }

        if (result.isFinal) {
          finalParts.push(transcript);
        } else {
          interimParts.push(transcript);
        }
      }

      if (finalParts.length) {
        voiceDraftRef.current = [voiceDraftRef.current, finalParts.join(" ")]
          .filter(Boolean)
          .join(" ")
          .trim();
      }

      const nextDraft = [voiceDraftRef.current, interimParts.join(" ")]
        .filter(Boolean)
        .join(" ")
        .trim();

      setDraft(nextDraft);
      setInterimTranscript(interimParts.join(" ").trim());
    };

    recognition.onerror = (event) => {
      setVoiceError(getVoiceErrorMessage(event.error, event.message));
      setIsListening(false);
      setInterimTranscript("");
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [isMounted]);

  useEffect(() => {
    if (!open && recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClosePanel();
      }
    };

    window.addEventListener("keydown", handleEscape as unknown as EventListener);
    return () => {
      window.removeEventListener("keydown", handleEscape as unknown as EventListener);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    endRef.current?.scrollIntoView({
      behavior: isAssistantResponding ? "auto" : "smooth",
      block: "end",
    });
  }, [isAssistantResponding, messages, open]);

  if (!isMounted) {
    return null;
  }

  function handleClosePanel() {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }

    closeSentinel();
  }

  async function submitDraft() {
    const cleanedPrompt = draft.trim();
    if (!cleanedPrompt || isAssistantResponding) {
      return;
    }

    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }

    voiceDraftRef.current = "";
    setDraft("");
    setVoiceError(null);
    await sendPrompt(cleanedPrompt);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitDraft();
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitDraft();
    }
  }

  function handleVoiceToggle() {
    const recognition = recognitionRef.current;

    if (!recognition) {
      setVoiceError("Voice input is not available in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
      return;
    }

    try {
      voiceDraftRef.current = draft.trim();
      setVoiceError(null);
      recognition.start();
    } catch {
      setVoiceError("Voice input could not start. Please try again.");
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClosePanel}
            className="fixed inset-0 z-[70] bg-[#020712]/72 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="fixed inset-y-3 right-3 z-[80] flex w-[min(720px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.97),rgba(6,10,18,0.99))] shadow-[0_36px_100px_rgba(2,6,18,0.5)] backdrop-blur-2xl sm:inset-y-4 sm:right-4"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">Sentinel X</Badge>
                  <Badge variant="neutral">{context.label}</Badge>
                  <Badge variant="outline">{panelState}</Badge>
                  <Badge variant="outline">{sourceLabel(lastAssistantMessage?.source)}</Badge>
                </div>
                <p className="mt-3 text-sm text-white/58">
                  Scrollable context, live chat, voice input, and a breathing particle core.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClosePanel}
                className="surface-outline flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white/65 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-4 px-5 py-4">
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4"
                >
                  <div className="grid gap-4 lg:grid-cols-[148px_1fr]">
                    <div className="space-y-3">
                      <div className="rounded-[28px] border border-white/10 bg-black/25 p-3">
                        <SentinelOrb state={panelState} size={120} />
                      </div>
                      <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/44">
                          Voice Input
                        </p>
                        <p className="mt-2 text-sm text-white/84">
                          {voiceSupported
                            ? isListening
                              ? "Listening live"
                              : "Tap the mic to speak"
                            : "Browser voice input unavailable"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 min-w-0">
                      <div>
                        <h2 className="font-display text-[2rem] leading-tight text-white">
                          {context.title}
                        </h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/62">
                          {context.description}
                        </p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        <ContextCard
                          label="Active Profile"
                          value={parsedResume?.candidate_name || modeConfig.badge}
                        />
                        <ContextCard label="Current Directive" value={directive} clamp />
                        <ContextCard label="Context Focus" value={context.label} />
                      </div>

                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {quickActions.map((action) => (
                          <button
                            key={action}
                            type="button"
                            onClick={() => {
                              setDraft("");
                              voiceDraftRef.current = "";
                              setVoiceError(null);
                              void sendPrompt(action);
                            }}
                            disabled={isAssistantResponding}
                            className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/78 transition hover:border-neon/30 hover:bg-neon/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {action}
                          </button>
                        ))}
                      </div>

                      {voiceSupported ? (
                        <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/44">
                                Voice Status
                              </p>
                              <p className="mt-2 text-sm text-white/78">
                                {isListening
                                  ? "Listening now. Your speech is filling the composer live."
                                  : "Voice keeps the chat visible while you speak into the composer."}
                              </p>
                            </div>
                            <Badge variant={isListening ? "success" : "neutral"}>
                              {isListening ? "Listening" : "Ready"}
                            </Badge>
                          </div>
                          {interimTranscript ? (
                            <p className="mt-3 text-sm leading-6 text-neon/90">
                              Live transcript: {interimTranscript}
                            </p>
                          ) : null}
                        </div>
                      ) : null}

                      {voiceError ? (
                        <div className="rounded-[22px] border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
                          {voiceError}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.section>

                <div className="space-y-3">
                  {messages.length ? (
                    messages.map((message) => {
                      if (message.role === "system") {
                        return (
                          <div
                            key={message.id}
                            className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white/62"
                          >
                            {message.content}
                          </div>
                        );
                      }

                      const isAssistant = message.role === "assistant";
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                        >
                          <motion.div
                            layout
                            className={cn(
                              "max-w-[90%] rounded-[24px] border px-4 py-3 shadow-[0_18px_48px_rgba(1,6,14,0.16)]",
                              isAssistant
                                ? "border-neon/16 bg-neon/[0.08] text-white"
                                : "border-white/10 bg-white/[0.06] text-white/84"
                            )}
                          >
                            <div className="mb-1.5 flex items-center justify-between gap-3">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
                                {isAssistant ? "Sentinel X" : "Operator"}
                              </p>
                              {isAssistant ? (
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-white/55">
                                  {sourceLabel(message.source)}
                                </span>
                              ) : null}
                            </div>

                            <p className="whitespace-pre-wrap text-sm leading-7">
                              {message.content || (message.status === "streaming" ? "Thinking..." : "")}
                            </p>

                            {isAssistant && message.status === "streaming" ? (
                              <div className="mt-2 flex items-center gap-2 text-xs text-white/52">
                                <LoaderCircle size={12} className="animate-spin text-neon" />
                                Streaming live
                              </div>
                            ) : null}
                          </motion.div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-5 text-sm text-white/58">
                      No messages yet. Ask Sentinel X about risk signals, score logic, interview prompts, or next actions.
                    </div>
                  )}

                  <div ref={endRef} />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="border-t border-white/10 bg-[rgba(4,9,18,0.92)] px-5 py-4">
              <div className="rounded-[28px] border border-white/10 bg-black/25 p-3">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder={
                    mode === "HR"
                      ? "Ask about score, red flags, interview prompts, or hiring decisions..."
                      : "Ask about weak skills, learning priorities, interview prep, or your improvement roadmap..."
                  }
                  className="min-h-[88px] w-full resize-none bg-transparent px-3 py-2 text-sm leading-7 text-white outline-none placeholder:text-white/35"
                />

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="space-y-1 px-2">
                    <p className="text-xs text-white/48">
                      {voiceSupported
                        ? isListening
                          ? "Listening now. Press the mic again when you want to stop."
                          : "Type or speak. Voice fills the composer live and keeps the chat visible."
                        : "Type your question. Voice input depends on browser support."}
                    </p>
                    {interimTranscript ? (
                      <p className="text-xs text-neon/90">Live transcript: {interimTranscript}</p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 self-end">
                    <Button
                      type="button"
                      onClick={handleVoiceToggle}
                      disabled={!voiceSupported}
                      variant="secondary"
                      className={isListening ? "border-neon/20 bg-neon/10 text-neon" : ""}
                    >
                      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                      {isListening ? "Stop Voice" : "Speak"}
                    </Button>
                    <Button
                      type="button"
                      onClick={stopAssistant}
                      disabled={!isAssistantResponding}
                      variant="danger"
                    >
                      <Square size={14} />
                      Stop
                    </Button>
                    <Button
                      type="submit"
                      disabled={isAssistantResponding || !draft.trim()}
                      variant="primary"
                    >
                      {isAssistantResponding ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      {isAssistantResponding ? "Streaming" : "Send"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function ContextCard({
  label,
  value,
  clamp = false,
}: {
  label: string;
  value: string;
  clamp?: boolean;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/44">{label}</p>
      <p
        className={cn(
          "mt-2 text-sm leading-6 text-white/84",
          clamp && "max-h-[4.5rem] overflow-hidden"
        )}
      >
        {value}
      </p>
    </div>
  );
}
