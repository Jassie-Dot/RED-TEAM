"use client";

import { useEffect, useMemo, useRef } from "react";

import {
  analyzeResume,
  evaluateAnswers as evaluateAnswersApi,
  generateFreeResume,
  generateQuestions,
  getApiErrorMessage,
  getScore,
  streamAssistantChat,
  uploadResume,
} from "@/lib/api";
import { createBriefing } from "@/lib/assistant";
import { getModeConfig } from "@/lib/mode-config";
import {
  type AnalysisPreferences,
  type AssistantMessage,
  useAppMode,
  useChatStore,
  useResumeStore,
  useUIStore,
} from "@/store/app-store";
import type {
  AssessmentAnswerInput,
  AssessmentEvaluationResponse,
  AssistantResponseSource,
  AssistantState,
  GeneratedResumeArtifact,
  ParsedResume,
  QuestionResponse,
  ResumeTemplate,
  ResumeAnalysis,
} from "@/types/resume";

interface AnalysisStateSnapshot {
  parsedResume: ParsedResume | null;
  analysis: ResumeAnalysis | null;
  generatedResume: GeneratedResumeArtifact | null;
  questions: QuestionResponse | null;
  assessment: AssessmentEvaluationResponse | null;
  journeyStage: "upload" | "baseline" | "test" | "verdict";
  uploadProgress: number;
  isUploading: boolean;
  isAnalyzing: boolean;
  isGeneratingResume: boolean;
  isEvaluatingAnswers: boolean;
  error: string | null;
  assistantState: AssistantState;
  isAssistantResponding: boolean;
  messages: AssistantMessage[];
  preferences: AnalysisPreferences;
  lastFileName: string | null;
  briefing: string;
  handleResumeUpload: (file: File) => Promise<void>;
  generateResume: (options?: { template?: ResumeTemplate; targetRole?: string }) => Promise<void>;
  refreshScore: () => Promise<void>;
  loadQuestions: (count?: number) => Promise<void>;
  evaluateAnswers: (answers: AssessmentAnswerInput[]) => Promise<void>;
  sendPrompt: (prompt: string) => Promise<void>;
  stopAssistant: () => void;
  updatePreferences: (patch: Partial<AnalysisPreferences>) => void;
  clearSession: () => void;
}

let streamAbortController: AbortController | null = null;

function buildMessageId(role: AssistantMessage["role"]) {
  return `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createMessage(
  role: AssistantMessage["role"],
  content: string,
  source?: AssistantMessage["source"],
  status: AssistantMessage["status"] = "done"
): AssistantMessage {
  return {
    id: buildMessageId(role),
    role,
    content,
    source,
    status,
  };
}

async function handleResumeUpload(file: File, mode: ReturnType<typeof useAppMode>["mode"]) {
  const resumeStore = useResumeStore.getState();
  const chatStore = useChatStore.getState();

  resumeStore.setError(null);
  resumeStore.setAssessment(null);
  resumeStore.setGeneratedResume(null);
  resumeStore.setLastFileName(file.name);
  resumeStore.setUploadProgress(0);
  resumeStore.setIsUploading(true);
  resumeStore.setIsAnalyzing(true);
  resumeStore.setAssistantState("analyzing");
  chatStore.clearMessages();
  chatStore.appendMessages(
    createMessage(
      "system",
      `${mode === "HR" ? "Recruiter dossier" : "Candidate evaluation artifact"} ingest started for ${file.name}. Running parser, scoring, and evidence mapping.`,
      "system"
    )
  );

  try {
    const upload = await uploadResume(file, resumeStore.setUploadProgress);
    resumeStore.setParsedResume(upload.parsed_resume);

    const nextAnalysis = await analyzeResume(upload.resume_id);
    resumeStore.setAnalysis(nextAnalysis);
    resumeStore.setAssistantState(nextAnalysis.assistant_state);

    chatStore.appendMessages(
      createMessage(
        "system",
        mode === "HR"
          ? `${upload.parsed_resume.candidate_name} analyzed. Trust score ${nextAnalysis.score}/100, ${nextAnalysis.risk_level} risk.`
          : `${upload.parsed_resume.candidate_name}'s evaluation baseline is ready. Credibility score ${nextAnalysis.score}/100 with ${nextAnalysis.risk_level.toLowerCase()} verification risk.`,
        "system"
      )
    );

    if (resumeStore.preferences.autoGenerateQuestions) {
      const generated = await generateQuestions(upload.resume_id, 5, mode);
      resumeStore.setQuestions(generated);
      chatStore.appendMessages(
        createMessage(
          "system",
          mode === "HR"
            ? `Interview Engine primed with ${generated.questions.length} recruiter validation prompts.`
            : `Adaptive Test Engine primed with ${generated.questions.length} candidate skill checks.`,
          "system"
        )
      );
    } else {
      resumeStore.setQuestions(null);
    }
  } catch (caught) {
    const message = getApiErrorMessage(caught, "Resume processing failed.");
    resumeStore.setError(message);
    resumeStore.setAssistantState("alert");
    chatStore.appendMessages(createMessage("system", `Alert: ${message}`, "system"));
  } finally {
    resumeStore.setIsUploading(false);
    resumeStore.setIsAnalyzing(false);
  }
}

