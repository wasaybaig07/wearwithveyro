"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
  slug: string;
  title: string;
  imageId?: string;
  productCount: number;
}

export default function CategoryCard({
  slug,
  title,
  imageId,
  productCount,
}: CategoryCardProps) {
  const imageUrl = useQuery(
    api.storage.getUrl,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    imageId ? { storageId: imageId as any } : "skip"
  );

  return (
    <Link
      href={`/items?category=${slug}`}
      className="group block w-full overflow-hidden border border-black/15 bg-surface-container-lowest transition-all duration-500 hover:border-primary-fixed/40 hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.8)] min-h-[64px]"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-surface-container animate-pulse" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/10" />

        <span className="absolute top-2 md:top-4 left-2 md:left-4 font-label-bold text-[8px] md:text-[10px] tracking-widest uppercase text-white border border-white/20 bg-black/40 backdrop-blur-sm px-1.5 md:px-2.5 py-0.5 md:py-1">
          {productCount} {productCount === 1 ? "Drop" : "Drops"}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-3 md:p-5">
          <h3 className="font-headline-lg text-lg md:text-3xl uppercase text-white tracking-tight group-hover:text-primary-fixed transition-colors">
            {title}
          </h3>
          <span className="mt-1 md:mt-2 inline-flex items-center gap-2 font-label-bold text-[9px] md:text-[11px] uppercase tracking-widest text-white/70 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
            Shop now
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
