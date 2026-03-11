import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { MuseumDetail } from "@/types/api";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const museum = await prisma.museum.findUnique({
    where: { id },
    include: { reviews: true },
  });

  if (!museum) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const reviewCount = museum.reviews.length;
  const averageRating =
    reviewCount > 0
      ? Math.round((museum.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
      : 0;

  const detail: MuseumDetail = {
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
    reviews: museum.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment ?? undefined,
      userId: r.userId,
      museumId: r.museumId,
      userName: r.userName,
      createdAt: r.createdAt.toISOString(),
    })),
  };

  return NextResponse.json(detail);
}
