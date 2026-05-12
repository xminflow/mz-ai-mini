import { describe, expect, it } from "vitest";

import { contentDiagnosisSchema } from "./content-diagnosis";
import { hotMaterialAnalysisSchema } from "./hot-material-analysis";

const base = {
  id: "11111111-1111-4111-8111-111111111111",
  platform: "xiaohongshu",
  share_url: "https://www.xiaohongshu.com/explore/abc123XYZ",
  canonical_url: "https://www.xiaohongshu.com/explore/abc123XYZ",
  post_id: "abc123XYZ",
  title: "小红书视频",
  caption: "caption",
  author_handle: "author",
  author_display_name: "作者",
  like_count: 10,
  comment_count: 2,
  share_count: 1,
  collect_count: 3,
  author_follower_count: null,
  status: "captured",
  frames: [],
  transcript: null,
  transcript_lang: null,
  captured_at: "2026-05-12T00:00:00.000Z",
  media_analyzed_at: null,
  analysis_generated_at: null,
  last_error: null,
  created_at: "2026-05-12T00:00:00.000Z",
  updated_at: "2026-05-12T00:00:00.000Z",
} as const;

describe("analysis contracts platform support", () => {
  it("accepts xiaohongshu hot material records", () => {
    expect(hotMaterialAnalysisSchema.parse(base).platform).toBe("xiaohongshu");
  });

  it("accepts xiaohongshu content diagnosis records", () => {
    expect(contentDiagnosisSchema.parse(base).platform).toBe("xiaohongshu");
  });

  it("rejects unknown platforms", () => {
    expect(hotMaterialAnalysisSchema.safeParse({ ...base, platform: "kuaishou" }).success).toBe(
      false,
    );
    expect(contentDiagnosisSchema.safeParse({ ...base, platform: "kuaishou" }).success).toBe(
      false,
    );
  });
});
