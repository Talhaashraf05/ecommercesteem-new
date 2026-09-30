import type { Metadata, Viewport } from "next";
import { Assistant, Inter } from "next/font/google";

import { Analytics } from "@/components/common/analytics";
import { AdaptiveGrid } from "@/components/common/grid";
import { ReducedMotion } from "@/components/common/reduced-motion";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ScrollLayout } from "@/layouts/scroll-layout";
import { siteConfig } from "@/lib/site";
import { organizationLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/common/json-ld";

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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "EcommerceSteem | E-commerce Growth Agency for Amazon, Meta & Google", template: "%s | EcommerceSteem" },
  description: siteConfig.description,
  icons: { icon: "/icon.png", apple: "/apple-icon-180x180.png" },
  manifest: "/manifest.json",
};
export const viewport: Viewport = { themeColor: siteConfig.themeColor, width: "device-width", initialScale: 1 };

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
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand-strong focus:px-4 focus:py-2"
          >
            Skip to content
          </a>
          <SiteHeader />
          {children}
          <SiteFooter />
        </ScrollLayout>
        <JsonLd data={organizationLd()} />
        <Analytics />
      </body>
    </html>
  );
}
