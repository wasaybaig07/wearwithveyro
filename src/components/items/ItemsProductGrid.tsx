"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ItemsProductCard from "./ItemsProductCard";

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-0 border-t border-l border-black/15">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-r border-b border-black/15">
          <Skeleton className="aspect-[3/4] rounded-none bg-surface-container" />
          <div className="p-4 md:p-6 space-y-2">
            <Skeleton className="h-4 rounded-none bg-surface-container w-3/4" />
            <Skeleton className="h-3 rounded-none bg-surface-container w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface ConvexProduct {
  _id: string;
  slug: string;
  name: string;
  price: string;
  priceValue?: number;
  discountPercent?: number;
  category: string;
  imageId?: string;
  imageSecondaryId?: string;
  sizes: string[];
  stock: number;
  status: string;
  badge?: string;
  inventoryPercent?: number;
  colorVariants?: {
    name: string;
    hex?: string;
    imageId?: string;
    imageSecondaryId?: string;
  }[];
}

interface ItemsProductGridProps {
  items: ConvexProduct[];
}

export default function ItemsProductGrid({ items }: ItemsProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const visibleProducts = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 5, items.length));
      setIsLoading(false);
    }, 400);
  };

  if (!items.length) {
    return (
      <div className="border border-black/15 p-12 text-center">
        <p className="font-label-bold text-secondary tracking-widest uppercase">
          No items found for this category.
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-0 border-t border-l border-black/15">
        {visibleProducts.map((product) => (
          <ItemsProductCard key={product._id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-section-gap-sm">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="group flex items-center gap-4 py-4 px-8 md:px-12 border border-black/15 hover:border-primary-fixed transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            <span className="font-label-bold text-sm uppercase tracking-widest group-hover:text-primary-fixed">
              {isLoading ? "LOADING..." : "Load More Archive Items"}
            </span>
            <ArrowRight
              size={18}
              className="text-primary-fixed group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      )}
    </section>
  );
}
