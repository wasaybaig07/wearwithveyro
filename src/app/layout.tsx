import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans, Syncopate, Funnel_Display } from "next/font/google";
import Providers from "@/components/Providers";
import PageLoader from "@/components/ui/PageLoader";
import RouteLoader from "@/components/ui/RouteLoader";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { Cabin } from "next/font/google";
import {
  SITE_NAME,
  SITE_URL,
  SITE_KEYWORDS,
  clothingStoreJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import "./globals.css";
import { cn } from "@/lib/utils";

const funnelDisplay = Funnel_Display({
  variable: "--font-funnel-display",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const syncopate = Syncopate({
  variable: "--font-syncopate",
  subsets: ["latin"],
  weight: ["700"],
});


const cabin = Cabin({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cabin",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Men's Shirts & Streetwear Apparel in Pakistan`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Shop men's shirts and premium streetwear apparel online with Wearveyro. Buy stylish shirts, tees and archive pieces with nationwide delivery across Pakistan.",
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  category: "fashion",
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: `${SITE_NAME} — Men's Shirts & Streetwear Apparel in Pakistan`,
    description:
      "Buy shirts online in Pakistan. Premium men's shirts, streetwear apparel and limited drops with nationwide delivery.",
    url: SITE_URL,
    type: "website",
    siteName: SITE_NAME,
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Men's Shirts & Streetwear Apparel in Pakistan`,
    description:
      "Buy shirts online in Pakistan. Premium men's shirts, streetwear apparel and limited drops with nationwide delivery.",
  },
  icons: { shortcut: '/icon.svg' },       
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

/*
  Deployment Prep:
  Once you move to a public domain, add a robots.txt file to the public/ folder:
    public/robots.txt

  Example content:
    User-agent: *
    Allow: /
    Sitemap: https://yourdomain.com/sitemap.xml
*/

export default function RootLayout({
  children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html
      lang="en"
      className={cn("antialiased", funnelDisplay.variable, syne.variable, plusJakartaSans.variable, syncopate.variable,`${cabin.variable} antialiased`)}
    >
      <body className={cn("bg-background text-on-background font-body-md min-h-screen", funnelDisplay.className)}>
        <PageLoader />
        <RouteLoader />
        <JsonLdScript data={organizationJsonLd()} />
        <JsonLdScript data={websiteJsonLd()} />
        <JsonLdScript data={clothingStoreJsonLd()} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
