import { describe, expect, it, vi } from "vitest";

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

vi.mock("electron-log/main", () => ({
  default: {
    info: vi.fn(),
  },
}));

import {
  normalizeTrackAnalysisStory,
  normalizeTrackAnalysisStoryDetail,
} from "./track-analysis";

describe("track-analysis normalization", () => {
  it("normalizes upstream list stories", () => {
    const story = normalizeTrackAnalysisStory({
      case_id: 1001,
      type: "case",
      title: "AI 陪跑行业分析",
      summary: "摘要",
      industry: "咨询",
      cover_image_url: "//www.weelume.com/cover.jpg",
      tags: ["AI", "咨询", "AI"],
      readTime: 6.4,
      published_at: "2026-05-01T00:00:00",
    });

    expect(story).toMatchObject({
      id: "1001",
      type: "case",
      title: "AI 陪跑行业分析",
      industry: "咨询",
      cover_image_url: "https://www.weelume.com/cover.jpg",
      tags: ["AI", "咨询"],
      read_time_text: "6 分钟阅读",
    });
    expect(story?.published_at_text).toContain("2026");
  });

  it("normalizes detail markdown and rejects missing identifiers", () => {
    expect(normalizeTrackAnalysisStory({ title: "无 ID" })).toBeNull();

    const detail = normalizeTrackAnalysisStoryDetail({
      _id: "abc",
      title: "报告详情",
      type: "unknown",
      summary_markdown: "# 标题",
      cover_image_url: "cloud://not-supported",
      documents: {
        business_case: { title: "案例", markdown_content: "case" },
        market_research: { title: "市场", markdown_content: "market" },
        business_model: null,
        ai_business_upgrade: { title: "AI", markdown_content: "ai" },
        how_to_do: { title: "怎么做", markdown_content: "how" },
      },
    });

    expect(detail).toMatchObject({
      id: "abc",
      type: "case",
      title: "报告详情",
      summary_markdown: "# 标题",
      cover_image_url: "",
      documents: {
        business_case: { title: "案例", markdown_content: "case" },
        market_research: { title: "市场", markdown_content: "market" },
        business_model: null,
        ai_business_upgrade: { title: "AI", markdown_content: "ai" },
        how_to_do: { title: "怎么做", markdown_content: "how" },
      },
    });
  });
});
