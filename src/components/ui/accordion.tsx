"use client";

import { useId, useState } from "react";

export interface AccordionItem { id: string; q: string; a: string }

export const Accordion = ({ items }: { items: AccordionItem[] }) => {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  const base = useId();
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => {
        const isOpen = open === item.id;
        const btnId = `${base}-${item.id}-b`;
        const panelId = `${base}-${item.id}-p`;
        return (
          <div key={item.id}>
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left font-display text-h3 text-fg"
              >
                {item.q}
                <span aria-hidden="true" className={`text-brand ${isOpen ? "rotate-45" : ""}`}>+</span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} hidden={!isOpen} className="pb-6 pr-10 text-lead text-muted">
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
};
