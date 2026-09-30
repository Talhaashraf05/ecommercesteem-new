import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { site } from "@/content";

import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { serviceNav } from "./service-nav";
import { ServicesMenu } from "./services-menu";

const LINK = "rounded-md text-sm text-muted transition-colors duration-200 hover:text-fg";

export const SiteHeader = () => (
  <header className="fixed inset-x-0 top-0 z-40">
    {/* Blur lives on a sibling layer: backdrop-filter on the header itself would
        become the containing block for the fixed mobile menu panel. */}
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 border-b border-line bg-bg/70 backdrop-blur-xl"
    />
    <div className="mx-auto flex h-18 max-w-page items-center justify-between px-gutter">
      <Logo />
      <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
        <ServicesMenu groups={serviceNav} />
        <Link href="/work" className={LINK}>Work</Link>
        <Link href="/about" className={LINK}>About</Link>
        <Link href="/careers" className={LINK}>Careers</Link>
        <a href={site.portal} className={LINK} target="_blank" rel="noopener noreferrer">
          Portal ↗
        </a>
      </nav>
      <div className="flex items-center gap-3">
        <ButtonLink href="/contact" className="hidden sm:inline-flex">
          Book a free audit
        </ButtonLink>
        <MobileMenu groups={serviceNav} portal={site.portal} />
      </div>
    </div>
  </header>
);
