import type { Category } from "@/types/api";

export const CATEGORY_LABEL: Record<Category, string> = {
  CORPORATE: "企業博物館",
  CITY_HISTORY: "市の歴史館",
};

export function calculateAverageRating(reviews: { rating: number }[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
