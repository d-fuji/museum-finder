import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  rating: number;
  size?: "sm" | "md";
};

export function StarRating({ rating, size = "md" }: Props) {
  const iconSize = size === "sm" ? 14 : 18;

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating}点`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={iconSize}
          className={cn(
            star <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-muted-foreground/30"
          )}
        />
      ))}
    </span>
  );
}
