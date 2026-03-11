import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toMuseumSummary } from "@/lib/museum-utils";
import type { Category } from "@/types/api";

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

  return NextResponse.json(museums.map(toMuseumSummary));
}
