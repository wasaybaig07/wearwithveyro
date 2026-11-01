import type { Metadata } from "next";
import { Suspense } from "react";

import Navbar from "@/components/layout/Navbar";
import ItemsHeader from "@/components/items/ItemsHeader";
import ItemsPageContent from "@/components/items/ItemsPageContent";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Shop Men's Shirts Online — Streetwear Apparel in Pakistan",
  description:
    "Browse the Wearveyro archive. Shop limited-release men's shirts, outerwear, tops and streetwear apparel online in Pakistan with nationwide delivery.",
  keywords: [
    "buy shirts online",
    "men's shirts in Pakistan",
    "streetwear apparel Pakistan",
    "shop streetwear online Pakistan",
    "men's shirts online",
  ],
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Shop Men's Shirts Online — Streetwear Apparel in Pakistan",
    description:
      "Shop limited-release men's shirts, outerwear and streetwear apparel online in Pakistan.",
  },
};

export default function ShopPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-[1600px] mx-auto pt-28 md:pt-32 pb-24 px-container-margin">
        <ItemsHeader />
        <Suspense fallback={null}>
          <ItemsPageContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
