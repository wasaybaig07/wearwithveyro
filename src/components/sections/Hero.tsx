"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";

import HeroCard from "./HeroCard";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAtkqDl4BKY1qZ08t7kA15BgdMuWQkbL6ejnzlwgvqKabkf4O70c2Nx3TGmyi7AvT_qXUM0xmniTTlEyGvYYJDouKj1bUJ6d5aJY9hWCSNPmN2_7CBGUVcu4TNinxz7mXWd3mo2BHl1Cu1gODE13a60yxvm4UtHVJBh5eAbIP_aYMvNPm0JePXsLGWi6TA1BbXH02gSyvh3-8GJAqiMQT2WsvYHrJPNmgDtuINT3Cf3F5LIQdVejwGFb_fc4XwmWfW_G0mty6Ex8Akt";

export default function Hero() {
  const products = useQuery(api.products.listProducts);

  const heroCards =
    products
      ?.filter(
        (p) => p.status !== "draft" && p.status !== "soldout" && p.stock > 0
      )
      .slice(0, 4) ?? [];

  return (
    <section className="relative h-[40vh] min-h-[220px] md:h-[50vh] overflow-hidden bg-black" aria-labelledby="hero-heading">
      <h1 id="hero-heading" className="sr-only">
        Wearveyro — Men&apos;s Shirts & Streetwear Apparel in Pakistan
      </h1>
      <Image
        src={HERO_IMAGE}
        alt="Wearveyro high-fashion B-roll background"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src="/main.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/25" />

      {heroCards.length > 0 && (
        <>
          {/* Mobile: hidden — cards only shown on md+ */}

          {/* Desktop: unchanged */}
          <div className="hidden md:flex pointer-events-none absolute inset-x-0 lg:inset-x-auto lg:right-10 z-10 bottom-6 md:bottom-10 flex items-end justify-center lg:justify-end px-container-margin lg:px-0">
            {heroCards.map((card, i) => (
              <HeroCard
                key={card._id}
                slug={card.slug}
                name={card.name}
                price={card.price}
                imageId={card.imageId}
                index={i}
                total={heroCards.length}
              />
            ))}
          </div>
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 h-32 md:h-44 bg-gradient-to-t from-background via-background/45 to-transparent" />
    </section>
  );
}
