import { existsSync, readFileSync } from "fs";
import path from "path";

import { NextResponse } from "next/server";

import type { AppMode } from "@/types/app";
import type {
  AssistantChatHistoryItem,
  AssistantChatRequest,
  AssistantChatResponse,
  AssistantResponseSource,
  AssistantState,
  ParsedResume,
  ResumeAnalysis,
} from "@/types/resume";

export const runtime = "nodejs";

const textEncoder = new TextEncoder();

function readBackendEnv() {
  const envPath = path.join(process.cwd(), "..", "backend", ".env");
  const values: Record<string, string> = {};

  if (!existsSync(envPath)) {
    return values;
  }

  for (const rawLine of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) {
      continue;
    }

    const [key, ...rest] = line.split("=");
    values[key.trim()] = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
  }

  return values;
}

function normalizeHistory(history?: AssistantChatHistoryItem[]) {
  return (history || [])
    .filter((item): item is AssistantChatHistoryItem => Boolean(item?.content?.trim()) && (item.role === "user" || item.role === "assistant"))
    .slice(-8)
    .map((item) => ({
      role: item.role,
      content: item.content.trim(),
    }));
}

function getAssistantState(analysis: ResumeAnalysis | null) {
  return analysis?.assistant_state || "idle";
}

function getProviderConfig(env: Record<string, string>) {
  const openAiApiKey = process.env.OPENAI_API_KEY || env.OPENAI_API_KEY || "";
  if (openAiApiKey) {
    return {
      url: "https://api.openai.com/v1/chat/completions",
      apiKey: openAiApiKey,
      model: process.env.OPENAI_MODEL || env.OPENAI_MODEL || "gpt-4o-mini",
    };
  }

  const groqApiKey = process.env.GROQ_API_KEY || env.GROQ_API_KEY || "";
  if (groqApiKey) {
    return {
      url: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: groqApiKey,
      model: process.env.GROQ_MODEL || env.GROQ_MODEL || "llama-3.3-70b-versatile",
    };
  }

  return null;
}

function createWorkspaceContext(
  mode: AppMode,
  parsedResume: ParsedResume | null,
  analysis: ResumeAnalysis | null,
  questionCount: number,
  questionTopics: string[]
) {
  if (!parsedResume) {
    return {
      workspace: "Vigil-AI",
      mode,
      candidate_loaded: false,
      capabilities: [
        "Resume upload and parsing",
        "Trust score and risk analysis",
        "Interview prompt generation",
        mode === "HR" ? "Recruiter-facing candidate briefings" : "Candidate improvement roadmaps",
      ],
      note: "No candidate dossier is loaded yet. Help with general recruiting guidance or product navigation until a resume is uploaded.",
    };
  }

  return {
    workspace: "Vigil-AI",
    mode,
    candidate_loaded: true,
    parsed_resume: {
      candidate_name: parsedResume.candidate_name,
      email: parsedResume.email,
      phone: parsedResume.phone,
      summary: parsedResume.summary,
      skills: parsedResume.skills.slice(0, 16),
      experience: parsedResume.experience.slice(0, 6),
      education: parsedResume.education.slice(0, 4),
      certifications: parsedResume.certifications.slice(0, 6),
    },
    analysis: analysis
      ? {
          score: analysis.score,
          risk_level: analysis.risk_level,
          reasons: analysis.reasons.slice(0, 5),
          strengths: analysis.strengths.slice(0, 5),
          alerts: analysis.alerts.slice(0, 5),
          ai_summary: analysis.ai_summary,
          recommendation: analysis.recommendation,
          skill_matrix: analysis.skill_matrix.slice(0, 8),
          timeline: analysis.timeline,
          profile_strength: analysis.profile_strength,
        }
      : null,
    interview_context: {
      question_count: questionCount,
      question_topics: questionTopics,
    },
  };
}

