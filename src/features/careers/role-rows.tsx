"use client";

// Open roles as rich rows linking to /careers/[id]. On desktop (a fine pointer that can
// hover) each row expands its first overview paragraph on hover or keyboard focus, via
// a declarative spring toggled by state. On touch the overview is always visible.
import { useState } from "react";
import Link from "next/link";
import { animated, useSpring } from "@react-spring/web";
import type { Job } from "@/content/schemas";
import { HoverRing } from "@/components/ui/hover-ring";
import { ArrowIcon } from "@/components/ui/icons";

const FINE = "(hover: hover) and (pointer: fine)";
const NUDGE = 4; // px the arrow moves up-right while open

const RoleRow = ({ job }: { job: Job }) => {
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false); // spring owns the styles after the first desktop hover/focus
  const [instant, setInstant] = useState(false);
  const { p } = useSpring({ p: open ? 1 : 0, immediate: instant });

  const show = () => {
    if (!window.matchMedia(FINE).matches) return;
    setInstant(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setArmed(true);
    setOpen(true);
  };
  const hide = () => setOpen(false);

  return (
    <HoverRing className="rounded-3xl">
      <Link
        href={`/careers/${job.id}`}
        onPointerEnter={show}
        onPointerLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="group flex items-start gap-6 rounded-3xl border border-line bg-surface-glass p-6 backdrop-blur-md transition-colors duration-200 hover:bg-surface-glass-hover md:p-8"
      >
        <div className="min-w-0 flex-1">
          <p className="text-kicker capitalize text-muted">{job.category}</p>
          <h3 className="mt-2 font-display text-h3 font-semibold leading-title tracking-title text-fg">{job.title}</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {[job.location, job.type, job.mode, job.experience].map((t) => (
              <li key={t} className="rounded-full border border-line px-3 py-1 text-kicker text-muted">
                {t}
              </li>
            ))}
          </ul>
          {/* A 0fr→1fr grid row animates to the content's height without measuring it.
              Hover devices start collapsed from first paint (classes); touch keeps it open. */}
          <animated.div
            className="grid [@media(hover:hover)_and_(pointer:fine)]:grid-rows-[0fr] [@media(hover:hover)_and_(pointer:fine)]:opacity-0"
            style={armed ? { gridTemplateRows: p.to((v) => `${v}fr`), opacity: p } : undefined}
          >
            <div className="min-h-0 overflow-hidden">
              <p className="line-clamp-2 max-w-3xl pt-4 text-muted">{job.overview[0]}</p>
            </div>
          </animated.div>
        </div>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface-raised text-fg transition-colors duration-200 group-hover:border-brand group-hover:bg-brand-strong group-focus-visible:border-brand group-focus-visible:bg-brand-strong">
          <animated.span
            aria-hidden="true"
            className="flex"
            style={{ transform: p.to((v) => `translate(${v * NUDGE}px, ${-v * NUDGE}px)`) }}
          >
            <ArrowIcon className="size-4" />
          </animated.span>
        </span>
      </Link>
    </HoverRing>
  );
};

export const RoleRows = ({ jobs }: { jobs: Job[] }) => (
  <ul className="grid gap-4">
    {jobs.map((job) => (
      <li key={job.id}>
        <RoleRow job={job} />
      </li>
    ))}
  </ul>
);
