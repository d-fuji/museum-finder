import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ReviewCard } from "../ReviewCard";
import type { Review } from "@/types/api";

const review: Review = {
  id: 1,
  rating: 4,
  comment: "とても良い博物館でした",
  userId: "u001",
  museumId: 1,
  userName: "テストユーザー",
  createdAt: "2025-06-15T10:30:00Z",
};

describe("ReviewCard", () => {
  it("should display the reviewer name", () => {
    render(<ReviewCard review={review} />);
    expect(screen.getByText("テストユーザー")).toBeInTheDocument();
  });

  it("should display the comment", () => {
    render(<ReviewCard review={review} />);
    expect(screen.getByText("とても良い博物館でした")).toBeInTheDocument();
  });

  it("should display formatted date", () => {
    render(<ReviewCard review={review} />);
    expect(screen.getByText("2025/06/15")).toBeInTheDocument();
  });

  it("should not render comment when absent", () => {
    const noCommentReview: Review = { ...review, comment: undefined };
    const { container } = render(<ReviewCard review={noCommentReview} />);
    // ユーザー名と日付のみ表示され、pタグ(コメント用)がないことを確認
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });
});
