import type { QuestionItem } from "@/types/resume";

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

export function evaluateQuizAnswer(question: QuestionItem, answer: string) {
  const answerTokens = new Set(tokenize(answer));
  const expectationTokens = question.expected_points.flatMap((point) => tokenize(point));
  const distinctExpectationTokens = Array.from(new Set(expectationTokens));
  const matched = distinctExpectationTokens.filter((token) => answerTokens.has(token)).length;
  const ratio = distinctExpectationTokens.length ? matched / distinctExpectationTokens.length : 0;
  const score = Math.round(ratio * 100);

  let verdict = "Needs stronger evidence";
  if (score >= 70) {
    verdict = "Strong answer";
  } else if (score >= 40) {
    verdict = "Promising but incomplete";
  }

  return {
    score,
    verdict,
    feedback:
      score >= 70
        ? "You covered the main evidence points. Add one metric or concrete tradeoff to make it even sharper."
        : score >= 40
          ? "You have the outline, but SentinelX wants clearer ownership, more technical specificity, and a stronger result."
          : "This answer stays too general. Anchor it in one real project, your role, and a measurable outcome.",
  };
}
