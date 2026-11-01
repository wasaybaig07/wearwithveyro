"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import ItemsProductCard from "@/components/items/ItemsProductCard";

interface ProductRelatedProps {
  currentSlug: string;
}

export default function ProductRelated({ currentSlug }: ProductRelatedProps) {
  const products = useQuery(api.products.listProducts);

  const current = (currentSlug ?? "").toLowerCase().trim();

  // Complementary archive: every published product except the one currently
  // being viewed, matched case-insensitively so the slug never falsely
  // poisons the comparison (e.g. with exactly two items in the store, viewing
  // one must surface the other, not an empty grid).
  const related = (products ?? [])
    .filter(
      (p) =>
        p.status !== "draft" &&
        p.slug &&
        (p.slug?.toLowerCase().trim() ?? "") !== current
    )
    .slice(0, 4);

  const heading = (
    <h2 className="font-headline-lg text-[26px] md:text-[40px] mb-6 md:mb-12 uppercase tracking-tight leading-none">
      Related Shirts
    </h2>
  );

  if (products === undefined) {
    return (
      <section className="border-t border-black/15 py-section-gap-lg">
        {heading}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 border-l border-t border-black/15">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-r border-b border-black/15">
              <Skeleton className="aspect-[3/4] rounded-none bg-surface-container" />
              <div className="p-3 md:p-6 space-y-1.5 md:space-y-2">
                <Skeleton className="h-3 md:h-4 rounded-none bg-surface-container w-3/4" />
                <Skeleton className="h-2.5 md:h-3 rounded-none bg-surface-container w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (related.length === 0) {
    return (
      <section className="border-t border-black/15 py-section-gap-lg">
        {heading}
        <p className="font-label-bold text-secondary tracking-widest uppercase">
          No other products available.
        </p>
      </section>
    );
  }

  return (
    <section className="border-t border-black/15 py-section-gap-lg">
      {heading}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 border-l border-t border-black/15">
        {related.map((product) => (
          <ItemsProductCard
            key={product._id}
            product={{
              _id: product._id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              priceValue: product.priceValue,
              discountPercent: product.discountPercent,
              category: product.category,
              imageId: product.imageId,
              imageSecondaryId: product.imageSecondaryId,
              sizes: product.sizes,
              stock: product.stock,
              status: product.status,
              badge: product.badge,
              inventoryPercent: product.inventoryPercent,
              colorVariants: product.colorVariants?.map((v) => ({
                name: v.name,
                hex: v.hex,
                imageId: v.imageId,
                imageSecondaryId: v.imageSecondaryId,
              })),
            }}
          />
        ))}
      </div>
    </section>
  );
}
