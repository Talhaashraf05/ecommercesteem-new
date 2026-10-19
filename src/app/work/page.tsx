import { pageMetadata } from "@/lib/seo";
import { WorkView } from "@/views/work";

export const metadata = pageMetadata({ title: "Work", description: "Case studies from e-commerce brands we've grown on Amazon.", path: "/work" });

export default function Page() {
  return <WorkView />;
}
