"use client";

import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import type { Category, MuseumSummary } from "@/types/api";
import { getMuseums } from "@/lib/api";
import { MuseumCard } from "@/components/MuseumCard";
import { MuseumCardSkeleton } from "@/components/MuseumCardSkeleton";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ViewToggle } from "@/components/ViewToggle";
import { MuseumMap } from "@/components/MuseumMap";
import { Skeleton } from "@/components/ui/skeleton";

type FilterValue = Category | "ALL";
type ViewMode = "list" | "map";

function isViewMode(value: string | null): value is ViewMode {
  return value === "list" || value === "map";
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const viewMode: ViewMode = isViewMode(searchParams.get("view"))
    ? (searchParams.get("view")! as ViewMode)
    : "list";
  const filter: FilterValue = (searchParams.get("category") as FilterValue) || "ALL";
  const category = filter === "ALL" ? undefined : filter;
  const swrKey = category ? `/api/museums?category=${category}` : "/api/museums";
  const { data: museums, isLoading } = useSWR<MuseumSummary[]>(swrKey, () => getMuseums(category));

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    },
    [searchParams, router]
  );

  const setViewMode = useCallback(
    (mode: ViewMode) => {
      updateParams({ view: mode === "list" ? null : mode });
    },
    [updateParams]
  );

  const setFilter = useCallback(
    (value: FilterValue) => {
      updateParams({ category: value === "ALL" ? null : value });
    },
    [updateParams]
  );

  return (
    <div>
      <section className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-foreground">博物館を探す</h1>
        <p className="text-sm text-muted-foreground">企業博物館・歴史館を探索しよう</p>
      </section>

      <div className="mb-4 flex items-center justify-between">
        <CategoryFilter value={filter} onChange={setFilter} />
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {isLoading && !museums ? (
        viewMode === "map" ? (
          <Skeleton className="h-[70vh] w-full rounded-lg" />
        ) : (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <MuseumCardSkeleton key={i} />
            ))}
          </div>
        )
      ) : !museums || museums.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">施設が見つかりません</p>
        </div>
      ) : viewMode === "map" ? (
        <div className="h-[70vh] overflow-hidden rounded-lg border border-border">
          <MuseumMap museums={museums} onMuseumClick={(id) => router.push(`/museums/${id}`)} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {museums.map((museum) => (
            <MuseumCard key={museum.id} museum={museum} />
          ))}
        </div>
      )}
    </div>
  );
}

function HomeFallback() {
  return (
    <div>
      <section className="mb-6">
        <Skeleton className="mb-1 h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </section>
      <div className="mb-4">
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <MuseumCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}
