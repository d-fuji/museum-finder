import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { MuseumSummary } from "@/types/api";
import HomePage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("react-map-gl/maplibre", () => ({
  default: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  Marker: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="marker">{children}</div>
  ),
}));

const museums: MuseumSummary[] = [
  {
    id: "1",
    name: "テスト企業博物館",
    category: "CORPORATE",
    latitude: 35.0,
    longitude: 135.0,
    averageRating: 4.0,
    reviewCount: 2,
  },
  {
    id: "2",
    name: "テスト歴史館",
    category: "CITY_HISTORY",
    latitude: 34.0,
    longitude: 134.0,
    averageRating: 3.5,
    reviewCount: 1,
  },
];

const server = setupServer(
  http.get("/api/museums", ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const filtered = category ? museums.filter((m) => m.category === category) : museums;
    return HttpResponse.json(filtered);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("HomePage", () => {
  it("should display page heading", async () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: "博物館を探す" })).toBeInTheDocument();
  });

  it("should display museum list after loading", async () => {
    render(<HomePage />);
    expect(await screen.findByText("テスト企業博物館")).toBeInTheDocument();
    expect(screen.getByText("テスト歴史館")).toBeInTheDocument();
  });

  it("should filter museums when category button is clicked", async () => {
    render(<HomePage />);
    await screen.findByText("テスト企業博物館");

    await userEvent.click(screen.getByRole("button", { name: "企業博物館" }));

    await waitFor(() => {
      expect(screen.getByText("テスト企業博物館")).toBeInTheDocument();
      expect(screen.queryByText("テスト歴史館")).not.toBeInTheDocument();
    });
  });

  it("should show skeleton loading state initially", () => {
    const { container } = render(<HomePage />);
    const skeletons = container.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should show map view when map toggle is clicked", async () => {
    render(<HomePage />);
    await screen.findByText("テスト企業博物館");

    await userEvent.click(screen.getByRole("button", { name: "地図表示" }));

    expect(screen.getByTestId("map")).toBeInTheDocument();
  });

  it("should switch back to list view when list toggle is clicked", async () => {
    render(<HomePage />);
    await screen.findByText("テスト企業博物館");

    await userEvent.click(screen.getByRole("button", { name: "地図表示" }));
    expect(screen.getByTestId("map")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "リスト表示" }));
    expect(screen.getByText("テスト企業博物館")).toBeInTheDocument();
    expect(screen.queryByTestId("map")).not.toBeInTheDocument();
  });
});