function buildPromptMessages({
  prompt,
  mode,
  parsedResume,
  analysis,
  questionCount,
  questionTopics,
  history,
}: {
  prompt: string;
  mode: AppMode;
  parsedResume: ParsedResume | null;
  analysis: ResumeAnalysis | null;
  questionCount: number;
  questionTopics: string[];
  history: AssistantChatHistoryItem[];
}) {
  return [
    {
      role: "system",
      content:
        "You are SentinelX inside Vigil-AI, a real-time recruiting intelligence assistant. " +
        `The active workspace mode is ${mode}. ` +
        "When candidate context is present, use only the supplied dossier and analysis and never invent resume facts, dates, employers, scores, or evidence. " +
        "When candidate context is missing, still act as a helpful assistant for product guidance, recruiting workflow, interview planning, and platform usage. " +
        "If information is missing, say so plainly and suggest the next useful step. " +
        (mode === "HR"
          ? "Keep answers direct, conversational, and recruiter-friendly."
          : "Keep answers direct, supportive, and focused on learning, improvement, and honest self-assessment."),
    },
    {
      role: "system",
      content: `Workspace context:\n${JSON.stringify(createWorkspaceContext(mode, parsedResume, analysis, questionCount, questionTopics), null, 2)}`,
    },
    ...history.map((item) => ({
      role: item.role,
      content: item.content,
    })),
    {
      role: "user",
      content: prompt,
    },
  ];
}

function groundedReply({
  prompt,
  mode,
  parsedResume,
  analysis,
  questionCount,
  questionTopics,
}: {
  prompt: string;
  mode: AppMode;
  parsedResume: ParsedResume | null;
  analysis: ResumeAnalysis | null;
  questionCount: number;
  questionTopics: string[];
}) {
  const input = prompt.toLowerCase();

  if (!parsedResume) {
    if (/\b(hi|hello|hey|yo)\b/.test(input) || input.includes("what can you do") || input.includes("help")) {
      return mode === "HR"
        ? "I can guide you through Vigil-AI, explain trust scoring, suggest interview plans, and review recruiting risks. Upload a resume when you want candidate-specific analysis."
        : "I can guide you through Vigil-AI, explain skill validation, help you prepare for interviews, and build an improvement plan. Upload a resume when you want candidate-specific analysis.";
    }

    if (input.includes("upload") || input.includes("resume") || input.includes("start")) {
      return "Start by uploading a PDF or DOCX resume in the intake panel. Once it is parsed, I can explain the trust score, highlight red flags, and generate interview follow-ups.";
    }

    if (input.includes("interview") || input.includes("question")) {
      return mode === "HR"
        ? "I can help with interview planning right away. For candidate-specific prompts, upload the resume first. For now, I can also suggest a generic screen focused on evidence, ownership, and measurable outcomes."
        : "I can help with interview preparation right away. For candidate-specific prompts, upload the resume first. For now, I can still suggest practice questions focused on ownership, clarity, and measurable outcomes.";
    }

    if (input.includes("score") || input.includes("risk") || input.includes("red flag")) {
      return "Trust score and risk findings activate after a resume upload. Once a candidate file is loaded, I can break down the score drivers, explain the biggest risk signals, and recommend the next hiring step.";
    }

    return mode === "HR"
      ? "I am ready to help with recruiting workflow, screening guidance, and Vigil-AI navigation. Upload a resume for candidate-specific analysis, or ask a general hiring question."
      : "I am ready to help with candidate evaluation, interview preparation, and Vigil-AI navigation. Upload a resume for candidate-specific analysis, or ask a general skill-development question.";
  }

  if (!analysis) {
    return mode === "HR"
      ? `${parsedResume.candidate_name}'s resume is loaded, but the full analysis is not ready yet. Finish the analysis run and I can explain the score, risks, interview strategy, and next verification steps.`
      : `${parsedResume.candidate_name}'s resume is loaded, but the full analysis is not ready yet. Finish the analysis run and I can explain the skill gaps, readiness signals, and improvement roadmap.`;
  }

  if (input.includes("score") || input.includes("trust") || input.includes("rating")) {
    return `The current trust score is ${analysis.score}/100 with ${analysis.risk_level.toLowerCase()} risk. The strongest score driver right now is: ${analysis.reasons[0] || "no major risk reason is available yet."}`;
  }

  if (input.includes("red flag") || input.includes("risk") || input.includes("alert") || input.includes("suspicious")) {
    return analysis.alerts.length
      ? `The most important risk signals are: ${analysis.alerts.slice(0, 3).join(" ")}`
      : "There are no major alerts right now, but I would still validate the candidate with evidence-based interview questions.";
  }

  if (input.includes("interview") || input.includes("question") || input.includes("ask")) {
    const focus = questionTopics.length ? questionTopics.slice(0, 3).join(", ") : "the weakest evidence-backed claims";
    const questionStatus = questionCount ? `There are already ${questionCount} generated prompts in the workspace.` : "No custom prompt pack is loaded yet.";
    return mode === "HR"
      ? `${questionStatus} Focus the interview on ${focus}. Current recommendation: ${analysis.recommendation}`
      : `${questionStatus} Practice the weakest areas first: ${focus}. Turn each answer into a project-backed explanation with ownership, reasoning, and results.`;
  }

  if (input.includes("skill") || input.includes("stack")) {
    const skills = analysis.skill_matrix.slice(0, 4);
    return skills.length
      ? `Verified skill view for ${parsedResume.candidate_name}: ${skills.map((item) => `${item.skill} at ${item.confidence}% confidence`).join(" | ")}`
      : "No verified skill matrix is available yet.";
  }

  if (input.includes("improve") || input.includes("prepare") || input.includes("better")) {
    const weakerSkills = analysis.skill_matrix.filter((item) => item.confidence < 70).slice(0, 2).map((item) => item.skill);
    return mode === "HR"
      ? `${analysis.recommendation} Preparation should focus on ${weakerSkills.join(", ") || "the weaker evidence-backed claims"}.`
      : `Preparation should focus on ${weakerSkills.join(", ") || "the weaker evidence-backed claims"}. Build one concrete project story for each and practice the explanation until it feels specific and measurable.`;
  }

  return `${parsedResume.candidate_name} is currently assessed at ${analysis.score}/100 with ${analysis.risk_level.toLowerCase()} risk. ${analysis.ai_summary} Recommendation: ${analysis.recommendation}`;
}

