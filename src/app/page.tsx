"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/types/api";
import { getMuseums } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { MuseumCard } from "@/components/MuseumCard";
import { MuseumCardSkeleton } from "@/components/MuseumCardSkeleton";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ViewToggle } from "@/components/ViewToggle";
import { MuseumMap } from "@/components/MuseumMap";
import { Skeleton } from "@/components/ui/skeleton";

type FilterValue = Category | "ALL";
type ViewMode = "list" | "map";

export default function HomePage() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterValue>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const category = filter === "ALL" ? undefined : filter;
  const { data: museums, loading } = useFetch(() => getMuseums(category), [filter]);

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

      {loading ? (
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
