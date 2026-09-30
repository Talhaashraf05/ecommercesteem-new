import Link from "next/link";

import { offices, services, site } from "@/content";

import { Logo } from "./logo";

const LINK = "rounded-md text-muted transition-colors duration-200 hover:text-fg";
const HEADING = "mb-4 text-kicker uppercase tracking-wider text-brand-glow";

const COMPANY = [
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
] as const;

export const SiteFooter = () => (
  <footer className="border-t border-line bg-surface px-gutter pb-10 pt-20">
    <div className="mx-auto max-w-page">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6">
          <Logo />
          <p className="text-muted">
            E-commerce growth for brands on Amazon, Meta and Google.
          </p>
        </div>
        <a
          href={site.linkedin}
          aria-label="EcommerceSteem on LinkedIn"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md text-muted transition-colors duration-200 hover:text-fg"
        >
          LinkedIn
        </a>
      </div>

      <div className="mt-16 grid gap-10 md:grid-cols-4">
        <div>
          <h2 className={HEADING}>Services</h2>
          <ul className="flex flex-col gap-3 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className={LINK}>
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className={HEADING}>Company</h2>
          <ul className="flex flex-col gap-3 text-sm">
            {COMPANY.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className={LINK}>
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className={HEADING}>Contact</h2>
          <ul className="flex flex-col gap-3 text-sm">
            <li>
              <a href={`mailto:${site.email}`} className={LINK}>
                {site.email}
              </a>
            </li>
            <li>
              <a href={site.phoneHref} className={LINK}>
                {site.phone}
              </a>
            </li>
            <li className="text-muted">{site.hours}</li>
          </ul>
        </div>
        <div>
          <h2 className={HEADING}>Offices</h2>
          <ul className="flex flex-col gap-4 text-sm text-muted">
            {offices.map((o) => (
              <li key={o.country}>
                <span className="block text-fg">{o.country}</span>
                <address className="not-italic">{o.address}</address>
                {o.phone && <span className="block">{o.phone}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-16 flex flex-col gap-3 border-t border-line pt-8">
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} EcommerceSteem · A {site.parentCompany.name}{" "}
          company, {site.parentCompany.address}
        </p>
        <p className="text-xs text-muted">{site.disclaimer}</p>
      </div>
    </div>
  </footer>
);
