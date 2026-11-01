"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Star, BadgeCheck } from "lucide-react";
import Image from "next/image";

interface ProductReviewListProps {
  productId: Id<"products">;
}

type SortOption = "recent" | "oldest" | "highest" | "lowest";

const SORT_LABELS: Record<SortOption, string> = {
  recent: "Most Recent",
  oldest: "Oldest First",
  highest: "Highest Rated",
  lowest: "Lowest Rated",
};

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${star <= rating ? "fill-primary-fixed text-primary-fixed" : "text-black/15"}`}
        />
      ))}
    </div>
  );
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ReviewImage({ storageId }: { storageId: Id<"_storage"> }) {
  const imageUrl = useQuery(api.storage.getUrl, storageId ? { storageId } : "skip");

  if (!imageUrl) return null;

  return (
    <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-black/15">
      <Image
        src={imageUrl}
        alt="Review image"
        fill
        sizes="192px"
        className="object-cover"
      />
    </div>
  );
}

export default function ProductReviewList({ productId }: ProductReviewListProps) {
  const reviews = useQuery(api.reviews.getReviewsByProduct, { productId, limit: 50 });
  const stats = useQuery(api.reviews.getReviewStats, { productId });
  const [sort, setSort] = useState<SortOption>("recent");

  const sorted = useMemo(() => {
    const arr = [...(reviews ?? [])];
    switch (sort) {
      case "oldest":
        arr.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "highest":
        arr.sort((a, b) => b.rating - a.rating || b.createdAt - a.createdAt);
        break;
      case "lowest":
        arr.sort((a, b) => a.rating - b.rating || b.createdAt - a.createdAt);
        break;
      default:
        arr.sort((a, b) => b.createdAt - a.createdAt);
    }
    return arr;
  }, [reviews, sort]);

  if (reviews === undefined || stats === undefined) {
    return (
      <section id="reviews" className="border-t border-black/15 pt-12 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-primary">
            Customer Reviews
          </h3>
        </div>
        <div className="border border-black/15 p-6 md:p-8 flex flex-col md:flex-row gap-8 animate-pulse">
          <div className="h-16 w-32 bg-surface-container rounded-none" />
          <div className="flex-1 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-2 bg-surface-container rounded-full w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-black/15 p-6 animate-pulse space-y-3">
              <div className="h-4 bg-surface-container w-1/4 rounded-none" />
              <div className="h-4 bg-surface-container w-3/4 rounded-none" />
              <div className="h-4 bg-surface-container w-1/2 rounded-none" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section id="reviews" className="border-t border-black/15 pt-12 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-primary">
            Customer Reviews
          </h3>
        </div>
        <div className="border border-black/15 p-12 text-center">
          <p className="font-label-sm text-secondary uppercase tracking-wider">
            No reviews yet. Be the first to review!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" className="border-t border-black/15 pt-12 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-primary">
          Customer Reviews
        </h3>
        <label className="flex items-center gap-2">
          <span className="sr-only">Sort reviews</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="h-11 bg-surface-container-lowest border border-black/15 px-3 font-label-bold text-xs md:text-sm uppercase tracking-wider text-primary hover:border-primary-fixed focus:border-primary-fixed focus:outline-none transition-colors cursor-pointer"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
              <option key={option} value={option}>
                {SORT_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="border border-black/15 p-6 md:p-8 grid gap-6 md:gap-10 md:grid-cols-[minmax(0,180px),1fr] md:items-center">
        <div>
          <p className="font-label-bold text-[40px] leading-none text-primary">
            {stats.averageRating.toFixed(2)}
          </p>
          <div className="mt-2">
            <StarRating rating={Math.round(stats.averageRating)} size="sm" />
          </div>
          <p className="font-label-sm text-secondary mt-3">
            {stats.averageRating.toFixed(2)} out of 5
          </p>
          <p className="font-label-sm text-secondary mt-1">
            Based on {stats.totalReviews} review{stats.totalReviews === 1 ? "" : "s"}
          </p>
        </div>

        <div className="w-full space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.ratingBreakdown[star as keyof typeof stats.ratingBreakdown];
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="flex items-center justify-end gap-1 w-10 shrink-0">
                  <span className="font-label-bold text-sm text-primary">{star}</span>
                  <Star
                    className={`w-3.5 h-3.5 ${star <= Math.round(stats.averageRating) ? "fill-primary-fixed text-primary-fixed" : "text-black/15"}`}
                  />
                </span>
                <div className="flex-1 h-2 bg-black/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-fixed transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="font-label-bold text-sm text-secondary w-10 text-right shrink-0">
                  {count}
                </span>
              </div>
            );
          })}

          <div className="flex justify-end pt-2">
            <a
              href="#write-review"
              className="inline-flex h-11 items-center px-8 border border-black/15 font-label-bold text-xs md:text-sm uppercase tracking-widest text-primary hover:bg-primary hover:text-background hover:border-primary transition-colors cursor-pointer"
            >
              Write a review
            </a>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sorted.map((review) => (
          <article key={review._id} className="border border-black/15 p-6 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-label-bold text-primary text-sm">
                    {review.userName ? getInitials(review.userName) : review.userId.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-label-bold text-sm text-primary flex items-center gap-1.5">
                    <span className="truncate">{review.userName ?? "Verified Buyer"}</span>
                    <BadgeCheck
                      className="w-4 h-4 text-primary-fixed shrink-0"
                      aria-label="Verified purchase"
                    />
                  </p>
                  <p className="font-label-sm text-[11px] text-secondary">{formatDate(review.createdAt)}</p>
                </div>
              </div>
              <StarRating rating={review.rating} size="md" />
            </div>
            {review.title && (
              <h4 className="font-label-bold text-base text-primary">
                {review.title}
              </h4>
            )}
            {review.imageStorageId && (
              <ReviewImage storageId={review.imageStorageId} />
            )}
            <p className="font-body-md text-body-md text-secondary leading-relaxed">{review.comment}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
