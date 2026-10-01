// Team grid. Renders nothing until people are added to `src/content/team.ts`.
import Image from "next/image";
import type { TeamMember } from "@/content/schemas";
import { AnimatedHeading } from "@/components/ui/animated-heading";
import { Container } from "@/components/ui/container";
import { RevealGrid } from "@/components/ui/reveal-grid";
import { Section } from "@/components/ui/section";

const HEADING_ID = "team-title";

export interface TeamProps {
  members: TeamMember[];
  heading: string;
}

export const Team = ({ members, heading }: TeamProps) => {
  if (members.length === 0) return null;
  return (
    <Section labelledBy={HEADING_ID}>
      <Container>
        <AnimatedHeading
          as="h2"
          id={HEADING_ID}
          className="font-display text-display-sm font-semibold leading-title tracking-title text-fg"
        >
          {heading}
        </AnimatedHeading>
        <RevealGrid as="ul" itemAs="li" className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {members.map((m) => (
            <figure key={`${m.name}-${m.role}`}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-surface">
                <Image src={m.photo} alt={m.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
              </div>
              <figcaption className="mt-4">
                <span className="block font-display text-h3 font-semibold text-fg">{m.name}</span>
                <span className="mt-1 block text-muted">{m.role}</span>
              </figcaption>
            </figure>
          ))}
        </RevealGrid>
      </Container>
    </Section>
  );
};
