type ReviewInput = {
  rating?: unknown;
  comment?: unknown;
};

type ValidationSuccess = {
  success: true;
  data: { rating: number; comment?: string };
};

type ValidationError = {
  success: false;
  error: string;
};

type ValidationResult = ValidationSuccess | ValidationError;

export function validateReviewInput(input: ReviewInput): ValidationResult {
  const { rating, comment } = input;

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "rating は 1〜5 の整数で指定してください" };
  }

  if (comment !== undefined && comment !== null && typeof comment !== "string") {
    return { success: false, error: "コメントは文字列で指定してください" };
  }

  const trimmedComment = typeof comment === "string" ? comment.trim() : undefined;
  const normalizedComment = trimmedComment === "" ? undefined : trimmedComment;

  if (normalizedComment && normalizedComment.length > 1000) {
    return { success: false, error: "コメントは 1000 文字以内で入力してください" };
  }

  return { success: true, data: { rating, comment: normalizedComment } };
}