function createJsonResponse(payload: AssistantChatResponse, status = 200) {
  return NextResponse.json<AssistantChatResponse>(payload, { status });
}

function createStreamEvent(
  type: "meta" | "delta" | "done",
  payload: Record<string, unknown>
) {
  return textEncoder.encode(`data: ${JSON.stringify({ type, ...payload })}\n\n`);
}

function chunkText(text: string) {
  const tokens = text.match(/\S+\s*/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const token of tokens) {
    if ((current + token).length > 34 && current) {
      chunks.push(current);
      current = token;
      continue;
    }
    current += token;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function requestLiveResponse({
  provider,
  prompt,
  mode,
  parsedResume,
  analysis,
  questionCount,
  questionTopics,
  history,
}: {
  provider: NonNullable<ReturnType<typeof getProviderConfig>>;
  prompt: string;
  mode: AppMode;
  parsedResume: ParsedResume | null;
  analysis: ResumeAnalysis | null;
  questionCount: number;
  questionTopics: string[];
  history: AssistantChatHistoryItem[];
}) {
  const response = await fetch(provider.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0.25,
      messages: buildPromptMessages({
        prompt,
        mode,
        parsedResume,
        analysis,
        questionCount,
        questionTopics,
        history,
      }),
    }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed with ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const answer = data.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error("Empty AI response");
  }

  return answer;
}

async function streamLiveResponse({
  controller,
  provider,
  prompt,
  mode,
  parsedResume,
  analysis,
  questionCount,
  questionTopics,
  history,
}: {
  controller: ReadableStreamDefaultController<Uint8Array>;
  provider: NonNullable<ReturnType<typeof getProviderConfig>>;
  prompt: string;
  mode: AppMode;
  parsedResume: ParsedResume | null;
  analysis: ResumeAnalysis | null;
  questionCount: number;
  questionTopics: string[];
  history: AssistantChatHistoryItem[];
}) {
  const response = await fetch(provider.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0.25,
      stream: true,
      messages: buildPromptMessages({
        prompt,
        mode,
        parsedResume,
        analysis,
        questionCount,
        questionTopics,
        history,
      }),
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`AI stream failed with ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

    const eventBlocks = buffer.split("\n\n");
    buffer = eventBlocks.pop() || "";

    for (const eventBlock of eventBlocks) {
      const lines = eventBlock
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim());

      for (const line of lines) {
        if (!line || line === "[DONE]") {
          continue;
        }

        try {
          const parsed = JSON.parse(line) as {
            choices?: Array<{
              delta?: { content?: string };
            }>;
          };
          const delta = parsed.choices?.[0]?.delta?.content;
          if (!delta) {
            continue;
          }
          answer += delta;
          controller.enqueue(createStreamEvent("delta", { delta }));
        } catch {
          continue;
        }
      }

      if (eventBlock.includes("[DONE]")) {
        return answer.trim();
      }
    }

    if (done) {
      break;
    }
  }

  if (!answer.trim()) {
    throw new Error("Empty AI stream");
  }

  return answer.trim();
}

function createStreamingResponse({
  prompt,
  mode,
  parsedResume,
  analysis,
  questionCount,
  questionTopics,
  history,
  provider,
}: {
  prompt: string;
  mode: AppMode;
  parsedResume: ParsedResume | null;
  analysis: ResumeAnalysis | null;
  questionCount: number;
  questionTopics: string[];
  history: AssistantChatHistoryItem[];
  provider: NonNullable<ReturnType<typeof getProviderConfig>> | null;
}) {
  const assistantState = getAssistantState(analysis);

  return new Response(
    new ReadableStream<Uint8Array>({
      async start(controller) {
        let answer = "";
        let source: AssistantResponseSource = "grounded";

        try {
          if (provider) {
            source = "live_ai";
            controller.enqueue(createStreamEvent("meta", { source, assistant_state: assistantState }));
            answer = await streamLiveResponse({
              controller,
              provider,
              prompt,
              mode,
              parsedResume,
              analysis,
              questionCount,
              questionTopics,
              history,
            });
          } else {
            throw new Error("Missing live AI key");
          }
        } catch {
          source = "grounded";
          answer = groundedReply({
            prompt,
            mode,
            parsedResume,
            analysis,
            questionCount,
            questionTopics,
          });
          controller.enqueue(createStreamEvent("meta", { source, assistant_state: assistantState }));

          for (const chunk of chunkText(answer)) {
            controller.enqueue(createStreamEvent("delta", { delta: chunk }));
            await sleep(42);
          }
        }

        controller.enqueue(
          createStreamEvent("done", {
            answer,
            source,
            assistant_state: assistantState,
          })
        );
        controller.close();
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    }
  );
}

export async function POST(request: Request) {
  const payload = (await request.json()) as AssistantChatRequest;
  const prompt = payload.prompt?.trim();

  if (!prompt) {
    return createJsonResponse(
      {
        answer: "Ask a question about the candidate, the score, interview strategy, or how to use Vigil-AI.",
        source: "grounded",
        assistant_state: "idle",
      },
      400
    );
  }

  const parsedResume = payload.parsed_resume || null;
  const mode = payload.mode === "STUDENT" ? "STUDENT" : "HR";
  const analysis = payload.analysis || null;
  const questionTopics = payload.question_topics?.filter(Boolean).slice(0, 5) || [];
  const questionCount = payload.question_count || 0;
  const history = normalizeHistory(payload.history);
  const env = readBackendEnv();
  const provider = getProviderConfig(env);
  const assistantState = getAssistantState(analysis);

  if (payload.stream) {
    return createStreamingResponse({
      prompt,
      mode,
      parsedResume,
      analysis,
      questionCount,
      questionTopics,
      history,
      provider,
    });
  }

  if (!provider) {
    return createJsonResponse({
      answer: groundedReply({
        prompt,
        mode,
        parsedResume,
        analysis,
        questionCount,
        questionTopics,
      }),
      source: "grounded",
      assistant_state: assistantState,
    });
  }

  try {
    const answer = await requestLiveResponse({
      provider,
      prompt,
      mode,
      parsedResume,
      analysis,
      questionCount,
      questionTopics,
      history,
    });

    return createJsonResponse({
      answer,
      source: "live_ai",
      assistant_state: assistantState,
    });
  } catch {
    return createJsonResponse({
      answer: groundedReply({
        prompt,
        mode,
        parsedResume,
        analysis,
        questionCount,
        questionTopics,
      }),
      source: "grounded",
      assistant_state: assistantState,
    });
  }
}
