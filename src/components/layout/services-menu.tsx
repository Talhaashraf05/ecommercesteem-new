"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { serviceGroups, services } from "@/content";

export const ServicesMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pointerType = useRef("");
  const pathname = usePathname();

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
      className="relative"
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
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
        className="rounded-md text-sm text-muted transition-colors duration-200 hover:text-fg"
      >
        Services
      </button>
      <div
        id="services-panel"
        hidden={!open}
        className="absolute left-1/2 top-full w-[min(56rem,92vw)] -translate-x-1/2 pt-3"
      >
        <div className="grid grid-cols-3 gap-8 rounded-3xl border border-line bg-surface/95 p-8 shadow-card backdrop-blur-xl">
          {serviceGroups.map((g) => (
            <div key={g.id}>
              <p className="mb-4 text-kicker uppercase tracking-wider text-brand">
                {g.label}
              </p>
              <ul className="flex flex-col gap-4">
                {services
                  .filter((s) => s.group === g.id)
                  .map((s) => (
                    <li key={s.slug}>
                      <Link href={`/services/${s.slug}`} className="block rounded-md">
                        <span className="block text-fg">{s.name}</span>
                        <span className="block text-sm text-muted">{s.summary}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
          <Link
            href="/services"
            className="col-span-3 rounded-md text-sm text-fg hover:text-brand-glow"
          >
            All services →
          </Link>
        </div>
      </div>
    </div>
  );
};
