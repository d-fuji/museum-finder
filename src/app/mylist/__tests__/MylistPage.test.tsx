import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { SWRTestProvider } from "@/lib/test-utils";
import type { BookmarkWithMuseum } from "@/types/api";
import MylistPage from "../page";

let mockSearchParams = new URLSearchParams();
const mockReplace = vi.fn((url: string) => {
  const u = new URL(url, "http://localhost");
  mockSearchParams = u.searchParams;
});
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
  redirect: vi.fn(),
}));

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  mockReplace.mockClear();
  mockSearchParams = new URLSearchParams();
});
afterAll(() => server.close());

const baseMuseum = {
  id: 1,
  name: "テスト博物館",
  category: "CORPORATE_MUSEUM" as const,
  latitude: 35.0,
  longitude: 135.0,
  isClosed: false,
  tags: [],
  averageRating: 4,
  reviewCount: 1,
};

const bookmarks: BookmarkWithMuseum[] = [
  {
    id: 1,
    userId: "user-1",
    museumId: 1,
    status: "WANT_TO_GO",
    createdAt: "2025-03-01T00:00:00Z",
    updatedAt: "2025-03-01T00:00:00Z",
    museum: { ...baseMuseum, name: "行きたい博物館" },
  },
  {
    id: 2,
    userId: "user-1",
    museumId: 2,
    status: "VISITED",
    visitedAt: "2025-02-15",
    createdAt: "2025-03-01T00:00:00Z",
    updatedAt: "2025-03-01T00:00:00Z",
    museum: { ...baseMuseum, id: 2, name: "行った博物館" },
  },
];

function setupBookmarkHandler() {
  server.use(
    http.get("/api/bookmarks", ({ request }) => {
      const url = new URL(request.url);
      const status = url.searchParams.get("status");
      const filtered = status ? bookmarks.filter((b) => b.status === status) : bookmarks;
      return HttpResponse.json(filtered);
    })
  );
}

function renderMylist() {
  return render(<MylistPage />, { wrapper: SWRTestProvider });
}

describe("MylistPage", () => {
  it("should render tab buttons for '行きたい' and '行った'", () => {
    setupBookmarkHandler();
    renderMylist();
    expect(screen.getByRole("tab", { name: "行きたい" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "行った" })).toBeInTheDocument();
  });

  it("should show WANT_TO_GO bookmarks by default", async () => {
    setupBookmarkHandler();
    renderMylist();
    await waitFor(() => {
      expect(screen.getByText("行きたい博物館")).toBeInTheDocument();
    });
  });

  it("should call router.replace with tab param when switching tabs", async () => {
    setupBookmarkHandler();
    renderMylist();

    await userEvent.click(screen.getByRole("tab", { name: "行った" }));

    expect(mockReplace).toHaveBeenCalledWith("/mylist?tab=VISITED");
  });

  it("should remove tab param when switching to default tab", async () => {
    mockSearchParams = new URLSearchParams("tab=VISITED");
    setupBookmarkHandler();
    renderMylist();

    await userEvent.click(screen.getByRole("tab", { name: "行きたい" }));

    expect(mockReplace).toHaveBeenCalledWith("/mylist");
  });

  it("should show VISITED tab when tab=VISITED in URL", async () => {
    mockSearchParams = new URLSearchParams("tab=VISITED");
    setupBookmarkHandler();
    renderMylist();

    const visitedTab = screen.getByRole("tab", { name: "行った" });
    expect(visitedTab).toHaveAttribute("aria-selected", "true");

    await waitFor(() => {
      expect(screen.getByText("行った博物館")).toBeInTheDocument();
    });
  });

  it("should show visitedAt date on VISITED tab", async () => {
    mockSearchParams = new URLSearchParams("tab=VISITED");
    setupBookmarkHandler();
    renderMylist();

    await waitFor(() => {
      expect(screen.getByText(/2025-02-15/)).toBeInTheDocument();
    });
  });
});
