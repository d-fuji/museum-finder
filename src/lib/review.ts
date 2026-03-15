type ReviewInput = {
  rating?: unknown;
  headline?: unknown;
  comment?: unknown;
};

type ValidationSuccess = {
  success: true;
  data: { rating: number; headline?: string; comment?: string };
};

type ValidationError = {
  success: false;
  error: string;
};

type ValidationResult = ValidationSuccess | ValidationError;

export function validateReviewInput(input: ReviewInput): ValidationResult {
  const { rating, headline, comment } = input;

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "rating は 1〜5 の整数で指定してください" };
  }

  if (headline !== undefined && headline !== null && typeof headline !== "string") {
    return { success: false, error: "一言コメントは文字列で指定してください" };
  }

  const trimmedHeadline = typeof headline === "string" ? headline.trim() : undefined;
  const normalizedHeadline = trimmedHeadline === "" ? undefined : trimmedHeadline;

  if (normalizedHeadline && normalizedHeadline.length > 50) {
    return { success: false, error: "一言コメントは 50 文字以内で入力してください" };
  }

  if (comment !== undefined && comment !== null && typeof comment !== "string") {
    return { success: false, error: "コメントは文字列で指定してください" };
  }

  const trimmedComment = typeof comment === "string" ? comment.trim() : undefined;
  const normalizedComment = trimmedComment === "" ? undefined : trimmedComment;

  if (normalizedComment && normalizedComment.length > 1000) {
    return { success: false, error: "コメントは 1000 文字以内で入力してください" };
  }

  return {
    success: true,
    data: { rating, headline: normalizedHeadline, comment: normalizedComment },
  };
}
