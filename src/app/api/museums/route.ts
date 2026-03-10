import { NextRequest, NextResponse } from "next/server";
import museumsData from "@/data/museums.json";
import reviewsData from "@/data/reviews.json";
import type { Category, MuseumSummary } from "@/types/api";

function buildSummary(
  museum: (typeof museumsData)[number],
  reviews: typeof reviewsData
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

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") as Category | null;

  let museums = museumsData;
  if (category) {
    museums = museums.filter((m) => m.category === category);
  }

  const summaries = museums.map((m) => buildSummary(m, reviewsData));
  return NextResponse.json(summaries);
}
