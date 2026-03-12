import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { bookmarkRepository } from "@/lib/bookmark-repository";
import { parseIntParam } from "@/lib/params";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ museumId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const parsed = parseIntParam((await params).museumId);
  if (!parsed.ok) return parsed.response;
  const museumId = parsed.value;

  const bookmark = await bookmarkRepository.findOne(session.user.id, museumId);
  if (!bookmark) {
    return NextResponse.json({ error: "ブックマークが見つかりません" }, { status: 404 });
  }

  await bookmarkRepository.delete(session.user.id, museumId);
  return new NextResponse(null, { status: 204 });
}
