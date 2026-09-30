import { AnimatedHeading } from "@/components/ui/animated-heading";
import { Container } from "@/components/ui/container";
import type { Testimonial } from "@/content/schemas";

const Star = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
    <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
  </svg>
);

export const Testimonials = ({ items }: { items: Testimonial[] }) => (
  <Container>
    <AnimatedHeading id="testimonials-title" as="h2" className="font-display text-display-sm text-fg">
      What clients say
    </AnimatedHeading>
    <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((t) => (
        <figure key={`${t.name}-${t.date}`} className="flex flex-col rounded-3xl border border-line bg-surface p-8">
          <div role="img" aria-label="5 out of 5 stars" className="flex gap-1 text-brand">
            {Array.from({ length: 5 }, (_, i) => <Star key={i} />)}
          </div>
          <blockquote className="mt-6 flex-1 text-fg">{t.quote}</blockquote>
          <figcaption className="mt-6 text-sm text-muted">
            <span className="text-fg">{t.name}</span> · {t.source} · {t.location ? `${t.location}, ` : ""}{t.date}
          </figcaption>
        </figure>
      ))}
    </div>
  </Container>
);
