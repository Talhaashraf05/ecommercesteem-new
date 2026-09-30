"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { useScroll } from "@/hooks/smooth-scroll/use-scroll";

import { serviceIcon } from "./service-icons";
import type { ServiceNavGroup } from "./service-nav";

export const MobileMenu = ({ groups, portal }: { groups: ServiceNavGroup[]; portal: string }) => {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    useScroll.getState().stop();
    closeRef.current?.focus();
    const trigger = triggerRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      const nodes = panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!panel || !nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      const outside = !panel.contains(active);
      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      useScroll.getState().start();
      trigger?.focus();
    };
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
        ref={panelRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
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
          {groups.map((g) => (
            <div key={g.id}>
              <p className="mb-3 text-kicker uppercase tracking-wider text-brand-glow">
                {g.label}
              </p>
              <ul className="flex flex-col gap-3">
                {g.items.map((s) => {
                  const Icon = serviceIcon[s.slug];
                  return (
                    <li key={s.slug}>
                      <Link href={`/services/${s.slug}`} className="flex items-start gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-surface text-brand">
                          <Icon />
                        </span>
                        <span>
                          <span className="block text-lg">{s.name}</span>
                          <span className="block text-sm text-muted">{s.tagline}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <ul className="flex flex-col gap-4 border-t border-line pt-8 font-display text-2xl">
            <li><Link href="/work">Work</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/careers">Careers</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li>
              <a href={portal} target="_blank" rel="noopener noreferrer">
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
