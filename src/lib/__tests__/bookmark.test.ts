import { describe, it, expect } from "vitest";
import { validateBookmarkInput } from "@/lib/bookmark";

describe("validateBookmarkInput", () => {
  it("should return valid when museumId and status are provided", () => {
    const result = validateBookmarkInput({ museumId: 1, status: "WANT_TO_GO" });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ museumId: 1, status: "WANT_TO_GO", visitedAt: undefined });
  });

  it("should return error when museumId is missing", () => {
    const result = validateBookmarkInput({ status: "WANT_TO_GO" });
    expect(result.success).toBe(false);
    expect(result.error).toBe("museumId は正の整数で指定してください");
  });

  it("should return error when museumId is not a positive integer", () => {
    const result = validateBookmarkInput({ museumId: -1, status: "WANT_TO_GO" });
    expect(result.success).toBe(false);
    expect(result.error).toBe("museumId は正の整数で指定してください");
  });

  it("should return error when status is missing", () => {
    const result = validateBookmarkInput({ museumId: 1 });
    expect(result.success).toBe(false);
    expect(result.error).toBe("status は WANT_TO_GO または VISITED で指定してください");
  });

  it("should return error when status is invalid", () => {
    const result = validateBookmarkInput({ museumId: 1, status: "INVALID" });
    expect(result.success).toBe(false);
    expect(result.error).toBe("status は WANT_TO_GO または VISITED で指定してください");
  });

  it("should accept VISITED status with visitedAt date", () => {
    const result = validateBookmarkInput({
      museumId: 1,
      status: "VISITED",
      visitedAt: "2025-03-01",
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      museumId: 1,
      status: "VISITED",
      visitedAt: "2025-03-01",
    });
  });

  it("should accept VISITED status without visitedAt", () => {
    const result = validateBookmarkInput({ museumId: 1, status: "VISITED" });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ museumId: 1, status: "VISITED", visitedAt: undefined });
  });

  it("should return error when visitedAt is not a valid date string", () => {
    const result = validateBookmarkInput({
      museumId: 1,
      status: "VISITED",
      visitedAt: "not-a-date",
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe("visitedAt は YYYY-MM-DD 形式で指定してください");
  });

  it("should ignore visitedAt when status is WANT_TO_GO", () => {
    const result = validateBookmarkInput({
      museumId: 1,
      status: "WANT_TO_GO",
      visitedAt: "2025-03-01",
    });
    expect(result.success).toBe(true);
    expect(result.data?.visitedAt).toBeUndefined();
  });
});
