import { pageMetadata } from "@/lib/seo";
import { CareersView } from "@/views/careers";

export const metadata = pageMetadata({ title: "Careers", description: "Join EcommerceSteem and help ambitious brands grow on Amazon and beyond.", path: "/careers" });

export default function Page() {
  return <CareersView />;
}
