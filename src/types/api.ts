export type Category =
  | "CORPORATE_MUSEUM"
  | "HISTORY_MUSEUM"
  | "SCIENCE_MUSEUM"
  | "INDUSTRIAL_HERITAGE"
  | "FACTORY_TOUR"
  | "CASTLE";

export interface Tag {
  id: number;
  name: string;
}

export interface MuseumSummary {
  id: number;
  name: string;
  category: Category;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  websiteUrl?: string;
  admissionFee?: number;
  isClosed: boolean;
  closedMessage?: string;
  tags: Tag[];
  averageRating: number;
  reviewCount: number;
}

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  userId: string;
  museumId: number;
  userName: string;
  createdAt: string;
}

export interface OperatingHours {
  id: number;
  museumId: number;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  note?: string;
}

export interface MuseumDetail extends MuseumSummary {
  reviews: Review[];
  operatingHours: OperatingHours[];
}
