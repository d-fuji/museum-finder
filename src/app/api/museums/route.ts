import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

  const summaries: MuseumSummary[] = museums.map((museum) => {
    const reviewCount = museum.reviews.length;
    const averageRating =
      reviewCount > 0
        ? Math.round((museum.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
        : 0;

    return {
      id: museum.id,
      name: museum.name,
      category: museum.category,
      description: museum.description ?? undefined,
      latitude: museum.latitude,
      longitude: museum.longitude,
      address: museum.address ?? undefined,
      websiteUrl: museum.websiteUrl ?? undefined,
      averageRating,
      reviewCount,
    };
  });

  return NextResponse.json(summaries);
}
