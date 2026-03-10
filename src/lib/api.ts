import type { Category, MuseumSummary, MuseumDetail } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export async function getMuseums(category?: Category): Promise<MuseumSummary[]> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  const query = params.toString();
  const res = await fetch(`${BASE_URL}/api/museums${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch museums");
  return res.json();
}

export async function getMuseumById(id: string): Promise<MuseumDetail> {
  const res = await fetch(`${BASE_URL}/api/museums/${id}`);
  if (!res.ok) throw new Error("Failed to fetch museum");
  return res.json();
}
