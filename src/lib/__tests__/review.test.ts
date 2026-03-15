import { describe, it, expect } from "vitest";
import { validateReviewInput } from "@/lib/review";

describe("validateReviewInput", () => {
  it("should return valid when rating is between 1 and 5", () => {
    const result = validateReviewInput({ rating: 3 });
    expect(result.success).toBe(true);
  });

  it("should return error when rating is missing", () => {
    const result = validateReviewInput({});
    expect(result.success).toBe(false);
    expect(result.error).toBe("rating は 1〜5 の整数で指定してください");
  });

  it("should return error when rating is 0", () => {
    const result = validateReviewInput({ rating: 0 });
    expect(result.success).toBe(false);
  });

  it("should return error when rating is 6", () => {
    const result = validateReviewInput({ rating: 6 });
    expect(result.success).toBe(false);
  });

  it("should return error when rating is not an integer", () => {
    const result = validateReviewInput({ rating: 3.5 });
    expect(result.success).toBe(false);
  });

  it("should accept optional comment", () => {
    const result = validateReviewInput({ rating: 4, comment: "良かった" });
    expect(result.success).toBe(true);
    expect(result.data?.comment).toBe("良かった");
  });

  it("should return error when comment exceeds 1000 characters", () => {
    const longComment = "あ".repeat(1001);
    const result = validateReviewInput({ rating: 4, comment: longComment });
    expect(result.success).toBe(false);
    expect(result.error).toBe("コメントは 1000 文字以内で入力してください");
  });

  it("should treat empty string comment as undefined", () => {
    const result = validateReviewInput({ rating: 4, comment: "" });
    expect(result.success).toBe(true);
    expect(result.data?.comment).toBeUndefined();
  });

  it("should accept optional headline", () => {
    const result = validateReviewInput({ rating: 4, headline: "時が止まった紡績工場" });
    expect(result.success).toBe(true);
    expect(result.data?.headline).toBe("時が止まった紡績工場");
  });

  it("should return error when headline exceeds 50 characters", () => {
    const longHeadline = "あ".repeat(51);
    const result = validateReviewInput({ rating: 4, headline: longHeadline });
    expect(result.success).toBe(false);
    expect(result.error).toBe("一言コメントは 50 文字以内で入力してください");
  });

  it("should treat empty string headline as undefined", () => {
    const result = validateReviewInput({ rating: 4, headline: "" });
    expect(result.success).toBe(true);
    expect(result.data?.headline).toBeUndefined();
  });

  it("should return error when headline is non-string type", () => {
    const result = validateReviewInput({ rating: 4, headline: 123 });
    expect(result.success).toBe(false);
    expect(result.error).toBe("一言コメントは文字列で指定してください");
  });
});
