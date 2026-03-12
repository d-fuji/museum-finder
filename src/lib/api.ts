import type {
  Bookmark,
  BookmarkStatus,
  BookmarkWithMuseum,
  Category,
  MuseumDetail,
  MuseumSummary,
} from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export async function getMuseums(category?: Category): Promise<MuseumSummary[]> {
  const url = category
    ? `${BASE_URL}/api/museums?category=${encodeURIComponent(category)}`
    : `${BASE_URL}/api/museums`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch museums");
  return res.json();
}

export async function getMuseumById(id: number | string): Promise<MuseumDetail> {
  const res = await fetch(`${BASE_URL}/api/museums/${id}`);
  if (!res.ok) throw new Error("Failed to fetch museum");
  return res.json();
}

export async function getBookmarks(status?: BookmarkStatus): Promise<BookmarkWithMuseum[]> {
  const url = status
    ? `${BASE_URL}/api/bookmarks?status=${encodeURIComponent(status)}`
    : `${BASE_URL}/api/bookmarks`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch bookmarks");
  return res.json();
}

export async function upsertBookmark(
  museumId: number,
  status: BookmarkStatus,
  visitedAt?: string
): Promise<Bookmark> {
  const res = await fetch(`${BASE_URL}/api/bookmarks`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ museumId, status, visitedAt }),
  });
  if (!res.ok) throw new Error("Failed to upsert bookmark");
  return res.json();
}

export async function getBookmarkStatus(museumId: number): Promise<Bookmark | null> {
  const res = await fetch(`${BASE_URL}/api/bookmarks?museumId=${museumId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function deleteBookmark(museumId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/bookmarks/${museumId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete bookmark");
}
