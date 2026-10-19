"use client";

// A row of client logos whose horizontal motion is tied to scroll position,
// not autoplay. Ported from Stride's logo marquee. The list is
// repeated COPIES times and each row's translate is wrapped into the [-ONE_SET, 0]
// band, so it's seamless and always filled edge-to-edge at any width. A react-spring
// value follows a low-passed scroll offset fed by the shared ticker (ADR-0015: no
// self-running springs). Reduced motion: no subscription, rows stay static.
import { useEffect, useRef } from "react";
import Image from "next/image";
import { animated, useSpringValue } from "@react-spring/web";
import type { Client } from "@/content/schemas";
import { subscribeToTicker } from "@/lib/animation/ticker";

export interface LogoMarqueeProps {
  clients: Client[];
  label: string;
}

const COPIES = 6; // repeats of the set; half the track always overflows the viewport
const ONE_SET = 100 / COPIES; // percent width of one set
const FOLLOW = 0.08; // per-frame low-pass toward the scroll target (soft drift)
const LOGO_HEIGHT_REM = 2.25; // matches h-9

const Row = ({
  clients,
  direction,
  speed,
  primary,
}: {
  clients: Client[];
  direction: "left" | "right";
  speed: number;
  /** Only the first row's first copy is exposed to assistive tech. */
  primary: boolean;
}) => {
  // `s` chases the scroll offset (px * speed). The wrap into [0, ONE_SET) happens in
  // the interpolation, so the value itself never jumps.
  const s = useSpringValue(0);
  const currentRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    currentRef.current = window.scrollY * speed;
    s.set(currentRef.current);
    return subscribeToTicker(
      () => {
        const target = window.scrollY * speed;
        const next = currentRef.current + (target - currentRef.current) * FOLLOW;
        if (Math.abs(next - currentRef.current) < 1e-5) return;
        currentRef.current = next;
        s.set(next);
      },
      () => 0,
    );
  }, [s, speed]);

  const transform = s.to((v) => {
    const m = ((v % ONE_SET) + ONE_SET) % ONE_SET; // 0..ONE_SET
    const off = direction === "left" ? -m : -(ONE_SET - m); // stays in [-ONE_SET, 0]
    return `translate3d(${off}%,0,0)`;
  });

  return (
    <div className="flex overflow-hidden" aria-hidden={primary ? undefined : true}>
      <animated.div
        style={{ transform }}
        className="flex w-max shrink-0 items-center [will-change:transform]"
      >
        {Array.from({ length: COPIES }).flatMap((_, c) =>
          clients.map((client, i) => {
            const exposed = primary && c === 0;
            return (
              <span
                key={`${c}-${i}`}
                aria-hidden={exposed ? undefined : true}
                className="flex shrink-0 items-center pr-20"
              >
                <Image
                  src={client.logo}
                  alt={exposed ? client.name : ""}
                  width={client.width}
                  height={client.height}
                  // Explicit rendered width (h-9 = 2.25rem at the logo's aspect) rather
                  // than `w-auto`, so lazy-loaded copies have definite dimensions.
                  style={{ width: `${(LOGO_HEIGHT_REM * client.width) / client.height}rem` }}
                  className="h-9 opacity-60 brightness-0 invert"
                />
              </span>
            );
          }),
        )}
      </animated.div>
    </div>
  );
};

export const LogoMarquee = ({ clients, label }: LogoMarqueeProps) => (
  <section aria-label={label} className="overflow-hidden border-y border-line py-12">
    <Row clients={clients} direction="left" speed={0.005} primary />
  </section>
);
