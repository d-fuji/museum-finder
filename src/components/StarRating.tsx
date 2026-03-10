type Props = {
  rating: number;
  size?: "sm" | "md";
};

export function StarRating({ rating, size = "md" }: Props) {
  const sizeClass = size === "sm" ? "text-sm" : "text-lg";

  return (
    <span className={`inline-flex items-center gap-0.5 ${sizeClass}`} aria-label={`${rating}点`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      ))}
    </span>
  );
}