async function generateResumeArtifact(options?: { template?: ResumeTemplate; targetRole?: string }) {
  const resumeStore = useResumeStore.getState();
  const resumeId = resumeStore.analysis?.resume_id || resumeStore.parsedResume?.resume_id;
  if (!resumeId) {
    return;
  }

  resumeStore.setError(null);
  resumeStore.setIsGeneratingResume(true);

  try {
    const artifact = await generateFreeResume({
      resume_id: resumeId,
      template: options?.template,
      target_role: options?.targetRole?.trim() || null,
    });
    resumeStore.setGeneratedResume(artifact);
  } catch (caught) {
    resumeStore.setError(getApiErrorMessage(caught, "Unable to generate the upgraded resume."));
  } finally {
    resumeStore.setIsGeneratingResume(false);
  }
}

async function refreshScore() {
  const resumeStore = useResumeStore.getState();
  const analysis = resumeStore.analysis;
  if (!analysis?.resume_id) {
    return;
  }

  try {
    const latest = await getScore(analysis.resume_id);
    resumeStore.setAnalysis(
      analysis
        ? {
            ...analysis,
            score: latest.score,
            risk_level: latest.risk_level,
            reasons: latest.reasons,
          }
        : null
    );
  } catch (caught) {
    resumeStore.setError(getApiErrorMessage(caught, "Unable to refresh score."));
  }
}

async function loadQuestions(mode: ReturnType<typeof useAppMode>["mode"], count = 5) {
  const resumeStore = useResumeStore.getState();
  const chatStore = useChatStore.getState();
  const resumeId = resumeStore.analysis?.resume_id || resumeStore.parsedResume?.resume_id;
  if (!resumeId) {
    return;
  }

  resumeStore.setError(null);
  resumeStore.setAssistantState("speaking");

  try {
    const generated = await generateQuestions(resumeId, count, mode);
    resumeStore.setQuestions(generated);
    resumeStore.setAssessment(null);
    chatStore.appendMessages(
      createMessage(
        "system",
        mode === "HR"
          ? "Interview Engine regenerated technical and credibility prompts."
          : "Adaptive Test Engine regenerated the next candidate skill assessment set.",
        "system"
      )
    );
  } catch (caught) {
    resumeStore.setError(getApiErrorMessage(caught, "Unable to generate questions."));
    resumeStore.setAssistantState("alert");
  } finally {
    resumeStore.setAssistantState(resumeStore.analysis?.assistant_state || "idle");
  }
}

async function evaluateAnswers(mode: ReturnType<typeof useAppMode>["mode"], answers: AssessmentAnswerInput[]) {
  const resumeStore = useResumeStore.getState();
  const chatStore = useChatStore.getState();
  const resumeId = resumeStore.analysis?.resume_id || resumeStore.parsedResume?.resume_id;
  const questions = resumeStore.questions?.questions || [];

  if (!resumeId || !questions.length) {
    return;
  }

  resumeStore.setError(null);
  resumeStore.setIsEvaluatingAnswers(true);
  resumeStore.setAssistantState("analyzing");

  try {
    const result = await evaluateAnswersApi({
      resumeId,
      mode,
      answers,
      questions,
    });

    resumeStore.setAssessment(result);
    chatStore.appendMessages(
      createMessage(
        "system",
        mode === "HR"
          ? `Answer evaluation complete. Interview confidence score ${result.overall_score}% with ${result.risks.length} areas needing deeper verification.`
          : `Assessment complete. Learning readiness score ${result.overall_score}% and performance band ${result.performance_band}.`,
        "system"
      )
    );
    resumeStore.setAssistantState(resumeStore.analysis?.assistant_state || "idle");
  } catch (caught) {
    const message = getApiErrorMessage(caught, "Unable to evaluate answers.");
    resumeStore.setError(message);
    resumeStore.setAssistantState("alert");
    chatStore.appendMessages(createMessage("system", `Alert: ${message}`, "system"));
  } finally {
    resumeStore.setIsEvaluatingAnswers(false);
  }
}

