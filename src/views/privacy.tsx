import { privacy, site } from "@/content";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";

type Block = { kind: "p"; text: string } | { kind: "ul"; items: string[] };

const MAX_ITEM = 140;

/**
 * Source bullet lists were flattened into paragraphs. A paragraph ending in ":"
 * opens a list; the short paragraphs after it are its items until a long one.
 */
export const toBlocks = (paragraphs: string[]): Block[] => {
  const blocks: Block[] = [];
  for (let i = 0; i < paragraphs.length; i++) {
    const text = paragraphs[i];
    blocks.push({ kind: "p", text });
    if (!text.endsWith(":")) continue;
    const items: string[] = [];
    while (i + 1 < paragraphs.length && paragraphs[i + 1].length <= MAX_ITEM) items.push(paragraphs[++i]);
    if (items.length) blocks.push({ kind: "ul", items });
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
                b.kind === "p" ? (
                  <p key={j}>{b.text}</p>
                ) : (
                  <ul key={j} className="list-disc space-y-2 pl-6 marker:text-brand">
                    {b.items.map((it) => <li key={it}>{it}</li>)}
                  </ul>
                ),
              )}
            </div>
          </section>
        ))}
        <p className="text-muted">
          Questions about this policy? Email{" "}
          <a href={`mailto:${site.privacyEmail}`} className="text-fg underline underline-offset-4 transition-colors duration-200 hover:text-brand-glow">
            {site.privacyEmail}
          </a>
          .
        </p>
      </Container>
    </Section>
  </main>
);
