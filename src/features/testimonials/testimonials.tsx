import type { Testimonial } from "@/content/schemas";
import { TestimonialWheel } from "./testimonial-wheel";

// Testimonials section: a full-viewport stage with the wheel of cards between two
// blocks of editorial type — "What clients say" behind the fan (the real h2), "5.0
// Rated" in front. The ring itself is aria-hidden; screen readers get the plain list.
const HEADLINE =
  "pointer-events-none absolute font-display text-[clamp(2.5rem,min(12vw,15.5vh),7.5rem)] font-semibold leading-title tracking-title text-fg";

export const Testimonials = ({ items }: { items: Testimonial[] }) => (
  <section
    aria-labelledby="testimonials-title"
    className="relative h-lvh min-h-[40rem] overflow-hidden bg-bg"
  >
    <h2
      id="testimonials-title"
      className={`${HEADLINE} left-gutter top-24 md:top-32 z-[1] text-left text-[clamp(1.75rem,min(7.2vw,9.4vh),4.8rem)]!`}
    >
      <span className="block">What clients</span>{" "}
      <span className="block">say</span>
    </h2>

    <TestimonialWheel items={items}>
      <ul className="sr-only">
        {items.map((t) => (
          <li key={`${t.name}-${t.date}`}>
            <figure>
              <p>{t.rating} out of 5 stars</p>
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                {t.name} · {t.source} · {t.location ? `${t.location}, ` : ""}
                {t.date}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </TestimonialWheel>

    <p className={`${HEADLINE} bottom-[clamp(0.625rem,2.5vh,2.5rem)] left-1/2 z-[3] -translate-x-1/2 text-center text-[clamp(1.75rem,min(7.2vw,9.4vh),4.8rem)]!`}>
      <span className="block">5.0</span> <span className="block">Rated</span>
    </p>
  </section>
);
