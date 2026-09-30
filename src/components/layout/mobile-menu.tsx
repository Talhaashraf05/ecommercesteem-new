"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { serviceGroups, services, site } from "@/content";
import { useScroll } from "@/hooks/smooth-scroll/use-scroll";

export const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const scroll = useScroll.getState();
    if (open) {
      wasOpen.current = true;
      scroll.stop();
      closeRef.current?.focus();
    } else {
      scroll.start();
      if (wasOpen.current) {
        wasOpen.current = false;
        triggerRef.current?.focus();
      }
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        className="flex size-11 items-center justify-center rounded-full border border-line lg:hidden"
      >
        <span aria-hidden="true" className="flex w-4 flex-col gap-1">
          <span className="h-px bg-fg" />
          <span className="h-px bg-fg" />
        </span>
      </button>
      <div
        id="mobile-menu"
        hidden={!open}
        data-lenis-prevent
        className="fixed inset-0 z-50 overflow-y-auto bg-bg px-gutter pb-10 pt-6"
      >
        <div className="flex justify-end">
          <button
            ref={closeRef}
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="flex size-11 items-center justify-center rounded-full border border-line text-xl"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <nav aria-label="Mobile" className="mt-6 flex flex-col gap-8">
          {serviceGroups.map((g) => (
            <div key={g.id}>
              <p className="mb-3 text-kicker uppercase tracking-wider text-brand">
                {g.label}
              </p>
              <ul className="flex flex-col gap-3">
                {services
                  .filter((s) => s.group === g.id)
                  .map((s) => (
                    <li key={s.slug}>
                      <Link href={`/services/${s.slug}`} className="text-lg">
                        {s.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
          <ul className="flex flex-col gap-4 border-t border-line pt-8 font-display text-2xl">
            <li><Link href="/work">Work</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/careers">Careers</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li>
              <a href={site.portal} target="_blank" rel="noopener noreferrer">
                Client portal ↗
              </a>
            </li>
          </ul>
          <ButtonLink href="/contact" size="lg">
            Book a free audit
          </ButtonLink>
        </nav>
      </div>
    </>
  );
};
