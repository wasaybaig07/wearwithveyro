"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Star, ChevronLeft, ChevronRight, BadgeCheck, Quote } from "lucide-react";
import Link from "next/link";
import type { Id } from "../../../convex/_generated/dataModel";

const MAX_REVIEWS = 9;
const MAX_REVIEWS_MOBILE = 8;
// One wide card per slide, Surteez-style.
const FETCH_LIMIT = 999;

interface Review {
  _id: string;
  productId: Id<"products">;
  userId: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt: number;
  title?: string;
  imageStorageId?: Id<"_storage">;
}

function Stars({
  rating,
  className = "w-4 h-4",
}: {
  rating: number;
  className?: string;
}) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${className} ${star <= rating ? "fill-primary-fixed text-primary-fixed" : "text-black/15"}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  productName,
  productSlug,
}: {
  review: Review;
  productName?: string;
  productSlug?: string;
}) {
  return (
    <article className="w-full h-full flex flex-col items-center justify-center text-center gap-4 md:gap-5 border border-black/15 rounded-lg px-6 py-10 md:px-16 md:py-12 overflow-hidden hover:border-primary-fixed/40 transition-colors">
      <Quote className="w-8 h-8 md:w-10 md:h-10 fill-primary-fixed text-primary-fixed shrink-0" />

      <p className="font-label-bold text-[13px] md:text-sm text-primary line-clamp-2 max-w-2xl">
        {review.title || review.comment}
      </p>

      <Stars rating={review.rating} className="w-4 h-4 md:w-5 md:h-5" />

      <p className="flex items-center justify-center gap-1.5 font-label-bold text-[13px] md:text-sm text-primary">
        <span className="truncate max-w-[180px]">{review.userName ?? "Verified Buyer"}</span>
        <BadgeCheck className="w-4 h-4 md:w-5 md:h-5 text-primary-fixed shrink-0" aria-label="Verified purchase" />
      </p>

      {productSlug ? (
        <Link
          href={`/product/${productSlug}`}
          className="font-label-bold text-[12px] md:text-sm text-secondary underline underline-offset-4 decoration-1 hover:text-primary-fixed transition-colors"
        >
          {productName ?? "View product"}
        </Link>
      ) : (
        <Link
          href="/items"
          className="font-label-bold text-[12px] md:text-sm text-secondary underline underline-offset-4 decoration-1 hover:text-primary-fixed transition-colors"
        >
          View product
        </Link>
      )}
    </article>
  );
}

export default function HomepageReviewCarousel() {
  const reviews = useQuery(api.reviews.getRandomReviews, { limit: FETCH_LIMIT });
  const products = useQuery(api.products.listProducts);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      setIsDesktop(mq.matches);
      setPage(0);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Store-wide aggregate across everything fetched.
  const total = useMemo(() => (reviews ?? []).length, [reviews]);

  // Strictly 5-star reviews only, capped per breakpoint (9 desktop / 8 mobile).
  const shown = useMemo(() => {
    const fiveStarOnly = (reviews ?? []).filter((r) => r.rating === 5);
    return fiveStarOnly.slice(0, isDesktop ? MAX_REVIEWS : MAX_REVIEWS_MOBILE);
  }, [reviews, isDesktop]);

  const productMap = useMemo(() => {
    const map = new Map<string, { name: string; slug?: string }>();
    for (const p of products ?? []) {
      map.set(p._id, { name: p.name, slug: p.slug ?? undefined });
    }
    return map;
  }, [products]);

  const pages = Math.max(1, shown.length);

  const scrollToPage = (target: number) => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.min(pages - 1, Math.max(0, target));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setPage(next);
  };

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setPage(Math.min(pages - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth))));
  };

  if (reviews === undefined) {
    return (
      <section className="border-t border-black/15 pt-12 md:pt-16" aria-labelledby="reviews-heading">
        <div className="animate-pulse space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 bg-surface-container w-64 rounded-none" />
            <div className="flex items-center gap-1.5 w-40">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-4 h-4 bg-surface-container" />
              ))}
            </div>
          </div>
          <div className="border border-black/15 rounded-lg h-[320px] md:h-[360px]" />
        </div>
      </section>
    );
  }

  if (total === 0 || shown.length === 0) {
    return null;
  }

  return (
    <section className="border-t mb-20 border-black/15 pt-12 md:pt-16" aria-labelledby="reviews-heading">
      <div className="flex flex-col items-center text-center mb-8 md:mb-10">
        <h2 id="reviews-heading" className="text-[24px] md:text-[32px] font-semibold tracking-tight leading-none text-primary select-none">
          Customers are saying
        </h2>
      </div>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar"
      >
        {shown.map((review) => {
          const product = productMap.get(review.productId);
          return (
            <div
              key={review._id}
              className="w-full shrink-0 snap-center flex"
            >
              <ReviewCard
                review={review}
                productName={product?.name}
                productSlug={product?.slug}
              />
            </div>
          );
        })}
      </div>

      {shown.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            type="button"
            aria-label="Previous review"
            onClick={() => scrollToPage(page - 1)}
            disabled={page === 0}
            className="w-11 h-11 flex items-center justify-center border border-black/15 bg-surface-container-lowest text-primary hover:border-primary-fixed hover:text-primary-fixed transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Next review"
            onClick={() => scrollToPage(page + 1)}
            disabled={page >= pages - 1}
            className="w-11 h-11 flex items-center justify-center border border-black/15 bg-surface-container-lowest text-primary hover:border-primary-fixed hover:text-primary-fixed transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      )}
    </section>
  );
}
