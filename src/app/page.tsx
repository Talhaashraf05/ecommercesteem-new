import { siteConfig } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { HomeView } from "@/views/home";

export const metadata = pageMetadata({ description: siteConfig.description, path: "/" });

export default function Page() {
  return <HomeView />;
}
