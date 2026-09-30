export const redirects = [
  { source: "/career", destination: "/careers" },
  { source: "/career-details/:id", destination: "/careers/:id" },
  { source: "/career/form", destination: "/careers" },
  { source: "/casestudy", destination: "/work" },
  { source: "/projects", destination: "/work" },
  { source: "/project", destination: "/work" },
  { source: "/privacy-policy", destination: "/privacy" },
  { source: "/services/amazon", destination: "/services/amazon-account-management" },
  { source: "/services/ftl-shipping", destination: "/services" },
  { source: "/services/web-development", destination: "/services" },
].map((r) => ({ ...r, permanent: true as const }));
