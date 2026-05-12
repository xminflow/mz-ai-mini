import { describe, expect, it } from "vitest";

import { buildContentDiagnosisReportPrompt } from "./report-prompt";

describe("buildContentDiagnosisReportPrompt", () => {
  it("passes xiaohongshu platform context to the report skill", () => {
    const prompt = buildContentDiagnosisReportPrompt({
      dataRoot: "D:/tmp/diagnosis",
      guideRoot: "D:/guide",
      runId: "run-1",
      platform: "xiaohongshu",
    });

    expect(prompt).toContain("- platform: xiaohongshu");
    expect(prompt).toContain("- platform_label: 小红书");
    expect(prompt).toContain("Do not call it 抖音 when platform_label is 小红书");
  });
});
