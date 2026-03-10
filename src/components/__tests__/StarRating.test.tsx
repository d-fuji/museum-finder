import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StarRating } from "../StarRating";

describe("StarRating", () => {
  it("should render 5 stars when rating is 5", () => {
    render(<StarRating rating={5} />);
    const stars = screen.getByLabelText("5点");
    expect(stars).toBeInTheDocument();
    // 5つすべてが塗られた星
    const allStars = stars.querySelectorAll("span");
    const filled = Array.from(allStars).filter((s) => s.textContent === "★");
    expect(filled).toHaveLength(5);
  });

  it("should show accessible label with the rating value", () => {
    render(<StarRating rating={3.5} />);
    expect(screen.getByLabelText("3.5点")).toBeInTheDocument();
  });
});
