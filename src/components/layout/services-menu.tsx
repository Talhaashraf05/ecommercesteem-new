"use client";

import { animated, useSpring } from "@react-spring/web";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ButtonLink } from "@/components/ui/button";

import { serviceIcon } from "./service-icons";
import type { ServiceNavGroup } from "./service-nav";

export const ServicesMenu = ({ groups }: { groups: ServiceNavGroup[] }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pointerType = useRef("");
  const pathname = usePathname();
  // Declarative: re-targeted by `open`, never self-running. Reduced motion is
  // handled globally (ReducedMotion skips every spring).
  const spring = useSpring({ opacity: open ? 1 : 0, y: open ? 0 : -8 });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
      onBlur={(e) => {
        // Keyboard users tabbing past the panel shouldn't leave it covering the page.
        const next = e.relatedTarget;
        if (next && !e.currentTarget.contains(next)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="services-panel"
        onPointerDown={(e) => {
          pointerType.current = e.pointerType;
        }}
        onClick={() => {
          // Mouse hover already opened the panel; a click must not toggle it shut.
          const mouse = pointerType.current === "mouse";
          pointerType.current = "";
          setOpen((o) => (mouse ? true : !o));
        }}
        // The panel is positioned against the header container, so while open an
        // invisible strip under the trigger bridges the gap down to the panel.
        className={`relative rounded-md text-sm text-muted transition-colors duration-200 hover:text-fg ${
          open ? "after:absolute after:inset-x-0 after:top-full after:h-10" : ""
        }`}
      >
        Services
      </button>
      <div
        id="services-panel"
        inert={!open}
        // Close on any link click, including a link to the current route.
        onClick={(e) => {
          if ((e.target as Element).closest("a")) setOpen(false);
        }}
        className="absolute inset-x-0 top-full mx-auto w-[min(72rem,calc(100%-2*var(--spacing-gutter)))] pt-3"
      >
        <animated.div
          style={{
            opacity: spring.opacity,
            transform: spring.y.to((v) => `translateY(${v}px)`),
            visibility: spring.opacity.to((o) => (o > 0 ? "visible" : "hidden")),
          }}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_14rem] gap-2 rounded-3xl border border-line bg-surface/95 p-3 shadow-card backdrop-blur-xl"
        >
          {groups.map((g) => (
            <div key={g.id} className="min-w-0">
              <p className="flex items-center gap-2 px-3 pb-2 pt-3 text-kicker uppercase tracking-wider text-muted">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
                {g.label}
              </p>
              <ul className="flex flex-col">
                {g.items.map((s) => {
                  const Icon = serviceIcon[s.slug];
                  return (
                    <li key={s.slug} className="min-w-0">
                      <Link
                        href={`/services/${s.slug}`}
                        className="flex items-start gap-3 rounded-2xl px-3 py-2.5 transition-colors duration-200 hover:bg-surface-raised focus-visible:bg-surface-raised"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-bg/60 text-brand">
                          <Icon />
                        </span>
                        <span className="min-w-0">
                          <span className="block whitespace-nowrap text-sm font-medium text-fg">{s.shortName}</span>
                          <span title={s.tagline} className="block truncate whitespace-nowrap text-xs text-muted">{s.tagline}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <div className="flex flex-col justify-between rounded-2xl border border-line bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--brand)_25%,transparent)_0%,transparent_65%)] p-4">
            <div>
              <p className="text-kicker uppercase tracking-wider text-muted">Free audit</p>
              <p className="mt-2 font-display text-h3 text-fg">Not sure where to start?</p>
              <p className="mt-2 text-sm text-muted">
                We&apos;ll review your Amazon, Meta or Google account and show you where the money&apos;s leaking.
              </p>
            </div>
            <div className="mt-4 flex flex-col items-start gap-3">
              <ButtonLink href="/contact" size="md" withArrow>
                Book a free audit
              </ButtonLink>
              <ButtonLink href="/services" variant="ghost" className="text-sm">
                All services →
              </ButtonLink>
            </div>
          </div>
        </animated.div>
      </div>
    </div>
  );
};
