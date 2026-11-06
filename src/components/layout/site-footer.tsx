import Link from "next/link";

import { offices, services, site } from "@/content";
import { ButtonLink } from "@/components/ui/button";
import { MailIcon, TrendingUpIcon } from "@/components/ui/icons";

import { Logo } from "./logo";

const LINK = "rounded-md text-muted transition-colors duration-200 hover:text-fg";
const HEADING = "mb-5 text-kicker uppercase tracking-wider text-brand-glow";

const COMPANY = [
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
] as const;

/** LinkedIn glyph — decorative, inherits `currentColor` like the icon set. */
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.64h.05c.53-.95 1.82-1.95 3.75-1.95 4 0 4.75 2.5 4.75 5.76V21h-4v-5.78c0-1.38-.03-3.15-1.96-3.15-1.96 0-2.26 1.5-2.26 3.05V21H9z" />
  </svg>
);

export const SiteFooter = () => (
  <footer className="border-t border-line bg-surface px-gutter pb-10 pt-20">
    <div className="mx-auto max-w-page">
      {/* Call-to-action band */}
      <div className="relative overflow-hidden rounded-3xl border border-line-strong bg-surface-raised px-8 py-12 shadow-card md:px-12 md:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand)_28%,transparent),transparent_70%)] blur-2xl"
        />
        <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-title-sm">
            <p className="mb-3 text-kicker uppercase tracking-wider text-brand-glow">
              {site.tagline}
            </p>
            <h2 className="text-display-sm font-display font-semibold leading-title tracking-title">
              Ready to <span className="text-gradient-brand">grow your brand</span> on Amazon?
            </h2>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <ButtonLink href="/contact" withArrow>
              Start a project
            </ButtonLink>
            <ButtonLink href={site.portal} variant="secondary" external>
              Client portal
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* Brand + link columns */}
      <div className="mt-16 grid gap-12 md:grid-cols-5">
        <div className="flex flex-col gap-5 md:col-span-1">
          <Logo />
          <p className="max-w-lead-sm text-sm text-muted">
            E-commerce growth for brands on Amazon.
          </p>
          <a
            href={site.linkedin}
            aria-label="EcommerceSteem on LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-surface-glass text-muted transition-colors duration-200 hover:border-line-strong hover:bg-surface-glass-hover hover:text-fg"
          >
            <LinkedInIcon className="size-4" />
          </a>
        </div>

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
              <a href={`mailto:${site.email}`} className={`inline-flex items-center gap-2 ${LINK}`}>
                <MailIcon className="size-4 shrink-0 text-brand-glow" />
                {site.email}
              </a>
            </li>
            <li>
              <a href={site.phoneHref} className={`inline-flex items-center gap-2 ${LINK}`}>
                <TrendingUpIcon className="size-4 shrink-0 text-brand-glow" />
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
                <span className="block font-medium text-fg">{o.country}</span>
                <address className="not-italic">{o.address}</address>
                {o.phone && <span className="block">{o.phone}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
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
