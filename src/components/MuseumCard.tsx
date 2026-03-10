import Link from "next/link";
import type { MuseumSummary } from "@/types/api";
import { StarRating } from "./StarRating";

type Props = {
  museum: MuseumSummary;
};

const CATEGORY_LABEL: Record<string, string> = {
  CORPORATE: "企業博物館",
  CITY_HISTORY: "市の歴史館",
};

export function MuseumCard({ museum }: Props) {
  return (
    <Link
      href={`/museums/${museum.id}`}
      className="block rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
          {CATEGORY_LABEL[museum.category] ?? museum.category}
        </span>
        <div className="flex items-center gap-1">
          <StarRating rating={museum.averageRating} size="sm" />
          <span className="text-xs text-gray-500">({museum.reviewCount})</span>
        </div>
      </div>
      <h2 className="mt-2 text-lg font-bold text-gray-900">{museum.name}</h2>
      {museum.address && <p className="mt-1 text-sm text-gray-500">{museum.address}</p>}
      {museum.description && (
        <p className="mt-2 line-clamp-2 text-sm text-gray-600">{museum.description}</p>
      )}
    </Link>
  );
}
