"use client";

import type { Category } from "@/types/api";

type FilterValue = Category | "ALL";

type Props = {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
};

const LABELS: Record<FilterValue, string> = {
  ALL: "すべて",
  CORPORATE: "企業博物館",
  CITY_HISTORY: "市の歴史館",
};

export function CategoryFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-2" role="group" aria-label="カテゴリフィルター">
      {(Object.keys(LABELS) as FilterValue[]).map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            value === key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          aria-pressed={value === key}
        >
          {LABELS[key]}
        </button>
      ))}
    </div>
  );
}
