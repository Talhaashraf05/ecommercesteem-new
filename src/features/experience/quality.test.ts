import { describe, expect, it } from "vitest";
import { pickTier } from "./quality";

const base = { reducedMotion: false, webgl: true, width: 1440, cores: 8, saveData: false };

describe("pickTier", () => {
  it("high on capable desktop", () => expect(pickTier(base)).toBe("high"));
  it("low on phones", () => expect(pickTier({ ...base, width: 390 })).toBe("low"));
  it("low on weak CPUs", () => expect(pickTier({ ...base, cores: 4 })).toBe("low"));
  it("low with save-data", () => expect(pickTier({ ...base, saveData: true })).toBe("low"));
  it("off with reduced motion", () => expect(pickTier({ ...base, reducedMotion: true })).toBe("off"));
  it("off without webgl", () => expect(pickTier({ ...base, webgl: false })).toBe("off"));
});
