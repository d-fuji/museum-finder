import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CategoryFilter } from "../CategoryFilter";

describe("CategoryFilter", () => {
  it("should render a select trigger showing the current value", () => {
    render(<CategoryFilter value="ALL" onChange={vi.fn()} />);
    const trigger = screen.getByRole("combobox", { name: "カテゴリフィルター" });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("すべて");
  });

  it("should display the selected category label", () => {
    render(<CategoryFilter value="CORPORATE_MUSEUM" onChange={vi.fn()} />);
    const trigger = screen.getByRole("combobox", { name: "カテゴリフィルター" });
    expect(trigger).toHaveTextContent("企業ミュージアム");
  });

  it("should call onChange when an option is selected", async () => {
    const onChange = vi.fn();
    render(<CategoryFilter value="ALL" onChange={onChange} />);
    await userEvent.click(screen.getByRole("combobox", { name: "カテゴリフィルター" }));
    await userEvent.click(await screen.findByRole("option", { name: "企業ミュージアム" }));
    expect(onChange).toHaveBeenCalledWith("CORPORATE_MUSEUM");
  });
});
