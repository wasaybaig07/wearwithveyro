"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ItemsProductCard from "@/components/items/ItemsProductCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductGrid() {
  const products = useQuery(api.products.listProducts);

  const activeProducts =
    products?.filter((p) => p.status !== "draft") ?? [];

  return (
    <section className="pb-16 md:pb-20">
      <div className="flex justify-between items-end border-b border-black/15 pb-4">
        <h2 className="font-headline-lg text-headline-lg text-primary uppercase select-none">
          OUR COLLECTION
        </h2>
        <Link
          className="font-label-bold text-label-bold text-secondary hover:text-primary transition-all hover:line-through tracking-widest text-[15px]"
          href="/shop"
        >
          VIEW ALL
        </Link>
      </div>

      {products === undefined ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 border-l border-t border-black/15">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-r border-b border-black/15">
              <Skeleton className="aspect-[3/4] rounded-none bg-surface-container" />
              <div className="p-2 md:p-4 lg:p-6 space-y-1.5 md:space-y-2">
                <Skeleton className="h-3 md:h-4 rounded-none bg-surface-container w-3/4" />
                <Skeleton className="h-2.5 md:h-3 rounded-none bg-surface-container w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : activeProducts.length === 0 ? (
        <div className="border border-black/15 p-12 text-center">
          <p className="font-label-bold text-secondary tracking-widest uppercase">
            No products available yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 border-l border-t border-black/15">
          {activeProducts.map((product) => (
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
      )}
    </section>
  );
}
