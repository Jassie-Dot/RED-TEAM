import axios from "axios";

import type {
  AssessmentAnswerInput,
  AssessmentEvaluationResponse,
  AssistantChatRequest,
  AssistantChatResponse,
  AssistantResponseSource,
  AssistantState,
  GeneratedResumeArtifact,
  QuestionResponse,
  ResumeGenerationRequest,
  ResumeAnalysis,
  UploadResponse,
} from "@/types/resume";
import type { AppMode } from "@/types/app";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
});

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export async function uploadResume(file: File, onProgress?: (progress: number) => void) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<UploadResponse>("/upload_resume", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
    onUploadProgress: (event) => {
      if (!event.total || !onProgress) {
        return;
      }
      onProgress(Math.round((event.loaded * 100) / event.total));
    }
  });
  return response.data;
}

export async function analyzeResume(resumeId: string) {
  const response = await api.post<ResumeAnalysis>("/analyze_resume", { resume_id: resumeId });
  return response.data;
}

export async function getScore(resumeId: string) {
  const response = await api.get("/get_score", {
    params: { resume_id: resumeId }
  });
  return response.data as Pick<ResumeAnalysis, "score" | "risk_level" | "reasons">;
}

export async function generateQuestions(resumeId: string, count = 5, mode: AppMode = "HR") {
  const response = await api.post<QuestionResponse>("/generate_questions", {
    resume_id: resumeId,
    count,
    mode,
  });
  return response.data;
}

export async function generateFreeResume(payload: ResumeGenerationRequest) {
  const response = await api.post<GeneratedResumeArtifact>("/generate_free_resume", payload);
  return response.data;
}

export async function evaluateAnswers({
  resumeId,
  mode,
  answers,
  questions,
}: {
  resumeId: string;
  mode: AppMode;
  answers: AssessmentAnswerInput[];
  questions: QuestionResponse["questions"];
}) {
  const response = await api.post<AssessmentEvaluationResponse>("/evaluate_answers", {
    resume_id: resumeId,
    mode,
    answers,
    questions,
  });
  return response.data;
}

export async function chatWithAssistant(payload: AssistantChatRequest) {
  const response = await axios.post<AssistantChatResponse>("/api/assistant_chat", payload);
  return response.data;
}

interface AssistantStreamHandlers {
  onChunk?: (chunk: string) => void;
  onMeta?: (meta: { source: AssistantResponseSource; assistant_state: AssistantState }) => void;
  onComplete?: (response: AssistantChatResponse) => void;
}

interface AssistantStreamOptions {
  signal?: AbortSignal;
}

type AssistantStreamEvent =
  | {
      type: "meta";
      source: AssistantResponseSource;
      assistant_state: AssistantState;
    }
  | {
      type: "delta";
      delta: string;
    }
  | ({
      type: "done";
    } & AssistantChatResponse);

function parseAssistantStreamEvent(raw: string): AssistantStreamEvent | null {
  try {
    return JSON.parse(raw) as AssistantStreamEvent;
  } catch {
    return null;
  }
}

export async function streamAssistantChat(
  payload: AssistantChatRequest,
  handlers: AssistantStreamHandlers = {},
  options: AssistantStreamOptions = {}
) {
  const response = await fetch("/api/assistant_chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: options.signal,
    body: JSON.stringify({
      ...payload,
      stream: true,
    }),
  });

  if (!response.ok) {
    let message = "SentinelX could not respond right now.";

    try {
      const data = (await response.json()) as Partial<AssistantChatResponse> & { detail?: string };
      message = data.detail || data.answer || message;
    } catch {
      const text = await response.text();
      if (text.trim()) {
        message = text.trim();
      }
    }

    throw new Error(message);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = (await response.json()) as AssistantChatResponse;
    handlers.onMeta?.({
      source: data.source,
      assistant_state: data.assistant_state,
    });
    handlers.onChunk?.(data.answer);
    handlers.onComplete?.(data);
    return data;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Streaming response was unavailable.");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let fallbackMeta: { source: AssistantResponseSource; assistant_state: AssistantState } | null = null;
  let finalResponse: AssistantChatResponse | null = null;

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const eventBlock of events) {
      const lines = eventBlock
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim());

      if (!lines.length) {
        continue;
      }

      const event = parseAssistantStreamEvent(lines.join("\n"));
      if (!event) {
        continue;
      }

      if (event.type === "meta") {
        fallbackMeta = {
          source: event.source,
          assistant_state: event.assistant_state,
        };
        handlers.onMeta?.(fallbackMeta);
        continue;
      }

      if (event.type === "delta") {
        handlers.onChunk?.(event.delta);
        continue;
      }

      finalResponse = {
        answer: event.answer,
        source: event.source,
        assistant_state: event.assistant_state,
      };
      handlers.onComplete?.(finalResponse);
    }

    if (done) {
      break;
    }
  }

  if (finalResponse) {
    return finalResponse;
  }

  if (fallbackMeta) {
    const emptyResponse: AssistantChatResponse = {
      answer: "",
      source: fallbackMeta.source,
      assistant_state: fallbackMeta.assistant_state,
    };
    handlers.onComplete?.(emptyResponse);
    return emptyResponse;
  }

  throw new Error("SentinelX streaming ended unexpectedly.");
}
