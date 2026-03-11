import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toMuseumSummary, toReview } from "@/lib/museum-utils";
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

  const detail: MuseumDetail = {
    ...toMuseumSummary(museum),
    reviews: museum.reviews.map(toReview),
  };

  return NextResponse.json(detail);
}
