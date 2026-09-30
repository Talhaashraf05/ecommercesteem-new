import { pageMetadata } from "@/lib/seo";
import { ServicesView } from "@/views/services";

export const metadata = pageMetadata({ title: "Services", description: "Amazon management, Amazon PPC, listings & A+ content, Meta Ads, Google Ads, email marketing and SEO for e-commerce brands.", path: "/services" });

export default function Page() {
  return <ServicesView />;
}
