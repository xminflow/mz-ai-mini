import { describe, expect, it } from "vitest";

import { describeBloggerSampleFailure } from "../sampleFailure";

describe("describeBloggerSampleFailure", () => {
  it("classifies download 403 as supplement-worthy", () => {
    const out = describeBloggerSampleFailure("INTERNAL: GET mp4 → HTTP 403");
    expect(out).toEqual({
      label: "视频下载被平台拒绝（HTTP 403）",
      shouldSupplement: true,
    });
  });

  it("classifies transcript model errors as non-supplementary", () => {
    const out = describeBloggerSampleFailure("TRANSCRIPT_FAILED: boom");
    expect(out).toEqual({
      label: "音频转写失败",
      shouldSupplement: false,
    });
  });
});
