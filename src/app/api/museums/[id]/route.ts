import { NextRequest, NextResponse } from "next/server";
import museumsData from "@/data/museums.json";
import reviewsData from "@/data/reviews.json";
import type { Category, MuseumDetail } from "@/types/api";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const museum = museumsData.find((m) => m.id === id);

  if (!museum) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const reviews = reviewsData.filter((r) => r.museumId === id);
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const detail: MuseumDetail = {
    ...museum,
    category: museum.category as Category,
    averageRating: Math.round(averageRating * 10) / 10,
    reviewCount: reviews.length,
    reviews: reviews.map((r) => ({
      ...r,
      museumId: r.museumId,
    })),
  };

  return NextResponse.json(detail);
}
