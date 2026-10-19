"use client";

import { animated, useSpring } from "@react-spring/web";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { ArrowIcon } from "@/components/ui/icons";
import { useScroll } from "@/hooks/smooth-scroll/use-scroll";

import { serviceIcon } from "./service-icons";
import type { ServiceNavGroup } from "./service-nav";

export const MobileMenu = ({ groups, portal }: { groups: ServiceNavGroup[]; portal: string }) => {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  // Declarative: re-targeted by `open`, never self-running. Reduced motion is
  // handled globally (ReducedMotion skips every spring), so it just appears.
  const slide = useSpring({ x: open ? 0 : 100, config: { tension: 260, friction: 30 } });

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
      <animated.div
        ref={panelRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        data-lenis-prevent
        // Close on any link tap — including one to the current route, which
        // doesn't change the pathname and so wouldn't close the menu otherwise.
        onClick={(e) => {
          if ((e.target as Element).closest("a")) setOpen(false);
        }}
        style={{
          transform: slide.x.to((v) => `translateX(${v}%)`),
          visibility: slide.x.to((v) => (v >= 100 ? "hidden" : "visible")),
        }}
        className="fixed inset-0 z-50 overflow-y-auto bg-bg px-gutter pb-10 pt-6 shadow-card"
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
        <nav aria-label="Mobile" className="mt-4 flex flex-col gap-6">
          {groups.map((g) => (
            <div key={g.id}>
              <p className="mb-2 text-kicker uppercase tracking-wider text-brand-glow">
                {g.label}
              </p>
              <ul className="flex flex-col gap-2.5">
                {g.items.map((s) => {
                  const Icon = serviceIcon[s.slug];
                  return (
                    <li key={s.slug}>
                      <Link href={`/services/${s.slug}`} className="flex items-start gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-surface text-brand">
                          <Icon />
                        </span>
                        <span>
                          <span className="block text-base">{s.name}</span>
                          <span className="block text-sm text-muted">{s.tagline}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <ul className="flex flex-col gap-3 border-t border-line pt-6 font-display text-xl">
            <li><Link href="/work">Work</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/careers">Careers</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li>
              <a href={portal} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
                Client portal
                <ArrowIcon className="size-[0.9375rem]" aria-hidden="true" />
              </a>
            </li>
          </ul>
          <ButtonLink href="/contact" size="lg">
            Book a free audit
          </ButtonLink>
        </nav>
      </animated.div>
    </>
  );
};
