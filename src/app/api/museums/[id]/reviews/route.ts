import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseIntParam } from "@/lib/params";
import { validateReviewInput } from "@/lib/review";
import { toReview } from "@/lib/museum-utils";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const parsed = parseIntParam((await params).id);
  if (!parsed.ok) return parsed.response;
  const museumId = parsed.value;

  const museum = await prisma.museum.findUnique({ where: { id: museumId } });
  if (!museum) {
    return NextResponse.json({ error: "施設が見つかりません" }, { status: 404 });
  }

  const body = await request.json();
  const validation = validateReviewInput(body);

  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const existingReview = await prisma.review.findUnique({
    where: { userId_museumId: { userId: session.user.id, museumId } },
  });

  if (existingReview) {
    return NextResponse.json({ error: "この施設には既にレビュー済みです" }, { status: 409 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  const review = await prisma.review.create({
    data: {
      rating: validation.data.rating,
      headline: validation.data.headline ?? null,
      comment: validation.data.comment ?? null,
      userId: session.user.id,
      museumId,
      userName: user?.name ?? "匿名ユーザー",
    },
  });

  return NextResponse.json(toReview(review), { status: 201 });
}