async function sendPrompt(mode: ReturnType<typeof useAppMode>["mode"], prompt: string) {
  const cleanedPrompt = prompt.trim();
  if (!cleanedPrompt) {
    return;
  }

  const resumeStore = useResumeStore.getState();
  const chatStore = useChatStore.getState();
  if (chatStore.isAssistantResponding) {
    return;
  }

  resumeStore.setError(null);
  resumeStore.setAssistantState("speaking");
  chatStore.setIsAssistantResponding(true);

  const userMessage = createMessage("user", cleanedPrompt);
  const assistantMessage: AssistantMessage = {
    id: buildMessageId("assistant"),
    role: "assistant",
    content: "",
    source: "grounded",
    status: "streaming",
  };

  const history = chatStore.messages
    .filter((message) => (message.role === "assistant" || message.role === "user") && message.status !== "streaming")
    .slice(-8)
    .map((message): { role: "assistant" | "user"; content: string } => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content,
    }));

  chatStore.appendMessages(userMessage, assistantMessage);

  let streamedAnswer = "";
  let latestState: AssistantState = resumeStore.analysis?.assistant_state || "idle";
  let latestSource: AssistantResponseSource = "grounded";
  const controller = new AbortController();
  streamAbortController = controller;

  try {
    const finalResponse = await streamAssistantChat(
      {
        prompt: cleanedPrompt,
        mode,
        resume_id: resumeStore.analysis?.resume_id || resumeStore.parsedResume?.resume_id || null,
        question_count: resumeStore.questions?.questions.length || 0,
        question_topics: resumeStore.questions?.questions.map((item) => item.category).slice(0, 5) || [],
        parsed_resume: resumeStore.parsedResume,
        analysis: resumeStore.analysis,
        history,
      },
      {
        onMeta: (meta) => {
          latestState = meta.assistant_state;
          latestSource = meta.source;
          useChatStore.getState().updateMessage(assistantMessage.id, (message) => ({
            ...message,
            source: meta.source,
          }));
        },
        onChunk: (chunk) => {
          streamedAnswer += chunk;
          useChatStore.getState().updateMessage(assistantMessage.id, (message) => ({
            ...message,
            content: streamedAnswer,
            source: latestSource,
          }));
        },
        onComplete: (response) => {
          latestState = response.assistant_state;
          latestSource = response.source;
          if (response.answer.trim()) {
            streamedAnswer = response.answer;
          }
        },
      },
      {
        signal: controller.signal,
      }
    );

    latestState = finalResponse.assistant_state;
    latestSource = finalResponse.source;

    useChatStore.getState().updateMessage(assistantMessage.id, (message) => ({
      ...message,
      content: streamedAnswer.trim() || finalResponse.answer.trim() || "I am ready for the next question.",
      source: latestSource,
      status: "done",
    }));
    resumeStore.setAssistantState(latestState || resumeStore.analysis?.assistant_state || "idle");
  } catch (caught) {
    if (caught instanceof Error && caught.name === "AbortError") {
      if (streamedAnswer.trim()) {
        useChatStore.getState().updateMessage(assistantMessage.id, (message) => ({
          ...message,
          content: streamedAnswer.trim(),
          source: latestSource,
          status: "done",
        }));
      } else {
        useChatStore.getState().removeMessage(assistantMessage.id);
        useChatStore.getState().appendMessages(createMessage("system", "SentinelX response stopped.", "system"));
      }

      resumeStore.setAssistantState("idle");
      return;
    }

    const message = getApiErrorMessage(caught, "SentinelX could not respond right now.");
    resumeStore.setError(message);
    resumeStore.setAssistantState("alert");
    useChatStore.getState().removeMessage(assistantMessage.id);
    useChatStore.getState().appendMessages(createMessage("system", `Alert: ${message}`, "system"));
  } finally {
    if (streamAbortController === controller) {
      streamAbortController = null;
    }
    useChatStore.getState().setIsAssistantResponding(false);
  }
}

function stopAssistant() {
  streamAbortController?.abort();
  useResumeStore.getState().setAssistantState("idle");
}

function updatePreferences(patch: Partial<AnalysisPreferences>) {
  useResumeStore.getState().updatePreferences(patch);
}

