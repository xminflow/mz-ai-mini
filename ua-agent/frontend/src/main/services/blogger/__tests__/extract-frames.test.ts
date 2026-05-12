import { describe, expect, it } from "vitest";

import { awemeIdFromUrl, sampleTimestamps } from "../extract-frames";

describe("sampleTimestamps", () => {
  it("first frame is t=0 (cover) and remaining 3 are evenly spaced quarter-points", () => {
    expect(sampleTimestamps(80)).toEqual([0, 20, 40, 60]);
  });

  it("first frame is always t=0 regardless of count", () => {
    expect(sampleTimestamps(8, 2)).toEqual([0, 4]);
    expect(sampleTimestamps(60, 3)).toEqual([0, 20, 40]);
  });

  it("yields no timestamps for zero or negative duration", () => {
    expect(sampleTimestamps(0)).toEqual([]);
    expect(sampleTimestamps(-1)).toEqual([]);
    expect(sampleTimestamps(Number.NaN)).toEqual([]);
  });

  it("avoids the very last frame (fade-out)", () => {
    const stamps = sampleTimestamps(100);
    expect(stamps[stamps.length - 1]).toBeLessThan(100);
  });
});

describe("awemeIdFromUrl", () => {
  it("parses canonical douyin video URL", () => {
    expect(awemeIdFromUrl("https://www.douyin.com/video/7311111111111111111")).toBe(
      "7311111111111111111",
    );
  });

  it("falls back to a sha1 prefix for non-matching URLs", () => {
    const id = awemeIdFromUrl("https://example.com/some/other/path");
    expect(id).toMatch(/^[a-f0-9]{12}$/);
  });
});
