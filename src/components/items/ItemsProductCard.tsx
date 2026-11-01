"use client";

import { useMemo, useState } from "react";
import { useQueries, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { buildStorageUrlQueries } from "@/lib/storageQueries";
import Image from "next/image";
import Link from "next/link";
import { computeSalePriceValue, formatRs, isDiscountActive } from "@/lib/pricing";

interface ItemsProductCardProps {
  product: {
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
  };
}

export default function ItemsProductCard({ product }: ItemsProductCardProps) {
  const { slug, name, price, priceValue, discountPercent, category, imageId, imageSecondaryId, sizes, stock, status, badge, inventoryPercent } = product;

  const mainUrl = useQuery(
    api.storage.getUrl,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    imageId ? { storageId: imageId as any } : "skip"
  );
  const secondaryUrl = useQuery(
    api.storage.getUrl,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    imageSecondaryId ? { storageId: imageSecondaryId as any } : "skip"
  );

  const variants = product.colorVariants ?? [];
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  // Memoized so the `useQueries` object identity is stable across renders —
  // Convex's useSubscription render-phase-setStates on identity change.
  const variantPrimaryQueries = useMemo(
    () =>
      buildStorageUrlQueries(
        (product.colorVariants ?? []).map((v) => v.imageId),
        "p"
      ),
    [product.colorVariants]
  );
  const variantSecondaryQueries = useMemo(
    () =>
      buildStorageUrlQueries(
        (product.colorVariants ?? []).map((v) => v.imageSecondaryId),
        "s"
      ),
    [product.colorVariants]
  );

  const variantPrimaryResults = useQueries(variantPrimaryQueries);
  const variantSecondaryResults = useQueries(variantSecondaryQueries);

  const activeVariant = variants[selectedVariantIdx];
  const variantPrimary = variantPrimaryResults[`p${selectedVariantIdx}`];
  const variantSecondary = variantSecondaryResults[`s${selectedVariantIdx}`];
  const imagePrimary =
    typeof variantPrimary === "string" ? variantPrimary : mainUrl ?? "";
  const imageSecondary = activeVariant
    ? typeof variantSecondary === "string"
      ? variantSecondary
      : undefined
    : secondaryUrl ?? undefined;

  const isSoldOut = status === "soldout" || stock === 0;
  const stockStatus = isSoldOut
    ? "soldout"
    : stock > 0 && stock < 15
      ? "low"
      : "normal";

  const cardClassName = `border-r border-b border-black/15 flex flex-col group relative cursor-pointer ${
    isSoldOut ? "opacity-70 cursor-not-allowed pointer-events-none select-none" : ""
  }`;

  const inner = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-container-lowest">
        {imagePrimary ? (
          <Image
            src={imagePrimary}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 20vw"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imageSecondary && !isSoldOut ? "group-hover:opacity-0" : ""}`}
          />
        ) : (
          <div className="w-full h-full bg-surface-container animate-pulse" />
        )}

        {imageSecondary && !isSoldOut && (
          <Image
            src={imageSecondary}
            alt={`${name} detail`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 20vw"
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-headline-md -rotate-12 border-2 border-black/40 bg-surface-container-lowest/90 text-primary px-4 py-1 uppercase opacity-70 select-none">
              Sold Out
            </span>
          </div>
        )}

        {badge && !isSoldOut && (
          <div className="absolute top-2 md:top-3 left-2 md:left-3 z-10 select-none">
            <span
              className={`text-[8px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 md:py-1 tracking-widest uppercase ${
                badge === "hot"
                  ? "bg-primary text-background"
                  : "bg-primary-fixed text-on-primary-fixed"
              }`}
            >
              {badge === "hot" ? "HOT" : "NEW"}
            </span>
          </div>
        )}

        {!isSoldOut && (
          <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 bg-black/60 backdrop-blur-sm border-t border-primary-fixed translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p className="font-label-bold text-[9px] md:text-[10px] text-primary-fixed mb-1.5 md:mb-2 tracking-wider">SIZES</p>
            <div className="flex justify-between gap-0.5 md:gap-1">
              {sizes.map((size) => (
                <button
                  key={size}
                  className="flex-1 py-1 md:py-1.5 text-[9px] md:text-[10px] border border-primary-fixed/40 text-primary-fixed hover:border-primary-fixed hover:bg-primary-fixed/10 transition-colors cursor-pointer tracking-wider"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 md:p-6 flex flex-col flex-grow bg-surface-container-lowest">
        <div className="flex justify-between items-start mb-1.5 md:mb-2 gap-2">
          <h3 className={`font-label-bold text-[11px] md:text-sm uppercase tracking-tight min-w-0 break-words ${isSoldOut ? "line-through decoration-primary-fixed" : "text-primary"}`}>
            {name}
          </h3>
          {isSoldOut ? (
            <span className="font-label-bold text-[11px] md:text-sm shrink-0 text-secondary">
              {price}
            </span>
          ) : isDiscountActive(discountPercent) && typeof priceValue === "number" ? (
            <span className="shrink-0 flex flex-col items-end leading-none">
              <span className="font-label-bold text-[11px] md:text-sm text-primary-fixed">
                {formatRs(computeSalePriceValue(priceValue, discountPercent))}
              </span>
              <span className="mt-1 font-label-bold text-[9px] md:text-[10px] text-secondary line-through">
                {price}
              </span>
            </span>
          ) : (
            <span className="font-label-bold text-[11px] md:text-sm shrink-0 text-primary-fixed">
              {price}
            </span>
          )}
        </div>
        <p className="text-secondary font-label-sm text-[9px] md:text-[11px] uppercase mb-3 md:mb-4 opacity-60 tracking-wider">
          ARCHIVE / {category}
        </p>
        {variants.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            {variants.slice(0, 6).map((variant, i) => (
              <button
                key={i}
                type="button"
                title={variant.name}
                aria-label={`Select ${variant.name}`}
                aria-pressed={i === selectedVariantIdx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedVariantIdx(i);
                }}
                className={`w-3 h-3 rounded-full border border-black/20 transition-all hover:scale-110 cursor-pointer ${
                  i === selectedVariantIdx
                    ? "ring-2 ring-black ring-offset-2"
                    : ""
                }`}
                style={{ backgroundColor: variant.hex || "#000" }}
              />
            ))}
            {variants.length > 6 && (
              <span className="w-3 h-3 rounded-full border border-black/20 flex items-center justify-center text-[8px] font-label-bold text-secondary">
                +{variants.length - 6}
              </span>
            )}
          </div>
        )}

        {stockStatus === "low" && !isSoldOut && (
          <div className="mt-auto">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse" />
                <span className="text-[10px] font-label-bold uppercase text-primary-fixed tracking-wider">Low Stock</span>
              </div>
            </div>
        )}

        {stockStatus === "normal" && typeof inventoryPercent === "number" && !isSoldOut && (
          <div className="mt-auto">
            <div className="w-full h-[2px] bg-black/10 mb-2">
              <div className="h-full bg-primary-fixed transition-all" style={{ width: `${inventoryPercent}%` }} />
            </div>
            <div className="flex justify-between text-[9px] font-label-bold uppercase tracking-wider">
              <span className="text-secondary">Inventory Status</span>
              <span className="text-primary-fixed">{inventoryPercent}% Sold</span>
            </div>
          </div>
        )}

        {stockStatus === "normal" && !inventoryPercent && !isSoldOut && (
          <div className="mt-auto">
            <span className="block w-full py-2 border border-black/15 font-label-bold text-[10px] uppercase tracking-wider hover:bg-primary-fixed hover:text-on-primary-fixed transition-all duration-300 text-center cursor-pointer">
              View Details
            </span>
          </div>
        )}

        {status === "active" && stock > 0 && !isSoldOut && (
          <div className="mt-auto">
            <span className="text-[10px] font-label-bold uppercase text-primary-fixed border border-primary-fixed px-2 py-0.5 tracking-wider">
              New Drop
            </span>
          </div>
        )}
      </div>
    </>
  );

  if (isSoldOut) {
    return <div className={cardClassName}>{inner}</div>;
  }

  return (
    <Link href={`/product/${slug}`} className={cardClassName}>
      {inner}
    </Link>
  );
}
