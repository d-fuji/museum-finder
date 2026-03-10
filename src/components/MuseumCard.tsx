import Link from "next/link";
import type { MuseumSummary } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";

type Props = {
  museum: MuseumSummary;
};

const CATEGORY_LABEL: Record<string, string> = {
  CORPORATE: "企業博物館",
  CITY_HISTORY: "市の歴史館",
};

export function MuseumCard({ museum }: Props) {
  return (
    <Link href={`/museums/${museum.id}`} className="group/link block">
      <Card
        size="sm"
        className="transition-[box-shadow,ring-color] duration-200 group-hover/link:ring-foreground/25 group-hover/link:shadow-sm"
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{CATEGORY_LABEL[museum.category] ?? museum.category}</Badge>
            <div className="flex items-center gap-1">
              <StarRating rating={museum.averageRating} size="sm" />
              <span className="text-xs text-muted-foreground">({museum.reviewCount})</span>
            </div>
          </div>
          <CardTitle className="text-lg font-bold">{museum.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {museum.address && <p className="text-sm text-muted-foreground">{museum.address}</p>}
          {museum.description && (
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground sm:line-clamp-2">
              {museum.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
