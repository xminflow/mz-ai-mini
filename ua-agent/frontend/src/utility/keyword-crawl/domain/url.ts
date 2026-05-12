/**
 * URL helpers for the keyword-driven multi-platform crawl loop.
 *
 * - `searchUrlFor(platform, keyword)` — builds the canonical search URL for
 *   the requested platform (FR-011). RFC 3986 percent-encoding via
 *   `encodeURIComponent`.
 * - `canonicalizeDouyinUrl(rawHref)` — normalises Douyin aweme URLs into
 *   `https://www.douyin.com/video/<id>` and extracts the `post_id` used as
 *   the `material_entries.post_id` PRIMARY KEY.
 * - `canonicalizeXhsNoteUrl(rawHref)` — XHS note canonicalisation;
 *   preserves `xsec_token` so the user can re-open the note.
 */

import type { Platform } from "@/shared/contracts/capture";

const DOUYIN_SEARCH_BASE = "https://www.douyin.com/jingxuan/search/" as const;
const XHS_SEARCH_BASE = "https://www.xiaohongshu.com/search_result" as const;

/**
 * 006 — Single dispatcher: callers pass the platform alongside the
 * keyword. `Platform = "douyin" | "xiaohongshu"`. The legacy single-arg
 * form is kept as `searchUrlForDouyin` for tests that pre-date 006.
 */
export function searchUrlFor(platform: Platform, keyword: string): string {
  if (platform === "douyin") return searchUrlForDouyin(keyword);
  return searchUrlForXhs(keyword);
}

export function searchUrlForDouyin(keyword: string): string {
  const trimmed = keyword.trim();
  if (trimmed.length === 0) {
    throw new Error("searchUrlFor: keyword must be non-empty after trim");
  }
  return `${DOUYIN_SEARCH_BASE}${encodeURIComponent(trimmed)}`;
}

export function searchUrlForXhs(keyword: string): string {
  const trimmed = keyword.trim();
  if (trimmed.length === 0) {
    throw new Error("searchUrlFor: keyword must be non-empty after trim");
  }
  return `${XHS_SEARCH_BASE}?keyword=${encodeURIComponent(trimmed)}&source=web_explore_feed`;
}

export interface CanonicalDouyinPost {
  url: string;
  postId: string;
}

export interface CanonicalXhsNote {
  /** Canonical share URL — explore path with xsec_token preserved when present. */
  url: string;
  /** Note id used as primary dedup key for XHS material_entries rows. */
  noteId: string;
}

const VIDEO_LONG_RE = /^\/video\/([0-9A-Za-z_-]{6,32})\/?$/;
const NOTE_LONG_RE = /^\/note\/([0-9A-Za-z_-]{6,32})\/?$/;
const ID_RE = /^[0-9A-Za-z_-]{6,32}$/;

const USER_PATH_RE = /^\/user\/([0-9A-Za-z_-]{1,256})\/?$/;

export interface CanonicalDouyinUser {
  /** Canonical profile URL — `https://www.douyin.com/user/<sec_uid>` (no query/hash). */
  url: string;
  /** Sec_uid extracted from the path. Same value used as `bloggers.sec_uid`. */
  secUid: string;
}

/**
 * Normalise a Douyin blogger profile URL into the canonical form
 * `https://www.douyin.com/user/<sec_uid>`, dropping query strings and hashes
 * so the same blogger doesn't get stored twice when copied from different
 * surfaces (`?from_tab_name=...` etc.).
 *
 * Returns `null` for non-Douyin URLs, `/video/...` URLs, or malformed input.
 */
