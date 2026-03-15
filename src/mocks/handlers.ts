import { http, HttpResponse } from "msw";
import museumsData from "@/data/museums";
import reviewsData from "@/data/reviews.json";
import tagsData from "@/data/tags.json";
import { calculateAverageRating } from "@/lib/museum-utils";
import type {
  Bookmark,
  BookmarkStatus,
  BookmarkWithMuseum,
  Category,
  MuseumDetail,
  MuseumSummary,
  OperatingHours,
  Review,
  Tag,
} from "@/types/api";

// Build lookup data with auto-incremented IDs
const tags: Tag[] = tagsData.map((t, i) => ({ id: i + 1, name: t.name }));
const tagsByName = new Map(tags.map((t) => [t.name, t]));

const museums = museumsData.map((m, i) => ({
  ...m,
  id: i + 1,
  tags: m.tags.flatMap((name) => tagsByName.get(name) ?? []),
}));
const museumsById = new Map(museums.map((m) => [m.id, m]));

const museumIdByName = new Map(museums.map((m) => [m.name, m.id]));
const reviews: Review[] = reviewsData.map((r, i) => ({
  id: i + 1,
  rating: r.rating,
  headline: undefined,
  comment: r.comment,
  userId: r.userId,
  museumId: museumIdByName.get(r.museumName) ?? 0,
  userName: r.userName,
  createdAt: r.createdAt,
}));

function toSummary(museum: (typeof museums)[number]): MuseumSummary {
  const museumReviews = reviews.filter((r) => r.museumId === museum.id);
  return {
    id: museum.id,
    name: museum.name,
    category: museum.category as Category,
    description: museum.description ?? undefined,
    latitude: museum.latitude,
    longitude: museum.longitude,
    address: museum.address ?? undefined,
    websiteUrl: museum.websiteUrl ?? undefined,
    admissionFee: museum.admissionFee ?? undefined,
    isClosed: museum.isClosed,
    closedMessage: undefined,
    tags: museum.tags,
    averageRating: calculateAverageRating(museumReviews),
    reviewCount: museumReviews.length,
  };
}

function buildOperatingHours(
  museumId: number,
  hours: (typeof museumsData)[number]["operatingHours"]
): OperatingHours[] {
  return hours.map((h, i) => ({
    id: i + 1,
    museumId,
    dayOfWeek: h.dayOfWeek,
    openTime: h.openTime,
    closeTime: h.closeTime,
    isClosed: h.isClosed,
    note: "note" in h ? (h.note as string) : undefined,
  }));
}

// In-memory bookmark store for MSW
let bookmarks: Bookmark[] = [];
let bookmarkIdSeq = 1;

export function resetBookmarks() {
  bookmarks = [];
  bookmarkIdSeq = 1;
}

export const handlers = [
  http.get("/api/museums", ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get("category") as Category | null;

    const filtered = category ? museums.filter((m) => m.category === category) : museums;
    return HttpResponse.json(filtered.map(toSummary));
  }),

  http.get("/api/museums/:id", ({ params }) => {
    const museum = museumsById.get(Number(params.id));
    if (!museum) return new HttpResponse(null, { status: 404 });

    const detail: MuseumDetail = {
      ...toSummary(museum),
      reviews: reviews.filter((r) => r.museumId === museum.id),
      operatingHours: buildOperatingHours(museum.id, museum.operatingHours),
    };
    return HttpResponse.json(detail);
  }),

  http.get("/api/tags", () => {
    return HttpResponse.json(tags);
  }),

  // Bookmark handlers
  http.get("/api/bookmarks", ({ request }) => {
    const url = new URL(request.url);
    const userId = "mock-user-id";

    // museumId 指定時は単一ブックマーク（Bookmark | null）を返す
    const museumIdParam = url.searchParams.get("museumId");
    if (museumIdParam) {
      const bookmark = bookmarks.find(
        (b) => b.userId === userId && b.museumId === Number(museumIdParam)
      );
      return HttpResponse.json(bookmark ?? null);
    }

    const statusParam = url.searchParams.get("status") as BookmarkStatus | null;
    const filtered = bookmarks.filter(
      (b) => b.userId === userId && (!statusParam || b.status === statusParam)
    );
    const result: BookmarkWithMuseum[] = filtered.map((b) => {
      const museum = museumsById.get(b.museumId);
      if (!museum) return { ...b, museum: toSummary(museums[0]) };
      return { ...b, museum: toSummary(museum) };
    });
    return HttpResponse.json(result);
  }),

  http.put("/api/bookmarks", async ({ request }) => {
    const body = (await request.json()) as {
      museumId: number;
      status: BookmarkStatus;
      visitedAt?: string;
    };
    const userId = "mock-user-id";
    const now = new Date().toISOString();

    const existing = bookmarks.find((b) => b.userId === userId && b.museumId === body.museumId);
    if (existing) {
      existing.status = body.status;
      existing.visitedAt = body.visitedAt;
      existing.updatedAt = now;
      return HttpResponse.json(existing);
    }

    const bookmark: Bookmark = {
      id: bookmarkIdSeq++,
      userId,
      museumId: body.museumId,
      status: body.status,
      visitedAt: body.visitedAt,
      createdAt: now,
      updatedAt: now,
    };
    bookmarks.push(bookmark);
    return HttpResponse.json(bookmark);
  }),

  http.delete("/api/bookmarks/:museumId", ({ params }) => {
    const museumId = Number(params.museumId);
    const userId = "mock-user-id";

    const idx = bookmarks.findIndex((b) => b.userId === userId && b.museumId === museumId);
    if (idx === -1) return new HttpResponse(null, { status: 404 });

    bookmarks.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
