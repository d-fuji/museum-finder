import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAverageRating } from "@/lib/museum-utils";
import type { Category, MuseumSummary } from "@/types/api";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") as Category | null;

  const museums = await prisma.museum.findMany({
    where: category ? { category } : undefined,
    include: {
      reviews: {
        select: { rating: true },
      },
    },
  });

  const summaries: MuseumSummary[] = museums.map((museum) => ({
    id: museum.id,
    name: museum.name,
    category: museum.category,
    description: museum.description ?? undefined,
    latitude: museum.latitude,
    longitude: museum.longitude,
    address: museum.address ?? undefined,
    websiteUrl: museum.websiteUrl ?? undefined,
    averageRating: calculateAverageRating(museum.reviews),
    reviewCount: museum.reviews.length,
  }));

  return NextResponse.json(summaries);
}
