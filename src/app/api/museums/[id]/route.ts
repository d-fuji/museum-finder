import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseIntParam } from "@/lib/params";
import { toMuseumSummary, toReview } from "@/lib/museum-utils";
import type { MuseumDetail } from "@/types/api";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const parsed = parseIntParam((await params).id);
  if (!parsed.ok) return parsed.response;
  const id = parsed.value;

  const museum = await prisma.museum.findUnique({
    where: { id },
    include: { reviews: true, tags: true },
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
