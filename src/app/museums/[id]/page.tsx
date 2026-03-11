"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, AlertTriangle } from "lucide-react";
import type { OperatingHours } from "@/types/api";
import useSWR from "swr";
import type { MuseumDetail } from "@/types/api";
import { getMuseumById } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/StarRating";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewForm } from "@/components/ReviewForm";
import { CATEGORY_LABEL } from "@/lib/museum-utils";

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function formatAdmissionFee(fee: number): string {
  return fee === 0 ? "無料" : `${fee}円`;
}

function OperatingHoursTable({ hours }: { hours: OperatingHours[] }) {
  if (hours.length === 0) return null;

  const sorted = [...hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <div className="mt-3">
      <h3 className="mb-2 text-sm font-semibold">営業時間</h3>
      <div className="space-y-1 text-sm">
        {sorted.map((h) => (
          <div key={h.dayOfWeek} className="flex gap-2">
            <span className="w-6 font-medium">{DAY_LABELS[h.dayOfWeek]}</span>
            {h.isClosed ? (
              <span className="text-muted-foreground">休館</span>
            ) : (
              <span>
                {h.openTime} - {h.closeTime}
                {h.note && <span className="ml-2 text-muted-foreground">({h.note})</span>}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div>
      <Skeleton className="mb-4 h-4 w-24" />
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewSection({
  museum,
  onReviewPosted,
}: {
  museum: MuseumDetail;
  onReviewPosted: () => void;
}) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const hasReviewed = userId ? museum.reviews.some((r) => r.userId === userId) : false;

  return (
    <div className="mt-4">
      {status === "loading" ? null : !session ? (
        <Link href="/login" className="text-sm text-primary underline underline-offset-4">
          ログインしてレビューを書く
        </Link>
      ) : hasReviewed ? (
        <p className="text-sm text-muted-foreground">レビュー済みです</p>
      ) : (
        <ReviewForm museumId={museum.id} onSuccess={onReviewPosted} />
      )}
    </div>
  );
}

export default function MuseumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    data: museum,
    isLoading,
    error,
    mutate,
  } = useSWR<MuseumDetail>(`/api/museums/${id}`, () => getMuseumById(id));

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !museum) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-muted-foreground">施設が見つかりません</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft />
          一覧に戻る
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.back()}>
        <ArrowLeft />
        一覧に戻る
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            {CATEGORY_LABEL[museum.category] ?? museum.category}
          </Badge>
          <CardTitle>
            <h1 className="text-2xl font-bold">{museum.name}</h1>
          </CardTitle>
          <div className="mt-1 flex items-center gap-2">
            <StarRating rating={museum.averageRating} />
            <span className="text-sm text-muted-foreground">
              {museum.averageRating.toFixed(1)} ({museum.reviewCount}件のレビュー)
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {museum.isClosed && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <div>
                <span className="font-semibold">現在閉館中</span>
                {museum.closedMessage && <p className="mt-1">{museum.closedMessage}</p>}
              </div>
            </div>
          )}
          {museum.address && <p className="text-sm text-muted-foreground">📍 {museum.address}</p>}
          {museum.admissionFee != null && (
            <p className="text-sm text-muted-foreground">
              🎫 {formatAdmissionFee(museum.admissionFee)}
            </p>
          )}
          {museum.description && <p className="text-foreground">{museum.description}</p>}
          {museum.websiteUrl && (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<a href={museum.websiteUrl} target="_blank" rel="noopener noreferrer" />}
            >
              <ExternalLink />
              公式サイトを見る
            </Button>
          )}
          <OperatingHoursTable hours={museum.operatingHours} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-lg font-bold">レビュー ({museum.reviews.length})</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {museum.reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">まだレビューがありません</p>
          ) : (
            <div>
              {museum.reviews.map((review, i) => (
                <div key={review.id}>
                  <ReviewCard review={review} />
                  {i < museum.reviews.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}

          <ReviewSection museum={museum} onReviewPosted={() => mutate()} />
        </CardContent>
      </Card>
    </div>
  );
}
