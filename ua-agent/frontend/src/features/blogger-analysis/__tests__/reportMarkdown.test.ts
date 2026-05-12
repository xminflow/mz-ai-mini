import { describe, expect, it } from "vitest";

import {
  parseBloggerReport,
  reportTitle,
  stripReportFrontmatter,
} from "../reportMarkdown";

describe("reportMarkdown", () => {
  it("strips legacy frontmatter before rendering", () => {
    const markdown = [
      "---",
      "runId: abc",
      "generatedAt: 2026-05-06T00:00:00.000Z",
      "---",
      "# 为什么 ta 能跑出来",
      "",
      "正文",
    ].join("\n");

    expect(stripReportFrontmatter(markdown)).not.toContain("runId:");
    expect(stripReportFrontmatter(markdown)).toContain("# 为什么 ta 能跑出来");
  });

  it("splits article and appendix for the new report shape", () => {
    const markdown = [
      "# 为什么 ta 能跑出来",
      "",
      "正文第一段",
      "",
      "## 代表作品拆解",
      "",
      "正文第二段",
      "",
      "## 附录",
      "",
      "### 证据附录",
      "",
      "- 引用 A",
      "",
      "### 数据说明",
      "",
      "- 说明 B",
      "",
      "### 样本索引",
      "",
      "| # | 标题 |",
      "|---|------|",
      "| 1 | 示例 |",
    ].join("\n");

    const parsed = parseBloggerReport(markdown);

    expect(parsed.title).toBe("为什么 ta 能跑出来");
    expect(parsed.articleMarkdown).toContain("## 代表作品拆解");
    expect(parsed.articleMarkdown).not.toContain("## 附录");
    expect(parsed.appendixSections.map((section) => section.title)).toEqual([
      "证据附录",
      "数据说明",
      "样本索引",
    ]);
    expect(parsed.appendixSections[0]?.markdown).toContain("引用 A");
  });

  it("falls back to plain markdown for legacy reports without appendix heading", () => {
    const markdown = [
      "# 博主拆解 · 某某",
      "",
      "## 一、博主画像",
      "",
      "旧报告正文",
      "",
      "## 九、数据完整性说明",
      "",
      "仍然保留在正文 fallback 里",
    ].join("\n");

    const parsed = parseBloggerReport(markdown);

    expect(reportTitle(parsed.articleMarkdown)).toBe("博主拆解 · 某某");
    expect(parsed.appendixSections).toEqual([]);
    expect(parsed.articleMarkdown).toContain("## 九、数据完整性说明");
  });
});
