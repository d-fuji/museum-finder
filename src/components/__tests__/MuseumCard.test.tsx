import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MuseumCard } from "../MuseumCard";
import type { MuseumSummary } from "@/types/api";

const museum: MuseumSummary = {
  id: 1,
  name: "テスト博物館",
  category: "CORPORATE_MUSEUM",
  description: "テスト用の説明文です",
  latitude: 35.0,
  longitude: 135.0,
  address: "東京都千代田区1-1-1",
  isClosed: false,
  tags: [],
  averageRating: 4.5,
  reviewCount: 3,
};

describe("MuseumCard", () => {
  it("should render museum name as a link to detail page", () => {
    render(<MuseumCard museum={museum} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/museums/1");
    expect(screen.getByText("テスト博物館")).toBeInTheDocument();
  });

  it("should display category label in Japanese", () => {
    render(<MuseumCard museum={museum} />);
    expect(screen.getByText("企業ミュージアム")).toBeInTheDocument();
  });

  it("should display address when provided", () => {
    render(<MuseumCard museum={museum} />);
    expect(screen.getByText("東京都千代田区1-1-1")).toBeInTheDocument();
  });

  it("should display description when provided", () => {
    render(<MuseumCard museum={museum} />);
    expect(screen.getByText("テスト用の説明文です")).toBeInTheDocument();
  });

  it("should display review count", () => {
    render(<MuseumCard museum={museum} />);
    expect(screen.getByText("(3)")).toBeInTheDocument();
  });

  it("should display admission fee when present", () => {
    render(<MuseumCard museum={{ ...museum, admissionFee: 500 }} />);
    expect(screen.getByText("500円")).toBeInTheDocument();
  });

  it("should display free admission when fee is 0", () => {
    render(<MuseumCard museum={{ ...museum, admissionFee: 0 }} />);
    expect(screen.getByText("無料")).toBeInTheDocument();
  });

  it("should not display admission fee when not set", () => {
    render(<MuseumCard museum={museum} />);
    expect(screen.queryByText(/円/)).not.toBeInTheDocument();
    expect(screen.queryByText("無料")).not.toBeInTheDocument();
  });

  it("should display closed badge when museum is closed", () => {
    render(<MuseumCard museum={{ ...museum, isClosed: true }} />);
    expect(screen.getByText("閉館中")).toBeInTheDocument();
  });

  it("should apply muted styling when museum is closed", () => {
    const { container } = render(<MuseumCard museum={{ ...museum, isClosed: true }} />);
    const card = container.querySelector("[data-slot='card']");
    expect(card?.className).toMatch(/opacity/);
  });
});
