import type { Category, MuseumSummary, Review } from "@/types/api";

export const CATEGORY_LABEL: Record<Category, string> = {
  CORPORATE: "企業博物館",
  CITY_HISTORY: "市の歴史館",
};

export function calculateAverageRating(reviews: { rating: number }[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

type MuseumRow = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  websiteUrl: string | null;
  reviews: { rating: number }[];
};

export function toMuseumSummary(museum: MuseumRow): MuseumSummary {
  return {
    id: museum.id,
    name: museum.name,
    category: museum.category as Category,
    description: museum.description ?? undefined,
    latitude: museum.latitude,
    longitude: museum.longitude,
    address: museum.address ?? undefined,
    websiteUrl: museum.websiteUrl ?? undefined,
    averageRating: calculateAverageRating(museum.reviews),
    reviewCount: museum.reviews.length,
  };
}

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  userId: string;
  museumId: string;
  userName: string;
  createdAt: Date;
};

export function toReview(review: ReviewRow): Review {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment ?? undefined,
    userId: review.userId,
    museumId: review.museumId,
    userName: review.userName,
    createdAt: review.createdAt.toISOString(),
  };
}
