"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";
import Link from "next/link";

interface HeroCardProps {
  slug: string;
  name: string;
  price: string;
  imageId?: string;
  index: number;
  total: number;
}

export default function HeroCard({
  slug,
  name,
  price,
  imageId,
  index,
  total,
}: HeroCardProps) {
  const imageUrl = useQuery(
    api.storage.getUrl,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    imageId ? { storageId: imageId as any } : "skip"
  );

  const deg = (index - (total - 1) / 2) * 4;

  return (
    <div
      className="relative origin-bottom -ml-10 first:ml-0"
      style={{ transform: `rotate(${deg}deg)`, zIndex: index }}
    >
      <Link
        href={`/product/${slug}`}
        className="group block w-40 md:w-44 overflow-hidden border border-black/15 bg-black/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-6 hover:rotate-0 hover:border-primary-fixed/40 pointer-events-auto"
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 40vw, 11vw"
              className="object-cover transition-all duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-surface-container animate-pulse" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="p-3 space-y-1.5 bg-black/30 backdrop-blur-md">
          <p className="font-label-bold text-[11px] tracking-wider text-primary-fixed truncate uppercase group-hover:text-on-primary-fixed transition-colors">
            {name}
          </p>
          <div className="flex items-center justify-between gap-2">
            <p className="font-label-bold text-[11px] text-primary-fixed truncate">
              {price}
            </p>
            <span className="font-label-bold text-[10px] text-primary-fixed/70 uppercase tracking-wider shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
              View
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
