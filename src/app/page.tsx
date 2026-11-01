import type { Metadata } from "next";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import MarqueeBar from "@/components/sections/MarqueeBar";
import CategoryGrid from "@/components/sections/CategoryGrid";
import ProductGrid from "@/components/sections/ProductGrid";
import LivePurchasePopup from "@/components/sections/LivePurchasePopup";
import HomepageReviewCarousel from "@/components/sections/HomepageReviewCarousel";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Men's Shirts & Streetwear Apparel in Pakistan",
  description:
    "Wearveyro is a digital-native streetwear movement in Pakistan, blending brutalist geometry with the precision of luxury tailoring. Shop premium men's shirts and streetwear apparel online with nationwide delivery.",
  keywords: [
    "men's shirts in Pakistan",
    "buy shirts online",
    "streetwear apparel Pakistan",
    "men's fashion Pakistan",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Men's Shirts & Streetwear Apparel in Pakistan | Wearveyro",
    description:
      "Shop premium men's shirts and streetwear apparel in Pakistan. Limited drops, archive pieces and new collections.",
  },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="max-w-[1600px] mx-auto pt-24 px-container-margin space-y-section-gap-lg">
        <Hero />
        <MarqueeBar />
        <CategoryGrid />
        <ProductGrid />
        <HomepageReviewCarousel />
      </main>
      <LivePurchasePopup />
      <Footer />
    </>
  );
}
