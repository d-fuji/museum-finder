import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { bookmarkRepository } from "@/lib/bookmark-repository";
import { validateBookmarkInput, VALID_STATUSES } from "@/lib/bookmark";
import { toBookmark, toBookmarkWithMuseum } from "@/lib/museum-utils";
import type { BookmarkStatus } from "@/types/api";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const museumIdParam = request.nextUrl.searchParams.get("museumId");
  if (museumIdParam) {
    const museumId = Number(museumIdParam);
    if (Number.isNaN(museumId)) {
      return NextResponse.json({ error: "無効な施設IDです" }, { status: 400 });
    }
    const bookmark = await bookmarkRepository.findOne(session.user.id, museumId);
    return NextResponse.json(bookmark ? toBookmark(bookmark) : null);
  }

  const statusParam = request.nextUrl.searchParams.get("status");
  const status =
    statusParam && VALID_STATUSES.includes(statusParam)
      ? (statusParam as BookmarkStatus)
      : undefined;

  const bookmarks = await bookmarkRepository.findByUser(session.user.id, status);
  return NextResponse.json(bookmarks.map(toBookmarkWithMuseum));
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = await request.json();
  const validation = validateBookmarkInput(body);

  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { museumId, status, visitedAt } = validation.data;

  const exists = await bookmarkRepository.museumExists(museumId);
  if (!exists) {
    return NextResponse.json({ error: "施設が見つかりません" }, { status: 404 });
  }

  const bookmark = await bookmarkRepository.upsert(session.user.id, museumId, status, visitedAt);
  return NextResponse.json(toBookmark(bookmark));
}
