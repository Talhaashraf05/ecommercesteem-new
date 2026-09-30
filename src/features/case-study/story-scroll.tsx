"use client";

// Case-study story: challenge, approach and outcome as blocks. On lg each block is two
// columns, with its label (h2) sticky on the left while the content scrolls on the right;
// below lg the blocks stack. Approach steps light up (brand marker, full-contrast text)
// while they sit in the middle band of the viewport: an IntersectionObserver whose root
// is shrunk to that band toggles `data-active` on each step. Colour only, so it runs
// under reduced motion too (without the colour fade).
import { useEffect, useRef } from "react";

export interface StoryBlock {
  label: string;
  kind: "text" | "steps";
  text?: string;
  steps?: string[];
}

const pad = (n: number) => String(n).padStart(2, "0");

export const StoryScroll = ({ blocks }: { blocks: StoryBlock[] }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const steps = rootRef.current?.querySelectorAll<HTMLLIElement>("li[data-step]");
    if (!steps?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.toggleAttribute("data-active", e.isIntersecting);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    steps.forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="flex flex-col">
      {blocks.map((block, i) => {
        const id = `story-${i}`;
        return (
          <section
            key={block.label}
            aria-labelledby={id}
            className="grid gap-8 border-t border-line py-16 first:border-t-0 first:pt-0 last:pb-0 md:py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16"
          >
            <div>
              <h2
                id={id}
                className="flex flex-col gap-4 font-display text-display-sm font-semibold leading-title tracking-title text-fg lg:sticky lg:top-32"
              >
                <span aria-hidden="true" className="text-kicker font-medium tabular-nums tracking-widest text-brand-glow">
                  {pad(i + 1)}
                </span>
                {block.label}
              </h2>
            </div>

            {block.kind === "text" ? (
              <p className="max-w-title font-display text-h3 font-medium leading-snug text-fg lg:pt-2">{block.text}</p>
            ) : (
              <ol className="flex flex-col">
                {block.steps?.map((step, s) => (
                  <li
                    key={step}
                    data-step=""
                    className="group grid grid-cols-[auto_minmax(0,1fr)] gap-6 border-t border-line py-8 transition-colors duration-500 data-active:border-brand motion-reduce:transition-none md:gap-10 md:py-10"
                  >
                    <span
                      aria-hidden="true"
                      className="w-[1.2em] font-display text-stat font-semibold leading-none tabular-nums text-muted transition-colors duration-500 group-data-active:text-brand motion-reduce:transition-none"
                    >
                      {pad(s + 1)}
                    </span>
                    <span className="self-center text-h3 leading-snug text-muted transition-colors duration-500 group-data-active:text-fg motion-reduce:transition-none">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        );
      })}
    </div>
  );
};
