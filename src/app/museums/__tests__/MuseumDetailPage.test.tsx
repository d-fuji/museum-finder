import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { MuseumDetail } from "@/types/api";
import { SWRTestProvider } from "@/lib/test-utils";
import MuseumDetailPage from "../[id]/page";

function renderDetailPage() {
  return render(<MuseumDetailPage />, { wrapper: SWRTestProvider });
}

const museumDetail: MuseumDetail = {
  id: 1,
  name: "テスト博物館詳細",
  category: "CORPORATE_MUSEUM",
  description: "詳細ページ用の説明文です",
  latitude: 35.0,
  longitude: 135.0,
  address: "東京都中央区1-2-3",
  websiteUrl: "https://example.com",
  isClosed: false,
  tags: [],
  averageRating: 4.0,
  reviewCount: 1,
  operatingHours: [],
  reviews: [
    {
      id: 1,
      rating: 4,
      comment: "素晴らしい博物館です",
      userId: "u1",
      museumId: 1,
      userName: "レビュワー太郎",
      createdAt: "2025-06-15T10:30:00Z",
    },
  ],
};

const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "1" }),
  useRouter: () => ({ back: mockBack }),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
}));

const server = setupServer(
  http.get("/api/museums/1", () => {
    return HttpResponse.json(museumDetail);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("MuseumDetailPage", () => {
  it("should display museum name after loading", async () => {
    renderDetailPage();
    expect(await screen.findByText("テスト博物館詳細")).toBeInTheDocument();
  });

  it("should display category label", async () => {
    renderDetailPage();
    expect(await screen.findByText("企業ミュージアム")).toBeInTheDocument();
  });

  it("should display address", async () => {
    renderDetailPage();
    await screen.findByText("テスト博物館詳細");
    expect(screen.getByText(/東京都中央区1-2-3/)).toBeInTheDocument();
  });

  it("should display description", async () => {
    renderDetailPage();
    await screen.findByText("テスト博物館詳細");
    expect(screen.getByText("詳細ページ用の説明文です")).toBeInTheDocument();
  });

  it("should display a link to the website", async () => {
    renderDetailPage();
    const link = await screen.findByText("公式サイトを見る");
    expect(link.closest("a")).toHaveAttribute("href", "https://example.com");
  });

  it("should display reviews", async () => {
    renderDetailPage();
    expect(await screen.findByText("素晴らしい博物館です")).toBeInTheDocument();
    expect(screen.getByText("レビュワー太郎")).toBeInTheDocument();
  });

  it("should call router.back when back button is clicked", async () => {
    renderDetailPage();
    const backButton = await screen.findByRole("button", { name: "一覧に戻る" });
    await userEvent.click(backButton);
    expect(mockBack).toHaveBeenCalled();
  });

  it("should show login link when not authenticated", async () => {
    renderDetailPage();
    await screen.findByText("テスト博物館詳細");
    expect(screen.getByRole("link", { name: "ログインしてレビューを書く" })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("should display admission fee when present", async () => {
    server.use(
      http.get("/api/museums/1", () => {
        return HttpResponse.json({ ...museumDetail, admissionFee: 500 });
      })
    );
    renderDetailPage();
    expect(await screen.findByText(/500円/)).toBeInTheDocument();
  });

  it("should display free admission", async () => {
    server.use(
      http.get("/api/museums/1", () => {
        return HttpResponse.json({ ...museumDetail, admissionFee: 0 });
      })
    );
    renderDetailPage();
    expect(await screen.findByText(/無料/)).toBeInTheDocument();
  });

  it("should display closed banner when museum is closed", async () => {
    server.use(
      http.get("/api/museums/1", () => {
        return HttpResponse.json({
          ...museumDetail,
          isClosed: true,
          closedMessage: "改装のため休館中",
        });
      })
    );
    renderDetailPage();
    expect(await screen.findByText("現在閉館中")).toBeInTheDocument();
    expect(screen.getByText("改装のため休館中")).toBeInTheDocument();
  });

  it("should hide full operating hours by default and show them on toggle click", async () => {
    server.use(
      http.get("/api/museums/1", () => {
        return HttpResponse.json({
          ...museumDetail,
          operatingHours: [
            {
              id: 1,
              museumId: 1,
              dayOfWeek: 1,
              openTime: "10:00",
              closeTime: "17:00",
              isClosed: true,
            },
            {
              id: 2,
              museumId: 1,
              dayOfWeek: 2,
              openTime: "10:00",
              closeTime: "17:00",
              isClosed: false,
              note: "最終入館16:30",
            },
          ],
        });
      })
    );
    renderDetailPage();
    await screen.findByText("テスト博物館詳細");

    // Full table is hidden by default
    expect(screen.queryByText("休館")).not.toBeInTheDocument();

    // Click toggle to expand
    await userEvent.click(screen.getByRole("button", { name: /営業時間/ }));
    expect(screen.getByText("休館")).toBeInTheDocument();
    expect(screen.getByText("10:00 - 17:00")).toBeInTheDocument();
  });

  it("should display visit info section with admission fee and hours", async () => {
    server.use(
      http.get("/api/museums/1", () => {
        return HttpResponse.json({
          ...museumDetail,
          admissionFee: 500,
          operatingHours: [
            {
              id: 1,
              museumId: 1,
              dayOfWeek: 2,
              openTime: "09:00",
              closeTime: "17:00",
              isClosed: false,
            },
          ],
        });
      })
    );
    renderDetailPage();
    expect(await screen.findByText("訪問情報")).toBeInTheDocument();
    expect(screen.getByText(/500円/)).toBeInTheDocument();
  });

  it("should show error state when museum not found", async () => {
    server.use(
      http.get("/api/museums/1", () => {
        return new HttpResponse(null, { status: 404 });
      })
    );
    renderDetailPage();
    expect(await screen.findByText("施設が見つかりません")).toBeInTheDocument();
  });
});
