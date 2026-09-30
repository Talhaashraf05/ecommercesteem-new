/** Best-effort in-memory fixed-window limiter (per server instance). */
export const createRateLimiter = ({ limit, windowMs }: { limit: number; windowMs: number }) => {
  const hits = new Map<string, { start: number; count: number }>();
  return (key: string, now = Date.now()): boolean => {
    const entry = hits.get(key);
    if (!entry || now - entry.start >= windowMs) {
      hits.set(key, { start: now, count: 1 });
      if (hits.size > 5000) hits.clear();
      return true;
    }
    entry.count += 1;
    return entry.count <= limit;
  };
};
