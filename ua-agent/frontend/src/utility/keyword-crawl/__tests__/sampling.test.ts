import { describe, expect, it } from "vitest";

import { stratifiedSample } from "../domain/sampling";

const seed = (n: number): (() => number) => {
  // tiny deterministic LCG so we can assert exact picks per slot.
  let state = n >>> 0 || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

describe("stratifiedSample(items, k)", () => {
  it("returns empty array when items is empty", () => {
    expect(stratifiedSample([], 15)).toEqual([]);
  });

  it("returns all items unchanged when items.length < k", () => {
    const items = [1, 2, 3];
    expect(stratifiedSample(items, 15)).toEqual([1, 2, 3]);
  });

  it("returns all items unchanged when items.length === k", () => {
    const items = Array.from({ length: 15 }, (_, i) => i);
    expect(stratifiedSample(items, 15)).toEqual(items);
  });

  it("returns exactly k items when items.length > k", () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    expect(stratifiedSample(items, 15)).toHaveLength(15);
  });

  it("returns picks in source order (strictly increasing source indices)", () => {
    const items = Array.from({ length: 1000 }, (_, i) => i);
    const picks = stratifiedSample(items, 15);
    for (let i = 1; i < picks.length; i++) {
      expect(picks[i]).toBeGreaterThan(picks[i - 1] as number);
    }
  });

  it("each pick falls within its bucket [floor(i*N/k), floor((i+1)*N/k))", () => {
    const N = 100;
    const k = 15;
    const items = Array.from({ length: N }, (_, i) => i);
    for (let trial = 0; trial < 25; trial++) {
      const picks = stratifiedSample(items, k);
      expect(picks).toHaveLength(k);
      for (let i = 0; i < k; i++) {
        const lo = Math.floor((i * N) / k);
        const hi = Math.floor(((i + 1) * N) / k);
        expect(picks[i]).toBeGreaterThanOrEqual(lo);
        expect(picks[i]).toBeLessThan(hi);
      }
    }
  });

  it("handles items.length = k + 1 (every bucket has at least 1 candidate)", () => {
    const items = Array.from({ length: 16 }, (_, i) => i);
    const picks = stratifiedSample(items, 15);
    expect(picks).toHaveLength(15);
    // bucket size is 16/15 ≈ 1.07 → some buckets size 1, some size 2
    const seen = new Set(picks);
    expect(seen.size).toBe(15);
  });

  it("uses the provided rng to make sampling deterministic", () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    const picksA = stratifiedSample(items, 15, seed(42));
    const picksB = stratifiedSample(items, 15, seed(42));
    expect(picksA).toEqual(picksB);
  });

  it("k = 1 returns a single item from the entire range", () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    const picks = stratifiedSample(items, 1);
    expect(picks).toHaveLength(1);
    expect(picks[0]).toBeGreaterThanOrEqual(0);
    expect(picks[0]).toBeLessThan(100);
  });

  it("throws on non-positive k", () => {
    expect(() => stratifiedSample([1, 2, 3], 0)).toThrowError(/k must be/);
    expect(() => stratifiedSample([1, 2, 3], -1)).toThrowError(/k must be/);
  });

  it("works for objects, not just numbers", () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `n${i}` }));
    const picks = stratifiedSample(items, 15);
    expect(picks).toHaveLength(15);
    for (const p of picks) {
      expect(typeof p.id).toBe("number");
      expect(p.name).toBe(`n${p.id}`);
    }
  });
});
