"use client";

import type { Category } from "@/types/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_LABEL } from "@/lib/museum-utils";

type FilterValue = Category | "ALL";

type Props = {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
};

const LABELS: Record<FilterValue, string> = {
  ALL: "すべて",
  ...CATEGORY_LABEL,
};

export function CategoryFilter({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as FilterValue)}>
      <SelectTrigger aria-label="カテゴリフィルター" size="sm">
        <SelectValue placeholder="カテゴリを選択">{LABELS[value]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(Object.entries(LABELS) as [FilterValue, string][]).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
