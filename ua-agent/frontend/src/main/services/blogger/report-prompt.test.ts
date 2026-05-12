import { describe, expect, it } from "vitest";

import { buildBloggerReportPrompt } from "./report-prompt";

describe("buildBloggerReportPrompt", () => {
  it("biases the report toward mechanism-level analysis in the main body", () => {
    const prompt = buildBloggerReportPrompt({
      dataRoot: "/tmp/blogger",
      runId: "run-123",
      focusCount: 2,
    });

    expect(prompt).toContain("focus_count: 3");
    expect(prompt).toContain(
      "Prioritize mechanism-level analysis over recap-level summary",
    );
    expect(prompt).toContain("Keep evidence and analysis in the main body.");
    expect(prompt).toContain(
      "Make the seventh chapter the core mechanism section",
    );
    expect(prompt).toContain("<data_root>/analysis.generated.md");
    expect(prompt).toContain(
      "Do not write to <data_root>/analysis.md directly",
    );
    expect(prompt).not.toContain("appendix");
    expect(prompt).not.toContain("data-notes");
    expect(prompt).not.toContain("move dense evidence");
  });
});
