const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export function hasGroqCredentials() {
  return Boolean(process.env.GROQ_API_KEY);
}

function extractJsonBlock(content = "") {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Groq response did not contain JSON.");
  }

  return content.slice(start, end + 1);
}

export async function callGroqJson({ systemPrompt, userPrompt, temperature = 0.2, maxTokens = 1800 }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq request failed with ${response.status}: ${errorText}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq response was empty.");
  }

  return JSON.parse(extractJsonBlock(content));
}
