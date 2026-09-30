import { ButtonLink } from "@/components/ui/button";

/**
 * 404 page. Rendered for unmatched routes and `notFound()` calls; Next serves
 * it with a 404 status, so crawlers see a proper not-found response.
 */
export default function NotFound() {
  return (
    <main id="main" className="flex min-h-[80vh] flex-col items-center justify-center px-gutter pb-24 pt-40 text-center">
      <p className="text-kicker text-brand-glow">404</p>
      <h1 className="mt-6 font-display text-display-sm font-semibold text-fg">This page doesn&apos;t exist</h1>
      <p className="mt-4 text-lead text-muted">It may have moved when we rebuilt the site.</p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <ButtonLink href="/">Home</ButtonLink>
        <ButtonLink href="/services" variant="secondary">Services</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">Contact</ButtonLink>
      </div>
    </main>
  );
}
