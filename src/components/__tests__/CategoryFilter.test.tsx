import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CategoryFilter } from "../CategoryFilter";

describe("CategoryFilter", () => {
  it("should render all filter buttons", () => {
    render(<CategoryFilter value="ALL" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "すべて" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "企業博物館" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "市の歴史館" })).toBeInTheDocument();
  });

  it("should mark the active filter as pressed", () => {
    render(<CategoryFilter value="CORPORATE" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "企業博物館" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "すべて" })).toHaveAttribute("aria-pressed", "false");
  });

  it("should call onChange when a filter button is clicked", async () => {
    const onChange = vi.fn();
    render(<CategoryFilter value="ALL" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "企業博物館" }));
    expect(onChange).toHaveBeenCalledWith("CORPORATE");
  });
});
