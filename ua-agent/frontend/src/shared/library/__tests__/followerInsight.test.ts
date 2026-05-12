import { describe, expect, it } from "vitest";

import type { MaterialEntry } from "@/shared/contracts/capture";

import { isLowFollowerHighLike } from "../followerInsight";

function entry(like: number, follower: number | null): MaterialEntry {
  return {
    post_id: "p",
    post_id_source: "share_url_canonical",
    share_url: "https://www.douyin.com/video/p",
    share_text: "https://www.douyin.com/video/p",
    caption: "",
    author_handle: "a",
    author_display_name: null,
    hashtags: [],
    music_id: null,
    music_title: null,
    like_count: like,
    comment_count: -1,
    share_count: -1,
    collect_count: -1,
    author_follower_count: follower,
    captured_at: "2026-05-05T00:00:00.000Z",
    captured_by_device: "web:keyword:test",
    note_type: "video",
    platform: "douyin",
    media_kind: "video",
    image_urls: null,
    comments: [],
    transcript: null,
    transcribed_at: null,
  };
}

describe("isLowFollowerHighLike", () => {
  it("returns false when follower count is null (capture failed)", () => {
    expect(isLowFollowerHighLike(entry(1000, null))).toBe(false);
  });

  it("returns false when follower count is 0 (defensive against legacy rows)", () => {
    expect(isLowFollowerHighLike(entry(1000, 0))).toBe(false);
  });

  it("returns false when likes are below followers", () => {
    expect(isLowFollowerHighLike(entry(50, 100))).toBe(false);
  });

  it("returns true when likes equal followers (lenient rule covers equality)", () => {
    expect(isLowFollowerHighLike(entry(100, 100))).toBe(true);
  });

  it("returns true when likes exceed followers", () => {
    expect(isLowFollowerHighLike(entry(200, 100))).toBe(true);
  });
});
