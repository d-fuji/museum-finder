import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { MuseumSummary } from "@/types/api";
import { SWRTestProvider } from "@/lib/test-utils";
import HomePage from "../page";

function renderHomePage() {
  return render(<HomePage />, { wrapper: SWRTestProvider });
}

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
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
    id: 1,
    name: "テスト企業博物館",
    category: "CORPORATE_MUSEUM",
    latitude: 35.0,
    longitude: 135.0,
    isClosed: false,
    tags: [],
    averageRating: 4.0,
    reviewCount: 2,
  },
  {
    id: 2,
    name: "テスト歴史館",
    category: "HISTORY_MUSEUM",
    latitude: 34.0,
    longitude: 134.0,
    isClosed: false,
    tags: [],
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
afterEach(() => {
  server.resetHandlers();
  mockSearchParams = new URLSearchParams();
  mockPush.mockClear();
  mockReplace.mockClear();
});
afterAll(() => server.close());

describe("HomePage", () => {
  it("should display page heading", async () => {
    renderHomePage();
    expect(screen.getByRole("heading", { name: "博物館を探す" })).toBeInTheDocument();
  });

  it("should display museum list after loading", async () => {
    renderHomePage();
    expect(await screen.findByText("テスト企業博物館")).toBeInTheDocument();
    expect(screen.getByText("テスト歴史館")).toBeInTheDocument();
  });

  it("should update URL when category is selected", async () => {
    renderHomePage();
    await screen.findByText("テスト企業博物館");

    await userEvent.click(screen.getByRole("combobox", { name: "カテゴリフィルター" }));
    await userEvent.click(await screen.findByRole("option", { name: "企業ミュージアム" }));

    expect(mockReplace).toHaveBeenCalledWith("/?category=CORPORATE_MUSEUM", { scroll: false });
  });

  it("should filter museums based on category search param", async () => {
    mockSearchParams = new URLSearchParams("category=CORPORATE_MUSEUM");
    renderHomePage();

    await screen.findByText("テスト企業博物館");
    expect(screen.queryByText("テスト歴史館")).not.toBeInTheDocument();
  });

  it("should show skeleton loading state initially", () => {
    const { container } = renderHomePage();
    const skeletons = container.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should update URL when map toggle is clicked", async () => {
    renderHomePage();
    await screen.findByText("テスト企業博物館");

    await userEvent.click(screen.getByRole("button", { name: "地図表示" }));

    expect(mockReplace).toHaveBeenCalledWith("/?view=map", { scroll: false });
  });

  it("should update URL when list toggle is clicked", async () => {
    mockSearchParams = new URLSearchParams("view=map");
    renderHomePage();

    await userEvent.click(screen.getByRole("button", { name: "リスト表示" }));

    expect(mockReplace).toHaveBeenCalledWith("/", { scroll: false });
  });

  it("should restore map view from URL search params", async () => {
    mockSearchParams = new URLSearchParams("view=map");
    renderHomePage();
    await screen.findByTestId("map");
    expect(screen.getByTestId("map")).toBeInTheDocument();
  });
});
