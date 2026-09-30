import { OfficePulse, type PulseMarker } from "./office-pulse";
import { MAP_H, MAP_W, VB_H, VB_Y, project } from "./project";
import { WORLD_DOTS } from "./world-dots";

// One stroked path: a zero-length round-capped segment per dot renders as a
// circle of diameter strokeWidth, at a fraction of the markup of <circle>s.
const DOTS_PATH = WORLD_DOTS.map(([lon, lat]) => {
  const { x, y } = project(lon, lat, MAP_W, MAP_H);
  return `M${x} ${y}h0`;
}).join("");

export interface OfficeMapProps {
  markers: PulseMarker[];
  className?: string;
}

/**
 * Decorative dotted world map with a pulsing brand marker per office.
 * Server-rendered SVG; only the marker pulse is a client island. Hidden from
 * assistive tech: pages render the office addresses as text.
 */
export const OfficeMap = ({ markers, className }: OfficeMapProps) => (
  <div aria-hidden="true" className={`relative${className ? ` ${className}` : ""}`}>
    <svg viewBox={`0 ${VB_Y} ${MAP_W} ${VB_H}`} className="block h-auto w-full" focusable="false">
      <path d={DOTS_PATH} strokeWidth={1.8} strokeLinecap="round" className="stroke-line-strong" fill="none" />
    </svg>
    <OfficePulse markers={markers} />
  </div>
);
