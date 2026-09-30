import { pageMetadata } from "@/lib/seo";
import { ContactView } from "@/views/contact";

export const metadata = pageMetadata({ title: "Contact", description: "Book a free audit of your Amazon, Meta or Google account.", path: "/contact" });

export default function Page() {
  return <ContactView />;
}
