import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAverageRating, CATEGORY_LABEL } from "@/lib/museum-utils";
import type { Category } from "@/types/api";

export const runtime = "nodejs";

const CATEGORY_EMOJI: Record<string, string> = {
  CORPORATE_MUSEUM: "🏢",
  HISTORY_MUSEUM: "🏛️",
  SCIENCE_MUSEUM: "🔬",
  INDUSTRIAL_HERITAGE: "🏭",
  FACTORY_TOUR: "🏭",
  CASTLE: "🏯",
};

export async function GET(request: NextRequest) {
  const museumId = Number(request.nextUrl.searchParams.get("museumId"));
  if (Number.isNaN(museumId)) {
    return new Response("Invalid museumId", { status: 400 });
  }

  const museum = await prisma.museum.findUnique({
    where: { id: museumId },
    include: { reviews: { select: { rating: true } } },
  });

  if (!museum) {
    return new Response("Museum not found", { status: 404 });
  }

  const avgRating = calculateAverageRating(museum.reviews);
  const categoryLabel = CATEGORY_LABEL[museum.category as Category] ?? museum.category;
  const emoji = CATEGORY_EMOJI[museum.category] ?? "📍";
  const stars = "★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating));
  const description = museum.description ? museum.description.slice(0, 80) : "";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px 56px",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "18px",
            color: "#94a3b8",
          }}
        >
          <span
            style={{
              background: "rgba(255,255,255,0.1)",
              padding: "4px 12px",
              borderRadius: "6px",
            }}
          >
            {emoji} {categoryLabel}
          </span>
        </div>
        <div style={{ fontSize: "48px", fontWeight: "bold", lineHeight: 1.2 }}>{museum.name}</div>
        {museum.reviews.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "24px" }}>
            <span style={{ color: "#fbbf24" }}>{stars}</span>
            <span style={{ color: "#94a3b8" }}>
              {avgRating.toFixed(1)} ({museum.reviews.length}件)
            </span>
          </div>
        )}
        {description && (
          <div
            style={{
              fontSize: "20px",
              color: "#cbd5e1",
              lineHeight: 1.5,
              marginTop: "8px",
            }}
          >
            {description}
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid rgba(255,255,255,0.15)",
          paddingTop: "20px",
        }}
      >
        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#60a5fa" }}>Museum Finder</div>
        {museum.address && (
          <div style={{ fontSize: "16px", color: "#94a3b8" }}>📍 {museum.address}</div>
        )}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
