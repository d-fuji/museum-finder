"use client";

import { useState } from "react";
import type { Category } from "@/types/api";
import { getMuseums } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { MuseumCard } from "@/components/MuseumCard";
import { CategoryFilter } from "@/components/CategoryFilter";

type FilterValue = Category | "ALL";

export default function HomePage() {
  const [filter, setFilter] = useState<FilterValue>("ALL");
  const category = filter === "ALL" ? undefined : filter;
  const { data: museums, loading } = useFetch(() => getMuseums(category), [filter]);

  return (
    <div>
      <section className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">博物館を探す</h1>
        <p className="text-sm text-gray-500">企業博物館・歴史館を探索しよう</p>
      </section>

      <div className="mb-4">
        <CategoryFilter value={filter} onChange={setFilter} />
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-gray-400">読み込み中...</div>
      ) : !museums || museums.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">施設が見つかりません</div>
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
