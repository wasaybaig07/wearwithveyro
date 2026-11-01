import type { Metadata } from "next";
import { Suspense } from "react";

import Navbar from "@/components/layout/Navbar";
import ItemsHeader from "@/components/items/ItemsHeader";
import ItemsPageContent from "@/components/items/ItemsPageContent";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Buy Premium Shirts Online — Streetwear Apparel Pakistan",
  description:
    "Buy premium men's shirts online with Wearveyro. Volume 04 features limited-release outerwear, tops and accessories from Collection 004, delivered across Pakistan.",
  keywords: [
    "buy shirts online",
    "premium shirts Pakistan",
    "men's shirts in Pakistan",
    "streetwear apparel Pakistan",
    "designer shirts online Pakistan",
  ],
  alternates: {
    canonical: "/items",
  },
  openGraph: {
    title: "Buy Premium Shirts Online — Streetwear Apparel Pakistan",
    description:
      "Buy premium men's shirts online with Wearveyro. Volume 04 features limited-release outerwear, tops and accessories from Collection 004.",
  },
};

export default function ItemsPage() {
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
