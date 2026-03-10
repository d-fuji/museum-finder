export type Category = "CORPORATE" | "CITY_HISTORY";

export interface MuseumSummary {
  id: string;
  name: string;
  category: Category;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  websiteUrl?: string;
  averageRating: number;
  reviewCount: number;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  museumId: string;
  userName: string;
  createdAt: string;
}

export interface MuseumDetail extends MuseumSummary {
  reviews: Review[];
}
