"use client";

import type { Category } from "@/types/api";
import { Button } from "@/components/ui/button";

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
        <Button
          key={key}
          variant={value === key ? "default" : "secondary"}
          size="sm"
          onClick={() => onChange(key)}
          aria-pressed={value === key}
        >
          {LABELS[key]}
        </Button>
      ))}
    </div>
  );
}
