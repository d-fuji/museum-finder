import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { MuseumDetail } from "@/types/api";
import MuseumDetailPage from "../[id]/page";

const museumDetail: MuseumDetail = {
  id: "detail-1",
  name: "テスト博物館詳細",
  category: "CORPORATE",
  description: "詳細ページ用の説明文です",
  latitude: 35.0,
  longitude: 135.0,
  address: "東京都中央区1-2-3",
  websiteUrl: "https://example.com",
  averageRating: 4.0,
  reviewCount: 1,
  reviews: [
    {
      id: "r1",
      rating: 4,
      comment: "素晴らしい博物館です",
      userId: "u1",
      museumId: "detail-1",
      userName: "レビュワー太郎",
      createdAt: "2025-06-15T10:30:00Z",
    },
  ],
};

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "detail-1" }),
}));

const server = setupServer(
  http.get("/api/museums/detail-1", () => {
    return HttpResponse.json(museumDetail);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("MuseumDetailPage", () => {
  it("should display museum name after loading", async () => {
    render(<MuseumDetailPage />);
    expect(await screen.findByText("テスト博物館詳細")).toBeInTheDocument();
  });

  it("should display category label", async () => {
    render(<MuseumDetailPage />);
    expect(await screen.findByText("企業博物館")).toBeInTheDocument();
  });

  it("should display address", async () => {
    render(<MuseumDetailPage />);
    await screen.findByText("テスト博物館詳細");
    expect(screen.getByText(/東京都中央区1-2-3/)).toBeInTheDocument();
  });

  it("should display description", async () => {
    render(<MuseumDetailPage />);
    await screen.findByText("テスト博物館詳細");
    expect(screen.getByText("詳細ページ用の説明文です")).toBeInTheDocument();
  });

  it("should display a link to the website", async () => {
    render(<MuseumDetailPage />);
    const link = await screen.findByText("公式サイトを見る →");
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("should display reviews", async () => {
    render(<MuseumDetailPage />);
    expect(await screen.findByText("素晴らしい博物館です")).toBeInTheDocument();
    expect(screen.getByText("レビュワー太郎")).toBeInTheDocument();
  });

  it("should display back link to list page", async () => {
    render(<MuseumDetailPage />);
    const backLink = await screen.findByText("← 一覧に戻る");
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("should show error state when museum not found", async () => {
    server.use(
      http.get("/api/museums/detail-1", () => {
        return new HttpResponse(null, { status: 404 });
      })
    );
    render(<MuseumDetailPage />);
    expect(await screen.findByText("施設が見つかりません")).toBeInTheDocument();
  });
});
