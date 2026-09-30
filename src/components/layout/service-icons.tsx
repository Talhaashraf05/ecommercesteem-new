import {
  ChatIcon,
  DocumentIcon,
  type IconProps,
  MailIcon,
  SearchIcon,
  StorefrontIcon,
  TargetIcon,
  TrendingUpIcon,
} from "@/components/ui/icons";
import type { SERVICE_SLUGS } from "@/content/service-slugs";

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

// Type-only import above: the map never pulls the content barrel into the client bundle.
export const serviceIcon: Record<ServiceSlug, (props: IconProps) => React.JSX.Element> = {
  "amazon-account-management": StorefrontIcon,
  "amazon-ppc": TargetIcon,
  "amazon-listings-a-plus": DocumentIcon,
  "meta-ads": ChatIcon,
  "google-ads": SearchIcon,
  "email-marketing": MailIcon,
  seo: TrendingUpIcon,
};