export function canonicalizeDouyinUserUrl(rawHref: string): CanonicalDouyinUser | null {
  if (typeof rawHref !== "string" || rawHref.length === 0) return null;
  let parsed: URL;
  try {
    parsed = new URL(rawHref);
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  const host = parsed.hostname.toLowerCase();
  if (host !== "www.douyin.com" && host !== "douyin.com") return null;
  const m = parsed.pathname.match(USER_PATH_RE);
  if (m === null || m[1] === undefined) return null;
  const secUid = m[1];
  return { url: `https://www.douyin.com/user/${secUid}`, secUid };
}

export function canonicalizeDouyinUrl(rawHref: string): CanonicalDouyinPost | null {
  if (typeof rawHref !== "string" || rawHref.length === 0) return null;
  let parsed: URL;
  try {
    parsed = new URL(rawHref);
  } catch {
    return null;
  }
  const host = parsed.hostname.toLowerCase();
  if (host !== "www.douyin.com" && host !== "douyin.com" && host !== "v.douyin.com") {
    return null;
  }

  // Long form: https://www.douyin.com/video/<aweme_id>
  const videoMatch = parsed.pathname.match(VIDEO_LONG_RE);
  if (videoMatch !== null && videoMatch[1] !== undefined) {
    const id = videoMatch[1];
    return { url: `https://www.douyin.com/video/${id}`, postId: id };
  }
  const noteMatch = parsed.pathname.match(NOTE_LONG_RE);
  if (noteMatch !== null && noteMatch[1] !== undefined) {
    const id = noteMatch[1];
    return { url: `https://www.douyin.com/note/${id}`, postId: id };
  }

  // Modal form (browse-mode in search results, discover, etc.):
  //   https://www.douyin.com/search/<keyword>?modal_id=<aweme_id>
  // The viewer is a modal layered on the underlying page, so location.href
  // never carries a /video/ pathname even though we're focused on a real post.
  const modalId = parsed.searchParams.get("modal_id");
  if (modalId !== null && ID_RE.test(modalId)) {
    return { url: `https://www.douyin.com/video/${modalId}`, postId: modalId };
  }

  // v.douyin.com/<short>/  — short link; we cannot resolve without HTTP, so
  // return null and let the executor skip it as an extraction error.
  return null;
}

const XHS_NOTE_ID_RE = /^[0-9A-Za-z]{8,32}$/;
const XHS_EXPLORE_PATH_RE = /^\/explore\/([0-9A-Za-z]{8,32})\/?$/;
const XHS_DISCOVERY_PATH_RE = /^\/discovery\/item\/([0-9A-Za-z]{8,32})\/?$/;

/**
 * 006 — Normalise a raw XHS card / detail href into a canonical share URL
 * plus note id for storage. Returns `null` if the href is unrecognised.
 *
 * Ported from the orphan utility/xhs-keyword-crawl/domain/url.ts; the orphan
 * file is deleted in PR 3-C.
 */
export function canonicalizeXhsNoteUrl(rawHref: string): CanonicalXhsNote | null {
  if (typeof rawHref !== "string" || rawHref.length === 0) return null;
  let parsed: URL;
  try {
    parsed = new URL(rawHref, "https://www.xiaohongshu.com");
  } catch {
    return null;
  }
  const host = parsed.hostname.toLowerCase();
  if (host !== "www.xiaohongshu.com" && host !== "xiaohongshu.com") {
    return null;
  }

  let noteId: string | null = null;
  const explore = parsed.pathname.match(XHS_EXPLORE_PATH_RE);
  if (explore !== null && explore[1] !== undefined && XHS_NOTE_ID_RE.test(explore[1])) {
    noteId = explore[1];
  } else {
    const discovery = parsed.pathname.match(XHS_DISCOVERY_PATH_RE);
    if (
      discovery !== null &&
      discovery[1] !== undefined &&
      XHS_NOTE_ID_RE.test(discovery[1])
    ) {
      noteId = discovery[1];
    }
  }
  if (noteId === null) return null;

  // Build a clean canonical URL: explore/<id>?xsec_token=...&xsec_source=pc_search
  // We keep xsec_token (required for the user to re-open) but rewrite the
  // path to /explore/<id> regardless of original /discovery/item/<id>.
  const xsecToken = parsed.searchParams.get("xsec_token");
  const out = new URL(`https://www.xiaohongshu.com/explore/${noteId}`);
  if (xsecToken !== null && xsecToken.length > 0) {
    out.searchParams.set("xsec_token", xsecToken);
    out.searchParams.set("xsec_source", "pc_search");
  }
  return { url: out.toString(), noteId };
}