function clearSession() {
  streamAbortController?.abort();
  streamAbortController = null;
  useResumeStore.getState().clearSession();
  useChatStore.getState().clearMessages();
  useUIStore.getState().closeSentinel();
}

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useAppMode();
  const modeConfig = getModeConfig(mode);
  const resumeHydrated = useResumeStore((state) => state.hydrated);
  const parsedResume = useResumeStore((state) => state.parsedResume);
  const analysis = useResumeStore((state) => state.analysis);
  const questions = useResumeStore((state) => state.questions);
  const assessment = useResumeStore((state) => state.assessment);
  const preferences = useResumeStore((state) => state.preferences);
  const appendMessages = useChatStore((state) => state.appendMessages);
  const lastModeRef = useRef(mode);

  useEffect(() => {
    if (!resumeHydrated || lastModeRef.current === mode) {
      return;
    }

    lastModeRef.current = mode;
    appendMessages(
      createMessage(
        "system",
        `Workspace mode switched to ${modeConfig.label}. SentinelX and the active flows are now tuned for ${mode === "HR" ? "recruiter intelligence" : "candidate evaluation"}.`,
        "system"
      )
    );

    if (assessment?.mode !== mode) {
      useResumeStore.getState().setAssessment(null);
    }
    if (questions?.mode !== mode) {
      useResumeStore.getState().setQuestions(null);
    }
  }, [appendMessages, assessment?.mode, mode, modeConfig.label, questions?.mode, resumeHydrated]);

  useEffect(() => {
    if (!resumeHydrated || !preferences.autoGenerateQuestions) {
      return;
    }

    const resumeId = analysis?.resume_id || parsedResume?.resume_id;
    if (!resumeId || questions?.mode === mode) {
      return;
    }

    void loadQuestions(mode, 5);
  }, [analysis?.resume_id, mode, parsedResume?.resume_id, preferences.autoGenerateQuestions, questions?.mode, resumeHydrated]);

  return children;
}

export function useAnalysisActions() {
  const { mode } = useAppMode();

  return useMemo(
    () => ({
      handleResumeUpload: (file: File) => handleResumeUpload(file, mode),
      generateResume: (options?: { template?: ResumeTemplate; targetRole?: string }) => generateResumeArtifact(options),
      refreshScore,
      loadQuestions: (count?: number) => loadQuestions(mode, count),
      evaluateAnswers: (answers: AssessmentAnswerInput[]) => evaluateAnswers(mode, answers),
      sendPrompt: (prompt: string) => sendPrompt(mode, prompt),
      stopAssistant,
      updatePreferences,
      clearSession,
    }),
    [mode]
  );
}

export function useAnalysis() {
  const { mode } = useAppMode();
  const parsedResume = useResumeStore((state) => state.parsedResume);
  const analysis = useResumeStore((state) => state.analysis);
  const generatedResume = useResumeStore((state) => state.generatedResume);
  const questions = useResumeStore((state) => state.questions);
  const assessment = useResumeStore((state) => state.assessment);
  const uploadProgress = useResumeStore((state) => state.uploadProgress);
  const isUploading = useResumeStore((state) => state.isUploading);
  const isAnalyzing = useResumeStore((state) => state.isAnalyzing);
  const isGeneratingResume = useResumeStore((state) => state.isGeneratingResume);
  const isEvaluatingAnswers = useResumeStore((state) => state.isEvaluatingAnswers);
  const error = useResumeStore((state) => state.error);
  const assistantState = useResumeStore((state) => state.assistantState);
  const preferences = useResumeStore((state) => state.preferences);
  const lastFileName = useResumeStore((state) => state.lastFileName);
  const messages = useChatStore((state) => state.messages);
  const isAssistantResponding = useChatStore((state) => state.isAssistantResponding);
  const actions = useAnalysisActions();

  const briefing = useMemo(() => createBriefing(mode, parsedResume, analysis), [analysis, mode, parsedResume]);
  const journeyStage = useMemo(() => {
    if (!parsedResume) {
      return "upload" as const;
    }
    if (!analysis) {
      return "baseline" as const;
    }
    if (!assessment) {
      return "test" as const;
    }
    return "verdict" as const;
  }, [analysis, assessment, parsedResume]);

  return {
    parsedResume,
    analysis,
    generatedResume,
    questions,
    assessment,
    journeyStage,
    uploadProgress,
    isUploading,
    isAnalyzing,
    isGeneratingResume,
    isEvaluatingAnswers,
    error,
    assistantState,
    isAssistantResponding,
    messages,
    preferences,
    lastFileName,
    briefing,
    ...actions,
  } satisfies AnalysisStateSnapshot;
}
