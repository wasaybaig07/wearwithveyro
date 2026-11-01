"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";
import Link from "next/link";

const BUYER_NAMES = [
  "Nihal",
  "Aisha",
  "Hamza",
  "Zara",
  "Bilal",
  "Fatima",
  "Usman",
  "Mahnoor",
  "Daniyal",
  "Sana",
];

const TIME_AGO = [
  "just now",
  "2 minutes ago",
  "7 minutes ago",
  "14 minutes ago",
  "22 minutes ago",
];

export default function LivePurchasePopup() {
  const products = useQuery(api.products.listProducts);
  const activeProducts =
    products?.filter(
      (p) => p.status !== "draft" && p.status !== "soldout" && p.stock > 0
    ) ?? [];

  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasProducts = activeProducts.length > 0;
  const product = hasProducts
    ? activeProducts[current % activeProducts.length]
    : undefined;

  const imageUrl = useQuery(
    api.storage.getUrl,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    product?.imageId ? { storageId: product.imageId as any } : "skip"
  );

  useEffect(() => {
    if (dismissed || activeProducts.length === 0) return;

    const appear = setTimeout(() => setVisible(true), 4000);

    const cycle = setInterval(() => {
      setCurrent((c) => (c + 1) % activeProducts.length);
      setVisible(true);
    }, 9000);

    return () => {
      clearTimeout(appear);
      clearInterval(cycle);
    };
  }, [dismissed, activeProducts.length]);

  useEffect(() => {
    if (!visible) return;
    timerRef.current = setTimeout(() => setVisible(false), 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, current]);

  if (dismissed || !product) return null;

  const name = BUYER_NAMES[current % BUYER_NAMES.length];
  const timeAgo = TIME_AGO[current % TIME_AGO.length];

  return (
    <Link
      href={`/product/${product.slug}`}
      aria-live="polite"
      className={`fixed bottom-5 left-5 z-50 w-[calc(100%-2.5rem)] max-w-xs cursor-pointer
        border border-black/15 bg-surface-container-low/95 backdrop-blur-md
        transition-all duration-500 ${
          visible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
    >
      <div className="flex items-start gap-3 p-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-black/15">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-surface-container animate-pulse" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-label-bold text-[11px] tracking-wider text-primary truncate uppercase">
            {name} purchased{" "}
            <span className="text-primary-fixed">{product.name}</span>
          </p>
          <p className="font-label-bold text-[10px] tracking-widest text-secondary uppercase mt-1">
            {timeAgo} · {product.price}
          </p>
        </div>
        <button
          aria-label="Dismiss notification"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDismissed(true);
          }}
          className="shrink-0 p-1.5 text-secondary hover:text-primary transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>
      <div
        className={`h-0.5 overflow-hidden ${
          visible ? "bg-primary-fixed/30" : "bg-transparent"
        }`}
      >
        <div
          key={current}
          className="h-full bg-primary-fixed origin-left"
          style={{
            animation: visible ? "livePurchaseBar 5s linear forwards" : "none",
          }}
        />
      </div>
    </Link>
  );
}