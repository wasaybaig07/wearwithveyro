"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import CategoryCard from "./CategoryCard";

interface CategoryGridProps {
  limit?: number;
}

const CATEGORY_SLUGS: Record<string, string> = {
  "OVERSIZE TEES": "oversize-tees",
  "OVERSIZE TEE": "oversize-tees",
  TOPS: "tops",
  TEES: "tees",
  HOODIES: "hoodies",
  SWEATSHIRTS: "sweatshirts",
  BASICS: "basics",
  BOTTOMS: "bottoms",
  OUTERWEAR: "outerwear",
  SHIRTS: "shirts",
  ACCESSORIES: "accessories",
};

export default function CategoryGrid({ limit = 4 }: CategoryGridProps) {
  const products = useQuery(api.products.listProducts);

  const categories = useMemo(() => {
    const active =
      products?.filter(
        (p) => p.status !== "draft" && p.status !== "soldout" && p.stock > 0
      ) ?? [];

    const grouped = new Map<string, typeof active>();
    for (const product of active) {
      const label = product.category?.trim().toUpperCase();
      if (!label) continue;
      const bucket = grouped.get(label) ?? [];
      bucket.push(product);
      grouped.set(label, bucket);
    }

    const preferOrder = [
      "OVERSIZE TEES",
      "OVERSIZE TEE",
      "HOODIES",
      "SWEATSHIRTS",
      "TOPS",
      "TEES",
      "SHIRTS",
      "BASICS",
      "BOTTOMS",
      "OUTERWEAR",
      "ACCESSORIES",
    ];

    return Array.from(grouped.entries())
      .map(([label, items]) => ({
        label,
        slug: CATEGORY_SLUGS[label] ?? label.toLowerCase().replace(/\s+/g, "-"),
        count: items.length,
        imageId: items[0].imageId,
      }))
      .sort((a, b) => {
        const ia = preferOrder.indexOf(a.label);
        const ib = preferOrder.indexOf(b.label);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      })
      .slice(0, limit);
  }, [products, limit]);

  return (
    <section
      aria-labelledby="category-grid-heading"
      className="border-t border-black/10 pt-12 md:pt-16"
    >
      <div className="flex justify-between items-end border-b border-black/15 pb-4 mb-8">
        <h2
          id="category-grid-heading"
          className="font-headline-lg text-headline-lg text-primary uppercase select-none"
        >
          Shop by Category
        </h2>
        <Link
          className="font-label-bold text-label-bold text-secondary hover:text-primary transition-all hover:line-through text-[15px] tracking-widest"
          href="/items"
        >
          VIEW ALL
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-l border-t border-black/15">
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="border-r border-b border-black/15 bg-surface-container-lowest aspect-[3/4] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-l border-t border-black/15">
          {categories.map((category) => (
            <CategoryCard
              key={category.label}
              title={category.label}
              slug={category.slug}
              imageId={category.imageId}
              productCount={category.count}
            />
          ))}
        </div>
      )}
    </section>
  );
}