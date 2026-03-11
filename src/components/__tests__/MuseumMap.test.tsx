import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import type { MuseumSummary } from "@/types/api";
import { MuseumMap } from "../MuseumMap";

vi.mock("react-map-gl/maplibre", () => ({
  default: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  Marker: ({ onClick, children }: { onClick?: () => void; children?: React.ReactNode }) => (
    <div data-testid="marker" onClick={onClick}>
      {children}
    </div>
  ),
  Popup: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
}));

const museums: MuseumSummary[] = [
  {
    id: 1,
    name: "テスト博物館A",
    category: "CORPORATE_MUSEUM",
    latitude: 35.0,
    longitude: 135.0,
    tags: [],
    averageRating: 4.0,
    reviewCount: 2,
  },
  {
    id: 2,
    name: "テスト博物館B",
    category: "HISTORY_MUSEUM",
    latitude: 34.0,
    longitude: 134.0,
    tags: [],
    averageRating: 3.5,
    reviewCount: 1,
  },
];

describe("MuseumMap", () => {
  it("should render a map", () => {
    render(<MuseumMap museums={museums} />);
    expect(screen.getByTestId("map")).toBeInTheDocument();
  });

  it("should render a marker for each museum", () => {
    render(<MuseumMap museums={museums} />);
    const markers = screen.getAllByTestId("marker");
    expect(markers).toHaveLength(2);
  });

  it("should show popup with museum name when marker is clicked", async () => {
    const handleClick = vi.fn();
    render(<MuseumMap museums={museums} onMuseumClick={handleClick} />);
    const markers = screen.getAllByTestId("marker");
    await userEvent.click(markers[0]);

    expect(screen.getByTestId("popup")).toBeInTheDocument();
    expect(screen.getByText("テスト博物館A")).toBeInTheDocument();
  });

  it("should show rating in popup", async () => {
    render(<MuseumMap museums={museums} />);
    const markers = screen.getAllByTestId("marker");
    await userEvent.click(markers[0]);

    expect(screen.getByText("4.0")).toBeInTheDocument();
  });

  it("should call onMuseumClick when popup link is clicked", async () => {
    const handleClick = vi.fn();
    render(<MuseumMap museums={museums} onMuseumClick={handleClick} />);
    const markers = screen.getAllByTestId("marker");
    await userEvent.click(markers[0]);

    const detailLink = screen.getByRole("button", { name: "詳細を見る" });
    await userEvent.click(detailLink);
    expect(handleClick).toHaveBeenCalledWith(1);
  });

  it("should close popup when another marker is clicked", async () => {
    render(<MuseumMap museums={museums} />);
    const markers = screen.getAllByTestId("marker");

    await userEvent.click(markers[0]);
    expect(screen.getByText("テスト博物館A")).toBeInTheDocument();

    await userEvent.click(markers[1]);
    expect(screen.queryByText("テスト博物館A")).not.toBeInTheDocument();
    expect(screen.getByText("テスト博物館B")).toBeInTheDocument();
  });
});
