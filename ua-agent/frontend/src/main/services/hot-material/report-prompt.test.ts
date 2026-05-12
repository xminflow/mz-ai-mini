import { describe, expect, it } from "vitest";

import { buildHotMaterialReportPrompt } from "./report-prompt";

describe("buildHotMaterialReportPrompt", () => {
  it("passes xiaohongshu platform context to the report skill", () => {
    const prompt = buildHotMaterialReportPrompt({
      dataRoot: "D:/tmp/hot",
      guideRoot: "D:/guide",
      runId: "run-1",
      platform: "xiaohongshu",
    });

    expect(prompt).toContain("- platform: xiaohongshu");
    expect(prompt).toContain("- platform_label: 小红书");
    expect(prompt).toContain("Do not call it 抖音 when platform_label is 小红书");
  });
});
