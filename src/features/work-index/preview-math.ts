/**
 * Where the work index's floating preview goes for a pointer at (`px`, `py`):
 * `offset` px right of the cursor and vertically centred on it, flipped to the
 * cursor's left when it would cross the right edge, then clamped so it keeps
 * `margin` px from every viewport edge.
 */
export const previewPosition = (
  px: number, py: number,            // pointer
  w: number, h: number,              // preview size
  vw: number, vh: number,            // viewport
  offset = 24, margin = 16,
) => {
  let x = px + offset, y = py - h / 2;
  if (x + w > vw - margin) x = px - offset - w;   // flip to left of cursor
  x = Math.min(Math.max(x, margin), vw - margin - w);
  y = Math.min(Math.max(y, margin), vh - margin - h);
  return { x, y };
};
