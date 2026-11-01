"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useCartStore } from "../../store/useCartStore";

import ProductImageGallery from "./ProductImageGallery";
import ProductInfo from "./ProductInfo";
import ExpressCheckoutModal from "./ExpressCheckoutModal";
import ProductReviewList from "./ProductReviewList";
import ProductReviewForm from "./ProductReviewForm";
import { computeSalePriceValue, formatRs, isDiscountActive } from "@/lib/pricing";

interface ProductDetailContentProps {
  productId: string;
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
      <div className="aspect-square bg-surface-container" />
      <div className="space-y-6 p-8">
        <div className="h-8 bg-surface-container w-3/4" />
        <div className="h-6 bg-surface-container w-1/4" />
        <div className="h-4 bg-surface-container w-full" />
        <div className="h-4 bg-surface-container w-2/3" />
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="text-center py-24">
      <p className="font-headline-md text-secondary">Product not found</p>
    </div>
  );
}

function VariantImages({
  variants,
  selectedIdx,
  fallbackMainUrl,
  fallbackSecondaryUrl,
  onReady,
}: {
  variants: { imageId: Id<"_storage">; imageSecondaryId?: Id<"_storage"> }[];
  selectedIdx: number;
  fallbackMainUrl?: string;
  fallbackSecondaryUrl?: string;
  onReady: (main: string | null, secondary: string | null) => void;
}) {
  const v = variants[selectedIdx];
  const mainUrl = useQuery(
    api.storage.getUrl,
    v ? { storageId: v.imageId } : "skip"
  );
  const secondaryUrl = useQuery(
    api.storage.getUrl,
    v?.imageSecondaryId ? { storageId: v.imageSecondaryId } : "skip"
  );

  useEffect(() => {
    onReady(
      mainUrl ?? fallbackMainUrl ?? null,
      secondaryUrl ?? fallbackSecondaryUrl ?? null
    );
  }, [mainUrl, secondaryUrl, fallbackMainUrl, fallbackSecondaryUrl, onReady]);

  return null;
}

export default function ProductDetailContent({ productId }: ProductDetailContentProps) {
  const product = useQuery(api.products.getProductBySlug, {
    slug: productId,
  });

  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const [expressSize, setExpressSize] = useState<string | null>(null);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  const mainImageUrl = useQuery(
    api.storage.getUrl,
    product?.imageId ? { storageId: product.imageId } : "skip"
  );

  const secondaryImageUrl = useQuery(
    api.storage.getUrl,
    product?.imageSecondaryId ? { storageId: product.imageSecondaryId } : "skip"
  );

  const galleryUrl1 = useQuery(
    api.storage.getUrl,
    product?.galleryImageIds?.[0] ? { storageId: product.galleryImageIds[0] } : "skip"
  );

  const galleryUrl2 = useQuery(
    api.storage.getUrl,
    product?.galleryImageIds?.[1] ? { storageId: product.galleryImageIds[1] } : "skip"
  );

  const colorVariants = product?.colorVariants ?? [];
  const hasColorVariants = colorVariants.length > 0;

  const [variantDisplay, setVariantDisplay] = useState<{
    main: string | null;
    secondary: string | null;
  }>({ main: null, secondary: null });

  useEffect(() => {
    if (product !== undefined) {
      console.log("[ProductDetailContent] slug searched:", productId);
      console.log("[ProductDetailContent] result:", product);
    }
  }, [productId, product]);

  if (product === undefined) {
    return <LoadingSkeleton />;
  }

  if (product === null) {
    console.error("[ProductDetailContent] Product not found for slug:", productId);
    return <NotFoundState />;
  }

  const isSoldOut = product.status === "soldout" || product.stock <= 0;

  const effectivePrice = isDiscountActive(product.discountPercent)
    ? formatRs(computeSalePriceValue(product.priceValue, product.discountPercent))
    : product.price;

  const displayMainUrl = variantDisplay.main ?? mainImageUrl ?? undefined;
  const displaySecondaryUrl = variantDisplay.secondary ?? secondaryImageUrl ?? undefined;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden">
        <div className="flex flex-col gap-4">
          {hasColorVariants && (
            <VariantImages
              variants={colorVariants}
              selectedIdx={selectedColorIdx}
              fallbackMainUrl={mainImageUrl ?? undefined}
              fallbackSecondaryUrl={secondaryImageUrl ?? undefined}
              onReady={(main, secondary) => {
                setVariantDisplay((prev) =>
                  prev.main === main && prev.secondary === secondary ? prev : { main, secondary }
                );
              }}
            />
          )}
          <ProductImageGallery
            imageUrl={displayMainUrl}
            imageSecondaryUrl={displaySecondaryUrl}
            galleryUrls={[galleryUrl1, galleryUrl2].filter((u): u is string => !!u)}
          />
        </div>
        <ProductInfo
          name={product.name}
          price={product.price}
          priceValue={product.priceValue}
          discountPercent={product.discountPercent}
          description={product.description}
          sizes={product.sizes}
          stock={product.stock}
          isSoldOut={isSoldOut}
          isAdded={added}
          sizeChart={product.sizeChart ?? undefined}
          colorVariants={colorVariants.map((v, i) => ({
            name: v.name,
            hex: v.hex,
            isSelected: i === selectedColorIdx,
            onClick: () => setSelectedColorIdx(i),
          }))}
          onAddToCart={(size) => {
            if (isSoldOut) return;
            addItem({
              productId: product._id,
              name: product.name,
              price: product.price,
              priceValue: product.priceValue,
              imageUrl: displayMainUrl ?? "",
              size,
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
          }}
          onCheckout={(size) => {
            if (isSoldOut) return;
            setExpressSize(size);
          }}
        />

        {expressSize && (
          <ExpressCheckoutModal
            productId={product._id}
            name={product.name}
            price={effectivePrice}
            size={expressSize}
            onClose={() => setExpressSize(null)}
          />
        )}
      </div>

      <ProductReviewList productId={product._id} />
      <ProductReviewForm productId={product._id} />
    </>
  );
}
