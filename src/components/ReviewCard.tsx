import type { Review } from "@/types/api";
import { StarRating } from "./StarRating";

type Props = {
  review: Review;
};

export function ReviewCard({ review }: Props) {
  const date = new Date(review.createdAt);
  const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{review.userName}</span>
          <StarRating rating={review.rating} size="sm" />
        </div>
        <time className="text-xs text-muted-foreground" dateTime={review.createdAt}>
          {formattedDate}
        </time>
      </div>
      {review.headline && (
        <p className="mt-1 text-sm font-medium text-foreground">「{review.headline}」</p>
      )}
      {review.comment && <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>}
    </div>
  );
}
