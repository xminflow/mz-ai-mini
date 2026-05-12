import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { LibraryStore, _resetSharedStoreForTests } from "../domain/library";
import { KeywordsStore, KeywordValidationError, _resetKeywordsStoreForTests } from "../domain/keywordsStore";

let tmpDir: string;
let dbFile: string;
let store: LibraryStore;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kw-store-"));
  dbFile = path.join(tmpDir, "library.db");
  store = LibraryStore.open(dbFile);
  // Wire up the shared singleton so KeywordsStore.openLibrary() returns ours.
  _resetSharedStoreForTests();
  // Hack: stash via process global since the public API hides it.
  (globalThis as unknown as { __testStore__?: LibraryStore }).__testStore__ = store;
});

afterEach(() => {
  store.close();
  _resetKeywordsStoreForTests();
  _resetSharedStoreForTests();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// We need KeywordsStore to use our test LibraryStore, but it goes through
// `openLibrary()` which lazy-creates a new shared store. Override:
import * as libraryModule from "../domain/library";

beforeEach(() => {
  // Replace openLibrary with one that returns our explicit `store`.
  vi.spyOn(libraryModule, "openLibrary").mockImplementation(() => store);
});

import { vi } from "vitest";

describe("KeywordsStore", () => {
  it("inserts with auto-position; list returns ordered rows", () => {
    const ks = new KeywordsStore();
    const a = ks.create("前端", "douyin");
    const b = ks.create("副业", "douyin");
    const c = ks.create("短视频带货", "douyin");
    expect(a.position).toBe(0);
    expect(b.position).toBe(1);
    expect(c.position).toBe(2);

    const rows = ks.list();
    expect(rows.map((r) => r.text)).toEqual(["前端", "副业", "短视频带货"]);
  });

  it("rejects empty / whitespace-only input as KEYWORD_INVALID", () => {
    const ks = new KeywordsStore();
    expect(() => ks.create("", "douyin")).toThrowError(KeywordValidationError);
    expect(() => ks.create("   ", "douyin")).toThrowError(KeywordValidationError);
  });

  it("rejects over-100-chars after trim", () => {
    const ks = new KeywordsStore();
    const longText = "a".repeat(101);
    try {
      ks.create(longText, "douyin");
      throw new Error("expected throw");
    } catch (e) {
      expect(e).toBeInstanceOf(KeywordValidationError);
      expect((e as KeywordValidationError).kind).toBe("INVALID");
    }
  });

  it("rejects case-insensitive whitespace-tolerant duplicates", () => {
    const ks = new KeywordsStore();
    ks.create("前端", "douyin");
    expect(() => ks.create(" 前端 ", "douyin")).toThrowError(KeywordValidationError);
    expect(() => ks.create("前端", "douyin")).toThrowError(KeywordValidationError);
  });

  it("update changes text and updates updated_at; preserves position", async () => {
    const ks = new KeywordsStore();
    const row = ks.create("foo", "douyin");
    await new Promise((r) => setTimeout(r, 5));
    const updated = ks.update(row.id, { text: "Bar" });
    expect(updated).not.toBeNull();
    expect(updated!.text).toBe("Bar");
    expect(updated!.position).toBe(row.position);
    expect(updated!.updated_at).not.toBe(row.updated_at);
  });

  it("update returns null when id does not exist", () => {
    const ks = new KeywordsStore();
    const result = ks.update("11111111-1111-1111-1111-111111111111", { text: "x" });
    expect(result).toBeNull();
  });

  it("update against another existing keyword raises DUPLICATE", () => {
    const ks = new KeywordsStore();
    const a = ks.create("前端", "douyin");
    const b = ks.create("副业", "douyin");
    expect(() => ks.update(b.id, { text: "前端" })).toThrowError(KeywordValidationError);
    // updating to its own current value (different case) is also a duplicate
    // against itself — but our store excludes self, so this MUST succeed:
    const same = ks.update(a.id, { text: "前端" });
    expect(same?.text).toBe("前端");
  });

  it("delete removes the row; subsequent delete returns false", () => {
    const ks = new KeywordsStore();
    const row = ks.create("x", "douyin");
    expect(ks.delete(row.id)).toBe(true);
    expect(ks.delete(row.id)).toBe(false);
    expect(ks.list()).toHaveLength(0);
  });

  it("stores author-metrics mode with threshold pairs", () => {
    const ks = new KeywordsStore();
    const row = ks.create("前端", "douyin", {
      metric_filter_mode: "author_metrics",
      publish_time_range: "week",
      author_follower_count_op: "gte",
      author_follower_count_value: 1000,
      like_count_op: "lte",
      like_count_value: 5000,
    });
    expect(row.metric_filter_mode).toBe("author_metrics");
    expect(row.publish_time_range).toBe("week");
    expect(row.author_follower_count_op).toBe("gte");
    expect(row.author_follower_count_value).toBe(1000);
    expect(row.like_count_op).toBe("lte");
    expect(row.like_count_value).toBe(5000);
    expect(row.min_like_follower_ratio).toBe(0);
  });

  it("CRUD interleavings preserve list order", () => {
    const ks = new KeywordsStore();
    const a = ks.create("a", "douyin");
    const b = ks.create("b", "douyin");
    const c = ks.create("c", "douyin");
    ks.delete(b.id);
    ks.create("d", "douyin");
    const rows = ks.list();
    expect(rows.map((r) => r.text)).toEqual(["a", "c", "d"]);
    expect(rows.map((r) => r.position)).toEqual([a.position, c.position, 3]);
  });
});
