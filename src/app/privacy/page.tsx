import { pageMetadata } from "@/lib/seo";
import { PrivacyView } from "@/views/privacy";

export const metadata = pageMetadata({ title: "Privacy Policy", description: "How EcommerceSteem collects, uses and protects your information.", path: "/privacy" });

export default function Page() {
  return <PrivacyView />;
}
