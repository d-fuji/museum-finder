"use client";

import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { getBookmarks } from "@/lib/api";
import { MuseumCard } from "@/components/MuseumCard";
import { VALID_STATUSES } from "@/lib/bookmark";
import type { BookmarkStatus, BookmarkWithMuseum } from "@/types/api";

const TABS: { status: BookmarkStatus; label: string }[] = [
  { status: "WANT_TO_GO", label: "行きたい" },
  { status: "VISITED", label: "行った" },
];

const DEFAULT_TAB: BookmarkStatus = "WANT_TO_GO";

function parseTab(param: string | null): BookmarkStatus {
  if (param && VALID_STATUSES.includes(param)) return param as BookmarkStatus;
  return DEFAULT_TAB;
}

export default function MylistPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = parseTab(searchParams.get("tab"));

  function setActiveTab(status: BookmarkStatus) {
    const params = new URLSearchParams(searchParams);
    if (status === DEFAULT_TAB) {
      params.delete("tab");
    } else {
      params.set("tab", status);
    }
    const query = params.toString();
    router.replace(query ? `/mylist?${query}` : "/mylist");
  }

  const { data: bookmarks } = useSWR<BookmarkWithMuseum[]>(["bookmarks", activeTab], () =>
    getBookmarks(activeTab)
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">マイリスト</h1>

      <div role="tablist" className="mb-6 flex gap-2 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.status}
            role="tab"
            aria-label={tab.label}
            aria-selected={activeTab === tab.status}
            onClick={() => setActiveTab(tab.status)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.status
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {bookmarks?.map((bookmark) => (
          <div key={bookmark.id}>
            <MuseumCard museum={bookmark.museum} />
            {bookmark.status === "VISITED" && bookmark.visitedAt && (
              <p className="mt-1 text-xs text-muted-foreground">訪問日: {bookmark.visitedAt}</p>
            )}
          </div>
        ))}
        {bookmarks && bookmarks.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            {activeTab === "WANT_TO_GO"
              ? "「行きたい」に登録した施設はありません"
              : "「行った」に登録した施設はありません"}
          </p>
        )}
      </div>
    </div>
  );
}
