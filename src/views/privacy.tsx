import { privacy } from "@/content";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";

type Block = { kind: "p"; text: string } | { kind: "email"; address: string } | { kind: "ul"; items: string[] };

const EMAIL = /^\S+@\S+\.\S+$/;

const MAX_ITEM = 140;

/**
 * Source bullet lists were flattened into paragraphs. A paragraph ending in ":"
 * opens a list; the short paragraphs after it are its items until a long one.
 */
export const toBlocks = (paragraphs: string[]): Block[] => {
  const blocks: Block[] = [];
  const pushPlain = (text: string) =>
    blocks.push(EMAIL.test(text) ? { kind: "email", address: text } : { kind: "p", text });
  for (let i = 0; i < paragraphs.length; i++) {
    const text = paragraphs[i];
    pushPlain(text);
    if (!text.endsWith(":")) continue;
    let end = i + 1;
    while (end < paragraphs.length && paragraphs[end].length <= MAX_ITEM) end++;
    const items = paragraphs.slice(i + 1, end);
    if (items.length >= 2 && !items.some((it) => EMAIL.test(it))) {
      blocks.push({ kind: "ul", items });
      i = end - 1;
    }
  }
  return blocks;
};

export const PrivacyView = () => (
  <main id="main">
    <PageHero eyebrow="Legal" title="Privacy Policy" lead={`Last updated: ${privacy.updated}`} />
    <Section label="Privacy policy" className="!pt-0">
      <Container width="lead" className="space-y-12">
        {privacy.sections.map((s, i) => (
          <section key={s.heading} aria-labelledby={`privacy-${i}`}>
            <h2 id={`privacy-${i}`} className="font-display text-lead text-fg">{s.heading}</h2>
            <div className="mt-4 space-y-4 text-muted">
              {toBlocks(s.paragraphs).map((b, j) =>
                b.kind === "ul" ? (
                  <ul key={j} className="list-disc space-y-2 pl-6 marker:text-brand">
                    {b.items.map((it, k) => <li key={k}>{it}</li>)}
                  </ul>
                ) : b.kind === "email" ? (
                  <p key={j}>
                    <a href={`mailto:${b.address}`} className="text-fg underline underline-offset-4 transition-colors duration-200 hover:text-brand-glow">
                      {b.address}
                    </a>
                  </p>
                ) : (
                  <p key={j}>{b.text}</p>
                ),
              )}
            </div>
          </section>
        ))}
      </Container>
    </Section>
  </main>
);
