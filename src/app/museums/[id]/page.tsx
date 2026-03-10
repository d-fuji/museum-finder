"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getMuseumById } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { StarRating } from "@/components/StarRating";
import { ReviewCard } from "@/components/ReviewCard";

const CATEGORY_LABEL: Record<string, string> = {
  CORPORATE: "企業博物館",
  CITY_HISTORY: "市の歴史館",
};

export default function MuseumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: museum, loading, error } = useFetch(() => getMuseumById(id), [id]);

  if (loading) {
    return <div className="py-12 text-center text-sm text-gray-400">読み込み中...</div>;
  }

  if (error || !museum) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-gray-400">施設が見つかりません</p>
        <Link href="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
        ← 一覧に戻る
      </Link>

      <section className="mb-6">
        <span className="mb-2 inline-block rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
          {CATEGORY_LABEL[museum.category] ?? museum.category}
        </span>
        <h1 className="text-2xl font-bold text-gray-900">{museum.name}</h1>

        <div className="mt-2 flex items-center gap-2">
          <StarRating rating={museum.averageRating} />
          <span className="text-sm text-gray-500">
            {museum.averageRating.toFixed(1)} ({museum.reviewCount}件のレビュー)
          </span>
        </div>

        {museum.address && <p className="mt-3 text-sm text-gray-600">📍 {museum.address}</p>}

        {museum.description && <p className="mt-3 text-gray-700">{museum.description}</p>}

        {museum.websiteUrl && (
          <a
            href={museum.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-blue-600 hover:underline"
          >
            公式サイトを見る →
          </a>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-gray-900">レビュー ({museum.reviews.length})</h2>
        {museum.reviews.length === 0 ? (
          <p className="text-sm text-gray-400">まだレビューがありません</p>
        ) : (
          <div>
            {museum.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
