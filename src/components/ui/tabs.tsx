"use client";

import { useRef } from "react";

export interface TabDef { id: string; label: string }

export const Tabs = ({ tabs, value, onChange, idPrefix }: { tabs: TabDef[]; value: string; onChange: (id: string) => void; idPrefix: string }) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (i + d + tabs.length) % tabs.length;
    refs.current[next]?.focus();
    onChange(tabs[next].id);
  };
  return (
    <div role="tablist" className="flex flex-wrap gap-2">
      {tabs.map((t, i) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => { refs.current[i] = el; }}
            role="tab"
            id={`${idPrefix}-tab-${t.id}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={`h-11 rounded-full px-5 text-sm font-medium transition-colors duration-200 ${selected ? "bg-brand-strong text-fg" : "border border-line text-muted hover:text-fg"}`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
};
