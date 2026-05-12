import { describe, expect, it } from "vitest";

import { canonicalizeDouyinUrl, canonicalizeDouyinUserUrl, searchUrlFor } from "../domain/url";

describe("searchUrlFor — RFC 3986 percent-encoding", () => {
  it("encodes Chinese characters", () => {
    expect(searchUrlFor("douyin", "前端")).toBe(
      "https://www.douyin.com/jingxuan/search/%E5%89%8D%E7%AB%AF",
    );
  });

  it("encodes URL-unsafe characters and spaces", () => {
    expect(searchUrlFor("douyin", "a b/c?d#e%f")).toBe(
      "https://www.douyin.com/jingxuan/search/a%20b%2Fc%3Fd%23e%25f",
    );
  });

  it("encodes emoji as multi-byte percent-encoding", () => {
    const out = searchUrlFor("douyin", "😀");
    expect(out).toMatch(/^https:\/\/www\.douyin\.com\/jingxuan\/search\/%/);
    expect(out).toContain("%F0%9F%98%80");
  });

  it("trims input before encoding", () => {
    expect(searchUrlFor("douyin", "  hello  ")).toBe(
      "https://www.douyin.com/jingxuan/search/hello",
    );
  });

  it("throws on empty or whitespace-only input", () => {
    expect(() => searchUrlFor("douyin", "")).toThrowError(/non-empty/);
    expect(() => searchUrlFor("douyin", "   ")).toThrowError(/non-empty/);
  });
});

describe("canonicalizeDouyinUrl", () => {
  it("normalises long-form video URLs to www.douyin.com/video/<id>", () => {
    expect(
      canonicalizeDouyinUrl("https://www.douyin.com/video/abc123XYZ?modal_id=1"),
    ).toEqual({ url: "https://www.douyin.com/video/abc123XYZ", postId: "abc123XYZ" });
  });

  it("normalises douyin.com (no www) host", () => {
    expect(canonicalizeDouyinUrl("https://douyin.com/video/abcdef")).toEqual({
      url: "https://www.douyin.com/video/abcdef",
      postId: "abcdef",
    });
  });

  it("returns null for short v.douyin.com links (no HTTP resolution)", () => {
    expect(canonicalizeDouyinUrl("https://v.douyin.com/aBcDeF/")).toBeNull();
  });

  it("normalises browse-mode modal URLs (?modal_id=) to /video/<id>", () => {
    expect(
      canonicalizeDouyinUrl(
        "https://www.douyin.com/search/%E5%89%8D%E7%AB%AF?modal_id=7601644926745758388",
      ),
    ).toEqual({
      url: "https://www.douyin.com/video/7601644926745758388",
      postId: "7601644926745758388",
    });
  });

  it("ignores modal_id when shape is invalid", () => {
    expect(
      canonicalizeDouyinUrl("https://www.douyin.com/search/x?modal_id=abc"),
    ).toBeNull();
    expect(
      canonicalizeDouyinUrl("https://www.douyin.com/search/x?modal_id="),
    ).toBeNull();
  });

  it("returns null for non-douyin URLs", () => {
    expect(canonicalizeDouyinUrl("https://example.com/video/x")).toBeNull();
  });

  it("returns null for malformed input", () => {
    expect(canonicalizeDouyinUrl("not a url")).toBeNull();
    expect(canonicalizeDouyinUrl("")).toBeNull();
  });
});

describe("canonicalizeDouyinUserUrl", () => {
  it("strips the from_tab_name query param", () => {
    const raw =
      "https://www.douyin.com/user/MS4wLjABAAAAjb1juHnK9tygA0nuoGgSEMW7ZuJzXNnTMx9XwaQh19k?from_tab_name=main";
    expect(canonicalizeDouyinUserUrl(raw)).toEqual({
      url: "https://www.douyin.com/user/MS4wLjABAAAAjb1juHnK9tygA0nuoGgSEMW7ZuJzXNnTMx9XwaQh19k",
      secUid: "MS4wLjABAAAAjb1juHnK9tygA0nuoGgSEMW7ZuJzXNnTMx9XwaQh19k",
    });
  });

  it("strips multiple query params and the fragment", () => {
    expect(
      canonicalizeDouyinUserUrl(
        "https://www.douyin.com/user/abcDEF_-123?from=feed&modal_id=1#section",
      ),
    ).toEqual({
      url: "https://www.douyin.com/user/abcDEF_-123",
      secUid: "abcDEF_-123",
    });
  });

  it("normalises the bare douyin.com host", () => {
    expect(canonicalizeDouyinUserUrl("https://douyin.com/user/abcDEF")).toEqual({
      url: "https://www.douyin.com/user/abcDEF",
      secUid: "abcDEF",
    });
  });

  it("returns null for non-douyin hosts", () => {
    expect(canonicalizeDouyinUserUrl("https://example.com/user/abc")).toBeNull();
    expect(
      canonicalizeDouyinUserUrl("https://www.xiaohongshu.com/user/profile/abc"),
    ).toBeNull();
  });

  it("returns null for /video/ paths", () => {
    expect(canonicalizeDouyinUserUrl("https://www.douyin.com/video/abc123")).toBeNull();
  });

  it("returns null for missing sec_uid", () => {
    expect(canonicalizeDouyinUserUrl("https://www.douyin.com/user/")).toBeNull();
    expect(canonicalizeDouyinUserUrl("https://www.douyin.com/user")).toBeNull();
  });

  it("returns null for malformed input", () => {
    expect(canonicalizeDouyinUserUrl("not a url")).toBeNull();
    expect(canonicalizeDouyinUserUrl("")).toBeNull();
  });

  it("rejects non-http(s) protocols", () => {
    expect(canonicalizeDouyinUserUrl("ftp://www.douyin.com/user/abc")).toBeNull();
  });
});
