import { pageMetadata } from "@/lib/seo";
import { AboutView } from "@/views/about";

export const metadata = pageMetadata({ title: "About", description: "EcommerceSteem is an e-commerce growth agency with teams in the US, Albania and Pakistan.", path: "/about" });

export default function Page() {
  return <AboutView />;
}
