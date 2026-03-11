import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CategoryFilter } from "../CategoryFilter";

describe("CategoryFilter", () => {
  it("should render all filter buttons", () => {
    render(<CategoryFilter value="ALL" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "すべて" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "企業ミュージアム" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "歴史・郷土資料館" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "科学・技術館" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "産業遺産" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "工場見学" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "城・城郭" })).toBeInTheDocument();
  });

  it("should mark the active filter as pressed", () => {
    render(<CategoryFilter value="CORPORATE_MUSEUM" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "企業ミュージアム" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "すべて" })).toHaveAttribute("aria-pressed", "false");
  });

  it("should call onChange when a filter button is clicked", async () => {
    const onChange = vi.fn();
    render(<CategoryFilter value="ALL" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "企業ミュージアム" }));
    expect(onChange).toHaveBeenCalledWith("CORPORATE_MUSEUM");
  });
});
