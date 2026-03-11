import Link from "next/link";
import type { MuseumSummary } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import { CATEGORY_LABEL } from "@/lib/museum-utils";

type Props = {
  museum: MuseumSummary;
};

function formatAdmissionFee(fee: number): string {
  return fee === 0 ? "無料" : `${fee}円`;
}

export function MuseumCard({ museum }: Props) {
  return (
    <Link href={`/museums/${museum.id}`} className="group/link block">
      <Card
        size="sm"
        className={`transition-[box-shadow,ring-color] duration-200 group-hover/link:ring-foreground/25 group-hover/link:shadow-sm ${museum.isClosed ? "opacity-60" : ""}`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {CATEGORY_LABEL[museum.category] ?? museum.category}
              </Badge>
              {museum.isClosed && <Badge variant="destructive">閉館中</Badge>}
            </div>
            <div className="flex items-center gap-1">
              <StarRating rating={museum.averageRating} size="sm" />
              <span className="text-xs text-muted-foreground">({museum.reviewCount})</span>
            </div>
          </div>
          <CardTitle className="text-lg font-bold">{museum.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {museum.address && <span>{museum.address}</span>}
            {museum.admissionFee != null && (
              <span className="shrink-0">{formatAdmissionFee(museum.admissionFee)}</span>
            )}
          </div>
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
