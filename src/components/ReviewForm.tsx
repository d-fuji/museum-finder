"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  museumId: number;
  onSuccess: () => void;
};

export function ReviewForm({ museumId, onSuccess }: Props) {
  const [rating, setRating] = useState<number | null>(null);
  const [headline, setHeadline] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === null) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/museums/${museumId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          headline: headline || undefined,
          comment: comment || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "エラーが発生しました");
        return;
      }

      onSuccess();
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset role="group" aria-label="評価">
        <legend className="mb-2 text-sm font-medium">評価</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                className="sr-only"
                aria-label={String(value)}
              />
              <span
                className={`inline-block text-2xl transition-colors ${
                  rating !== null && value <= rating
                    ? "text-yellow-400"
                    : "text-muted-foreground/30"
                }`}
              >
                ★
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="review-headline" className="mb-1 block text-sm font-medium">
          一言で表すと？
        </label>
        <input
          id="review-headline"
          aria-label="一言コメント"
          type="text"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          maxLength={50}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="時が止まった紡績工場"
        />
        <p className="mt-1 text-xs text-muted-foreground">{headline.length}/50</p>
      </div>

      <div>
        <label htmlFor="review-comment" className="mb-1 block text-sm font-medium">
          もう少し詳しく（任意）
        </label>
        <textarea
          id="review-comment"
          aria-label="コメント"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="感想を書いてください"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={rating === null || submitting} size="sm">
        {submitting ? "投稿中..." : "投稿する"}
      </Button>
    </form>
  );
}
