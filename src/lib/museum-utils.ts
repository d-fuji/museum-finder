import type {
  Bookmark,
  BookmarkStatus,
  BookmarkWithMuseum,
  Category,
  MuseumSummary,
  OperatingHours,
  Review,
  Tag,
} from "@/types/api";

export const CATEGORY_LABEL: Record<Category, string> = {
  CORPORATE_MUSEUM: "企業ミュージアム",
  HISTORY_MUSEUM: "歴史・郷土資料館",
  SCIENCE_MUSEUM: "科学・技術館",
  INDUSTRIAL_HERITAGE: "産業遺産",
  FACTORY_TOUR: "工場見学",
  CASTLE: "城・城郭",
};

export function calculateAverageRating(reviews: { rating: number }[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

type MuseumRow = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  websiteUrl: string | null;
  admissionFee: number | null;
  isClosed: boolean;
  closedMessage: string | null;
  reviews: { rating: number }[];
  tags: { id: number; name: string }[];
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
    admissionFee: museum.admissionFee ?? undefined,
    isClosed: museum.isClosed,
    closedMessage: museum.closedMessage ?? undefined,
    tags: museum.tags.map((t): Tag => ({ id: t.id, name: t.name })),
    averageRating: calculateAverageRating(museum.reviews),
    reviewCount: museum.reviews.length,
  };
}

type OperatingHoursRow = {
  id: number;
  museumId: number;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  note: string | null;
};

export function toOperatingHours(row: OperatingHoursRow): OperatingHours {
  return {
    id: row.id,
    museumId: row.museumId,
    dayOfWeek: row.dayOfWeek,
    openTime: row.openTime,
    closeTime: row.closeTime,
    isClosed: row.isClosed,
    note: row.note ?? undefined,
  };
}

type ReviewRow = {
  id: number;
  rating: number;
  headline: string | null;
  comment: string | null;
  userId: string;
  museumId: number;
  userName: string;
  createdAt: Date;
};

export function toReview(review: ReviewRow): Review {
  return {
    id: review.id,
    rating: review.rating,
    headline: review.headline ?? undefined,
    comment: review.comment ?? undefined,
    userId: review.userId,
    museumId: review.museumId,
    userName: review.userName,
    createdAt: review.createdAt.toISOString(),
  };
}

type BookmarkRow = {
  id: number;
  userId: string;
  museumId: number;
  status: BookmarkStatus;
  visitedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function toBookmark(row: BookmarkRow): Bookmark {
  return {
    id: row.id,
    userId: row.userId,
    museumId: row.museumId,
    status: row.status,
    visitedAt: row.visitedAt ? formatDateOnly(row.visitedAt) : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

type BookmarkWithMuseumRow = BookmarkRow & {
  museum: MuseumRow;
};

export function toBookmarkWithMuseum(row: BookmarkWithMuseumRow): BookmarkWithMuseum {
  return {
    ...toBookmark(row),
    museum: toMuseumSummary(row.museum),
  };
}
