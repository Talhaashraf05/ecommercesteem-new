// The two site facts client components need (error pages, form fallbacks).
// Kept apart from site.ts so a client import doesn't ship the full site copy
// (about text, disclaimer…) into every page's first-load JS. site.ts re-uses them.
export const SITE_NAME = "EcommerceSteem";
export const CONTACT_EMAIL = "info@ecommercesteem.com";
