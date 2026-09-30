import { Accordion } from "@/components/ui/accordion";
import { JsonLd } from "@/components/common/json-ld";
import type { Faq } from "@/content/schemas";

export const FaqList = ({ items }: { items: Faq[] }) => (
  <>
    <Accordion items={items.map((f, i) => ({ id: String(i), q: f.q, a: f.a }))} />
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }}
    />
  </>
);
