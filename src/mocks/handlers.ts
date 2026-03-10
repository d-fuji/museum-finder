import { http, HttpResponse } from "msw";
import museumsData from "@/data/museums.json";
import reviewsData from "@/data/reviews.json";
import type { Category, MuseumSummary, MuseumDetail, Review } from "@/types/api";

function buildMuseumSummary(
  museum: (typeof museumsData)[number],
  reviews: Review[]
): MuseumSummary {
  const museumReviews = reviews.filter((r) => r.museumId === museum.id);
  const averageRating =
    museumReviews.length > 0
      ? museumReviews.reduce((sum, r) => sum + r.rating, 0) / museumReviews.length
      : 0;
  return {
    ...museum,
    category: museum.category as Category,
    averageRating: Math.round(averageRating * 10) / 10,
    reviewCount: museumReviews.length,
  };
}

export const handlers = [
  http.get("/api/museums", ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get("category") as Category | null;
    const reviews = reviewsData as Review[];

    let museums = museumsData;
    if (category) {
      museums = museums.filter((m) => m.category === category);
    }

    const summaries = museums.map((m) => buildMuseumSummary(m, reviews));
    return HttpResponse.json(summaries);
  }),

  http.get("/api/museums/:id", ({ params }) => {
    const { id } = params;
    const museum = museumsData.find((m) => m.id === id);
    if (!museum) {
      return new HttpResponse(null, { status: 404 });
    }

    const reviews = (reviewsData as Review[]).filter((r) => r.museumId === id);
    const summary = buildMuseumSummary(museum, reviews);
    const detail: MuseumDetail = { ...summary, reviews };
    return HttpResponse.json(detail);
  }),
];
