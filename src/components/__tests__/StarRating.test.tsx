import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StarRating } from "../StarRating";

describe("StarRating", () => {
  it("should render 5 star icons when rating is 5", () => {
    render(<StarRating rating={5} />);
    const container = screen.getByLabelText("5点");
    expect(container).toBeInTheDocument();
    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(5);
  });

  it("should show accessible label with the rating value", () => {
    render(<StarRating rating={3.5} />);
    expect(screen.getByLabelText("3.5点")).toBeInTheDocument();
  });
});
