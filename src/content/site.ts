import type { Site } from "./schemas";
import { CONTACT_EMAIL, SITE_NAME } from "./site-basics";

export const site: Site = {
  name: SITE_NAME,
  tagline: "Build. Grow. Scale.",
  email: CONTACT_EMAIL,
  privacyEmail: "privacy@ecommercesteem.com",
  phone: "+1 (307) 243-8623",
  phoneHref: "tel:+13072438623",
  hours: "Mon–Fri, 9 AM–6 PM EST",
  linkedin: "https://www.linkedin.com/company/ecommercesteem-ltd",
  portal: "https://portal.ecommercesteem.com/",
  parentCompany: { name: "Dev Steem LTD", address: "82a James Carter Road, IP28 7DE, United Kingdom" },
  disclaimer:
    "EcommerceSteem is an independent service provider and is not affiliated with or endorsed by Amazon. We access Amazon seller data solely on behalf of individual sellers with their explicit consent, for the purpose of providing account management services. We do not aggregate, combine, or share data across multiple seller accounts.",
  about: {
    story:
      "EcommerceSteem was founded with one vision: to make e-commerce growth simple, effective, and accessible for businesses of all sizes. What started as a small, passionate team of marketers has evolved into a full-service digital solutions provider, serving clients worldwide.",
    missionTitle: "Driving growth, building trust, creating impact",
    mission:
      "At EcommerceSteem, our mission is simple yet powerful: to empower businesses with end-to-end digital solutions that deliver measurable growth. We combine creativity, technology, and strategy to help our clients achieve their goals, enhance their brand presence, and maximize ROI.",
  },
};
