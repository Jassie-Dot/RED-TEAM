import type { RiskLevel } from "@/types/resume";

type ClassNameValue = string | false | null | undefined;

export function cn(...inputs: ClassNameValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatScore(value?: number | null, suffix = "/100") {
  return typeof value === "number" ? `${Math.round(value)}${suffix}` : `--${suffix}`;
}

export function getStatusVariant(
  value?: RiskLevel | string | null
): "neutral" | "success" | "warning" | "danger" {
  const normalized = value?.toLowerCase() || "";

  if (
    normalized.includes("low") ||
    normalized.includes("validated") ||
    normalized.includes("advanced")
  ) {
    return "success";
  }

  if (
    normalized.includes("medium") ||
    normalized.includes("developing") ||
    normalized.includes("mixed")
  ) {
    return "warning";
  }

  if (
    normalized.includes("high") ||
    normalized.includes("emerging") ||
    normalized.includes("alert")
  ) {
    return "danger";
  }

  return "neutral";
}

export function clampCopy(value?: string | null, fallback?: string, maxLength = 180) {
  const source = value?.trim() || fallback || "";
  if (!source) {
    return "";
  }

  if (source.length <= maxLength) {
    return source;
  }

  return `${source.slice(0, maxLength - 1).trimEnd()}...`;
}
