import { describe, expect, it } from "vitest";
import { formatCount, parseCount } from "./count";
const at = (s: string, v: number) => formatCount(parseCount(s)!, v);
describe("parseCount/formatCount", () => {
  it("handles plus suffix", () => { expect(parseCount("500+")).toMatchObject({ prefix: "", value: 500, suffix: "+" }); expect(at("500+", 250)).toBe("250+"); });
  it("handles sign and percent", () => { expect(at("+142%", 71)).toBe("+71%"); expect(at("-31%", 12)).toBe("-12%"); });
  it("keeps decimals", () => { expect(at("4.1×", 2)).toBe("2.0×"); expect(at("4.1×", 4.1)).toBe("4.1×"); });
  it("keeps comma grouping", () => { expect(at("1,200+", 1200)).toBe("1,200+"); expect(at("1,200+", 999)).toBe("999+"); });
  it("prefix words", () => { expect(at("Top 10", 3)).toBe("Top 3"); });
  it("rejects multiple or no numbers", () => {
    expect(parseCount("0 → 7-figure")).toBeNull();
    expect(parseCount("Custom")).toBeNull();
    expect(parseCount("5.0★")).not.toBeNull();
  });
  it("final value reproduces original", () => {
    for (const s of ["500+", "70+", "1000+", "+142%", "-31%", "4.1×", "Top 10", "5.0★", "$1,485/mo"]) {
      const p = parseCount(s)!; expect(formatCount(p, p.value)).toBe(s);
    }
  });
});
