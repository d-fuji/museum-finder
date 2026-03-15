import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calculateAverageRating, CATEGORY_LABEL } from "@/lib/museum-utils";
import type { Category } from "@/types/api";
import MuseumDetailClient from "./MuseumDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

async function getMuseum(id: number) {
  return prisma.museum.findUnique({
    where: { id },
    include: { reviews: true, tags: true, operatingHours: true },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const museumId = Number(id);
  if (Number.isNaN(museumId)) return {};

  const museum = await getMuseum(museumId);
  if (!museum) return {};

  const categoryLabel = CATEGORY_LABEL[museum.category as Category] ?? museum.category;
  const description = museum.description
    ? museum.description.slice(0, 120)
    : `${categoryLabel}「${museum.name}」のレビュー・口コミ・見どころ`;

  const title = `${museum.name} | ${categoryLabel} | Museum Finder`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: `/api/og?museumId=${museum.id}`,
          width: 1200,
          height: 630,
          alt: museum.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?museumId=${museum.id}`],
    },
  };
}

const SCHEMA_TYPE: Record<string, string> = {
  CORPORATE_MUSEUM: "Museum",
  HISTORY_MUSEUM: "Museum",
  SCIENCE_MUSEUM: "Museum",
  INDUSTRIAL_HERITAGE: "LandmarksOrHistoricalBuildings",
  FACTORY_TOUR: "TouristAttraction",
  CASTLE: "LandmarksOrHistoricalBuildings",
};

export default async function MuseumDetailPage({ params }: Props) {
  const { id } = await params;
  const museumId = Number(id);
  if (Number.isNaN(museumId)) notFound();

  const museum = await getMuseum(museumId);
  if (!museum) notFound();

  const avgRating = calculateAverageRating(museum.reviews);
  const additionalType = SCHEMA_TYPE[museum.category] ?? "TouristAttraction";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    additionalType,
    name: museum.name,
    description: museum.description ?? undefined,
    address: museum.address
      ? { "@type": "PostalAddress", streetAddress: museum.address }
      : undefined,
    geo: {
      "@type": "GeoCoordinates",
      latitude: museum.latitude,
      longitude: museum.longitude,
    },
    url: museum.websiteUrl ?? undefined,
    ...(museum.reviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: museum.reviews.length,
            bestRating: 5,
            worstRating: 1,
          },
          review: museum.reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.userName },
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            reviewBody: r.headline ?? r.comment ?? undefined,
            datePublished: r.createdAt.toISOString().slice(0, 10),
          })),
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MuseumDetailClient />
    </>
  );
}
