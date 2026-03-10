import type { Review } from "@/types/api";
import { StarRating } from "./StarRating";

type Props = {
  review: Review;
};

export function ReviewCard({ review }: Props) {
  const date = new Date(review.createdAt);
  const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;

  return (
    <div className="border-b border-gray-100 py-4 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">{review.userName}</span>
          <StarRating rating={review.rating} size="sm" />
        </div>
        <time className="text-xs text-gray-400" dateTime={review.createdAt}>
          {formattedDate}
        </time>
      </div>
      {review.comment && <p className="mt-2 text-sm text-gray-600">{review.comment}</p>}
    </div>
  );
}
