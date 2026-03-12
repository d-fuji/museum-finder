import type { BookmarkStatus } from "@/types/api";

type BookmarkInput = {
  museumId?: unknown;
  status?: unknown;
  visitedAt?: unknown;
};

type ValidationSuccess = {
  success: true;
  data: { museumId: number; status: BookmarkStatus; visitedAt: string | undefined };
};

type ValidationError = {
  success: false;
  error: string;
};

type ValidationResult = ValidationSuccess | ValidationError;

export const VALID_STATUSES: readonly string[] = ["WANT_TO_GO", "VISITED"];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function validateBookmarkInput(input: BookmarkInput): ValidationResult {
  const { museumId, status, visitedAt } = input;

  if (typeof museumId !== "number" || !Number.isInteger(museumId) || museumId < 1) {
    return { success: false, error: "museumId は正の整数で指定してください" };
  }

  if (typeof status !== "string" || !VALID_STATUSES.includes(status)) {
    return { success: false, error: "status は WANT_TO_GO または VISITED で指定してください" };
  }

  const typedStatus = status as BookmarkStatus;

  // visitedAt は VISITED のときのみ有効
  if (typedStatus === "WANT_TO_GO") {
    return { success: true, data: { museumId, status: typedStatus, visitedAt: undefined } };
  }

  // VISITED の場合
  if (visitedAt !== undefined && visitedAt !== null) {
    if (
      typeof visitedAt !== "string" ||
      !DATE_PATTERN.test(visitedAt) ||
      isNaN(Date.parse(visitedAt))
    ) {
      return { success: false, error: "visitedAt は YYYY-MM-DD 形式で指定してください" };
    }
    return { success: true, data: { museumId, status: typedStatus, visitedAt } };
  }

  return { success: true, data: { museumId, status: typedStatus, visitedAt: undefined } };
}
