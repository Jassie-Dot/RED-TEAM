"use client";

import { create } from "zustand";

import { LEGACY_MODE_STORAGE_KEY, MODE_STORAGE_KEY } from "@/lib/mode-config";
import type { AppMode } from "@/types/app";
import type {
  AssessmentEvaluationResponse,
  AssistantResponseSource,
  AssistantState,
  GeneratedResumeArtifact,
  ParsedResume,
  QuestionResponse,
  ResumeAnalysis,
} from "@/types/resume";

export type MessageRole = "assistant" | "system" | "user";
export type MessageStatus = "done" | "streaming";

export interface AssistantMessage {
  id: string;
  role: MessageRole;
  content: string;
  source?: AssistantResponseSource | "system";
  status?: MessageStatus;
}

export interface AnalysisPreferences {
  autoGenerateQuestions: boolean;
  strictReviewMode: boolean;
}

const SESSION_STORAGE_KEY = "vigil-ai-session";
const CHAT_STORAGE_KEY = "vigil-ai-chat";
const PREFERENCES_STORAGE_KEY = "vigil-ai-preferences";
const LEGACY_SESSION_STORAGE_KEY = "hireguard-ai-session";
let chatPersistTimer: number | null = null;

const defaultPreferences: AnalysisPreferences = {
  autoGenerateQuestions: true,
  strictReviewMode: true,
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJsonStorage<T>(key: string): T | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJsonStorage(key: string, value: unknown) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function removeStorageKey(key: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(key);
}

function clearStoredSessionData() {
  removeStorageKey(SESSION_STORAGE_KEY);
  removeStorageKey(CHAT_STORAGE_KEY);
  removeStorageKey(LEGACY_SESSION_STORAGE_KEY);
}

interface AppStoreState {
  mode: AppMode;
  hydrated: boolean;
  hydrate: () => void;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
}

interface UIStoreState {
  sentinelOpen: boolean;
  bootComplete: boolean;
  setSentinelOpen: (open: boolean) => void;
  openSentinel: () => void;
  closeSentinel: () => void;
  completeBoot: () => void;
  resetBoot: () => void;
}

interface ResumeStoreState {
  hydrated: boolean;
  parsedResume: ParsedResume | null;
  analysis: ResumeAnalysis | null;
  generatedResume: GeneratedResumeArtifact | null;
  questions: QuestionResponse | null;
  assessment: AssessmentEvaluationResponse | null;
  uploadProgress: number;
  isUploading: boolean;
  isAnalyzing: boolean;
  isGeneratingResume: boolean;
  isEvaluatingAnswers: boolean;
  error: string | null;
  assistantState: AssistantState;
  preferences: AnalysisPreferences;
  lastFileName: string | null;
  hydrate: () => void;
  setParsedResume: (parsedResume: ParsedResume | null) => void;
  setAnalysis: (analysis: ResumeAnalysis | null) => void;
  setGeneratedResume: (generatedResume: GeneratedResumeArtifact | null) => void;
  setQuestions: (questions: QuestionResponse | null) => void;
  setAssessment: (assessment: AssessmentEvaluationResponse | null) => void;
  setUploadProgress: (uploadProgress: number) => void;
  setIsUploading: (isUploading: boolean) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setIsGeneratingResume: (isGeneratingResume: boolean) => void;
  setIsEvaluatingAnswers: (isEvaluatingAnswers: boolean) => void;
  setError: (error: string | null) => void;
  setAssistantState: (assistantState: AssistantState) => void;
  setLastFileName: (lastFileName: string | null) => void;
  updatePreferences: (patch: Partial<AnalysisPreferences>) => void;
  clearSession: () => void;
}

interface ChatStoreState {
  hydrated: boolean;
  messages: AssistantMessage[];
  isAssistantResponding: boolean;
  hydrate: () => void;
  ensureMessages: (messages: AssistantMessage[]) => void;
  setMessages: (messages: AssistantMessage[]) => void;
  appendMessages: (...messages: AssistantMessage[]) => void;
  updateMessage: (id: string, updater: (message: AssistantMessage) => AssistantMessage) => void;
  removeMessage: (id: string) => void;
  setIsAssistantResponding: (isAssistantResponding: boolean) => void;
  clearMessages: (messages?: AssistantMessage[]) => void;
}

function persistResumeState(state: ResumeStoreState) {
  void state;
}

function persistChatState(state: ChatStoreState) {
  void state;
  if (chatPersistTimer !== null && typeof window !== "undefined") {
    window.clearTimeout(chatPersistTimer);
    chatPersistTimer = null;
  }
}

function persistPreferences(preferences: AnalysisPreferences) {
  writeJsonStorage(PREFERENCES_STORAGE_KEY, preferences);
}

const initialResumeState = {
  hydrated: false,
  parsedResume: null,
  analysis: null,
  generatedResume: null,
  questions: null,
  assessment: null,
  uploadProgress: 0,
  isUploading: false,
  isAnalyzing: false,
  isGeneratingResume: false,
  isEvaluatingAnswers: false,
  error: null,
  assistantState: "idle" as AssistantState,
  preferences: defaultPreferences,
  lastFileName: null,
};

const initialChatState = {
  hydrated: false,
  messages: [] as AssistantMessage[],
  isAssistantResponding: false,
};

export const useAppStore = create<AppStoreState>((set, get) => ({
  mode: "HR",
  hydrated: false,
  hydrate() {
    if (!canUseStorage() || get().hydrated) {
      return;
    }

    const storedMode =
      window.localStorage.getItem(MODE_STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_MODE_STORAGE_KEY);
    const mode: AppMode = storedMode === "STUDENT" ? "STUDENT" : "HR";

    window.localStorage.setItem(MODE_STORAGE_KEY, mode);
    set({
      mode,
      hydrated: true,
    });
  },
  setMode(mode) {
    if (canUseStorage()) {
      window.localStorage.setItem(MODE_STORAGE_KEY, mode);
    }

    set({
      mode,
      hydrated: true,
    });
  },
  toggleMode() {
    const nextMode: AppMode = get().mode === "HR" ? "STUDENT" : "HR";
    get().setMode(nextMode);
  },
}));

export const useUIStore = create<UIStoreState>((set) => ({
  sentinelOpen: false,
  bootComplete: false,
  setSentinelOpen: (sentinelOpen) => set({ sentinelOpen }),
  openSentinel: () => set({ sentinelOpen: true }),
  closeSentinel: () => set({ sentinelOpen: false }),
  completeBoot: () => set({ bootComplete: true }),
  resetBoot: () => set({ bootComplete: false }),
}));

export const useResumeStore = create<ResumeStoreState>((set, get) => ({
  ...initialResumeState,
  hydrate() {
    if (!canUseStorage() || get().hydrated) {
      return;
    }

    clearStoredSessionData();
    const storedPreferences = readJsonStorage<AnalysisPreferences>(PREFERENCES_STORAGE_KEY);

    set({
      hydrated: true,
      parsedResume: null,
      analysis: null,
      generatedResume: null,
      questions: null,
      assessment: null,
      assistantState: "idle",
      preferences: storedPreferences || defaultPreferences,
      lastFileName: null,
    });
  },
  setParsedResume(parsedResume) {
    set((state) => {
      const next = { ...state, parsedResume };
      persistResumeState(next);
      return next;
    });
  },
  setAnalysis(analysis) {
    set((state) => {
      const next = { ...state, analysis };
      persistResumeState(next);
      return next;
    });
  },
  setGeneratedResume(generatedResume) {
    set((state) => {
      const next = { ...state, generatedResume };
      persistResumeState(next);
      return next;
    });
  },
  setQuestions(questions) {
    set((state) => {
      const next = { ...state, questions };
      persistResumeState(next);
      return next;
    });
  },
  setAssessment(assessment) {
    set((state) => {
      const next = { ...state, assessment };
      persistResumeState(next);
      return next;
    });
  },
  setUploadProgress(uploadProgress) {
    set({ uploadProgress });
  },
  setIsUploading(isUploading) {
    set({ isUploading });
  },
  setIsAnalyzing(isAnalyzing) {
    set({ isAnalyzing });
  },
  setIsGeneratingResume(isGeneratingResume) {
    set({ isGeneratingResume });
  },
  setIsEvaluatingAnswers(isEvaluatingAnswers) {
    set({ isEvaluatingAnswers });
  },
  setError(error) {
    set({ error });
  },
  setAssistantState(assistantState) {
    set((state) => {
      const next = { ...state, assistantState };
      persistResumeState(next);
      return next;
    });
  },
  setLastFileName(lastFileName) {
    set((state) => {
      const next = { ...state, lastFileName };
      persistResumeState(next);
      return next;
    });
  },
  updatePreferences(patch) {
    set((state) => {
      const next = {
        ...state,
        preferences: { ...state.preferences, ...patch },
      };
      persistPreferences(next.preferences);
      return next;
    });
  },
  clearSession() {
    clearStoredSessionData();
    set({
      ...initialResumeState,
      hydrated: true,
    });
  },
}));

export const useChatStore = create<ChatStoreState>((set, get) => ({
  ...initialChatState,
  hydrate() {
    if (!canUseStorage() || get().hydrated) {
      return;
    }

    clearStoredSessionData();

    set({
      hydrated: true,
      messages: [],
    });
  },
  ensureMessages(messages) {
    if (get().messages.length) {
      return;
    }

    set((state) => {
      const next = { ...state, messages };
      persistChatState(next);
      return next;
    });
  },
  setMessages(messages) {
    set((state) => {
      const next = { ...state, messages };
      persistChatState(next);
      return next;
    });
  },
  appendMessages(...messages) {
    set((state) => {
      const next = { ...state, messages: [...state.messages, ...messages] };
      persistChatState(next);
      return next;
    });
  },
  updateMessage(id, updater) {
    set((state) => {
      const next = {
        ...state,
        messages: state.messages.map((message) => (message.id === id ? updater(message) : message)),
      };
      persistChatState(next);
      return next;
    });
  },
  removeMessage(id) {
    set((state) => {
      const next = {
        ...state,
        messages: state.messages.filter((message) => message.id !== id),
      };
      persistChatState(next);
      return next;
    });
  },
  setIsAssistantResponding(isAssistantResponding) {
    set({ isAssistantResponding });
  },
  clearMessages(messages = []) {
    set((state) => {
      const next = { ...state, messages, isAssistantResponding: false };
      persistChatState(next);
      return next;
    });
  },
}));

export function hydrateAppStores() {
  useAppStore.getState().hydrate();
  useResumeStore.getState().hydrate();
  useChatStore.getState().hydrate();
}

export function useAppMode() {
  const mode = useAppStore((state) => state.mode);
  const hydrated = useAppStore((state) => state.hydrated);
  const setMode = useAppStore((state) => state.setMode);
  const toggleMode = useAppStore((state) => state.toggleMode);

  return {
    mode,
    hydrated,
    setMode,
    toggleMode,
  };
}
