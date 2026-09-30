import type { Metadata, Viewport } from "next";
import { Assistant, Inter } from "next/font/google";

import {
  generateMetadata,
  generateViewport,
} from "@/utils/seo/generate-page-metadata";

import { AdaptiveGrid } from "@/components/common/grid";
import { ReducedMotion } from "@/components/common/reduced-motion";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ScrollLayout } from "@/layouts/scroll-layout";

import "@/app/globals.css";

// Inter (body) + Assistant (display) mirror the Google Fonts links in the
// source index.html. Bound to --font-inter / --font-assistant in globals.css.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = generateMetadata();
export const viewport: Viewport = generateViewport();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${assistant.variable}`}>
      <body className="bg-bg font-sans text-fg">
        <ScrollLayout>
          <AdaptiveGrid coef={1} />
          <ReducedMotion />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand focus:px-4 focus:py-2"
          >
            Skip to content
          </a>
          <SiteHeader />
          {children}
          <SiteFooter />
        </ScrollLayout>
      </body>
    </html>
  );
}
