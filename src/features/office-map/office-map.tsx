import { OfficePulse, type PulseMarker } from "./office-pulse";
import { project } from "./project";
import { WORLD_DOTS } from "./world-dots";

const W = 360;
const H = 180;

export interface OfficeMarker {
  label: string;
  lon: number;
  lat: number;
}

export interface OfficeMapProps {
  markers: OfficeMarker[];
  className?: string;
}

/**
 * Decorative dotted world map with a pulsing brand marker per office.
 * Server-rendered SVG; only the marker pulse is a client island. Hidden from
 * assistive tech: pages render the office addresses as text.
 */
export const OfficeMap = ({ markers, className }: OfficeMapProps) => {
  const pulses: PulseMarker[] = markers.map(({ label, lon, lat }) => {
    const { x, y } = project(lon, lat, W, H);
    return { label, left: +((x / W) * 100).toFixed(3), top: +((y / H) * 100).toFixed(3) };
  });

  return (
    <div aria-hidden="true" className={`relative${className ? ` ${className}` : ""}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" focusable="false">
        {WORLD_DOTS.map(([lon, lat]) => {
          const { x, y } = project(lon, lat, W, H);
          return <circle key={`${lon},${lat}`} cx={x} cy={y} r={0.9} className="fill-line-strong" />;
        })}
      </svg>
      <OfficePulse markers={pulses} />
    </div>
  );
};
