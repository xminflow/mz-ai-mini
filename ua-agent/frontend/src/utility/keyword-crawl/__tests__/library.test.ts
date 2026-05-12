import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { MaterialEntry } from "@/shared/contracts/capture";

import { LibraryStore } from "../domain/library";

let tmpDir: string;
let dbFile: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kw-lib-"));
  dbFile = path.join(tmpDir, "library.db");
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function makeEntry(overrides: Partial<MaterialEntry> = {}): MaterialEntry {
  return {
    post_id: "p1",
    post_id_source: "share_url_canonical",
    share_url: "https://www.douyin.com/video/p1",
    share_text: "https://www.douyin.com/video/p1",
    caption: "",
    author_handle: "author",
    author_display_name: null,
    hashtags: [],
    music_id: null,
    music_title: null,
    like_count: -1,
    comment_count: -1,
    share_count: -1,
    collect_count: -1,
    author_follower_count: null,
    captured_at: "2026-05-03T12:00:00.000Z",
    captured_by_device: "web:keyword:前端",
    note_type: "video",
    platform: "douyin",
    media_kind: "video",
    image_urls: null,
    comments: [],
    transcript: null,
    transcribed_at: null,
    ...overrides,
  };
}

describe("library — schema bootstrap", () => {
  it("creates material_entries plus the three new keyword tables on first open", () => {
    const store = LibraryStore.open(dbFile);
    const db = store.raw();
    const tables = (db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[])
      .map((r) => r.name);
    expect(tables).toContain("material_entries");
    expect(tables).toContain("keywords");
    expect(tables).toContain("keyword_batches");
    expect(tables).toContain("keyword_runs");
    expect(tables).toContain("wizard_state");
    store.close();
  });

  it("inserts and dedups material_entries via post_id PK", () => {
    const store = LibraryStore.open(dbFile);
    const e = makeEntry();
    const first = store.insertOrIgnoreMaterialEntry(e);
    expect(first.kind).toBe("inserted");
    const second = store.insertOrIgnoreMaterialEntry(e);
    expect(second.kind).toBe("duplicate");
    expect(store.materialEntryExists("p1")).toBe(true);
    expect(store.materialEntryExists("p2")).toBe(false);
    store.close();
  });

  it("round-trips up to 10 comments via comments_json", () => {
    const store = LibraryStore.open(dbFile);
    const draft = makeEntry({
      post_id: "px",
      platform: "xiaohongshu",
      post_id_source: "xhs_note_url",
      share_url: "https://www.xiaohongshu.com/explore/abc",
      share_text: "https://www.xiaohongshu.com/explore/abc",
      comments: [
        { author: "u1", content: "好看", like_count: 5, time_text: "2小时前" },
        { author: "u2", content: "想要购买", like_count: 0, time_text: "5小时前" },
      ],
    });
    const res = store.insertOrIgnoreMaterialEntry(draft);
    expect(res.kind).toBe("inserted");
    const page = store.listMaterials({
      from: null,
      to: null,
      author: null,
      platform: null,
      limit: 50,
      offset: 0,
    });
    const got = page.entries.find((x) => x.post_id === "px");
    expect(got).toBeDefined();
    expect(got?.comments).toEqual([
      { author: "u1", content: "好看", like_count: 5, time_text: "2小时前" },
      { author: "u2", content: "想要购买", like_count: 0, time_text: "5小时前" },
    ]);
    store.close();
  });

  it("treats legacy rows without comments_json as comments=[]", () => {
    const store = LibraryStore.open(dbFile);
    const e = makeEntry({ post_id: "legacy" });
    store.insertOrIgnoreMaterialEntry(e);
    const db = store.raw();
    db.prepare("UPDATE material_entries SET comments_json = NULL WHERE post_id = ?").run("legacy");
    const page = store.listMaterials({
      from: null,
      to: null,
      author: null,
      platform: null,
      limit: 50,
      offset: 0,
    });
    const got = page.entries.find((x) => x.post_id === "legacy");
    expect(got?.comments).toEqual([]);
    store.close();
  });

  it("round-trips a keyword_batch row", () => {
    const store = LibraryStore.open(dbFile);
    const id = "11111111-1111-1111-1111-111111111111";
    store.insertKeywordBatch({
      id,
      platform: "douyin",
      status: "running",
      stop_reason: null,
      started_at: "2026-05-03T12:00:00.000Z",
      ended_at: null,
      selected_keyword_ids: ["a"],
      executed_keyword_ids: [],
      cancelled_keyword_ids: [],
      min_like_follower_ratio: 0,
    });
    const out = store.selectKeywordBatch(id);
    expect(out?.status).toBe("running");
    expect(out?.selected_keyword_ids).toEqual(["a"]);

    store.updateKeywordBatch(id, {
      status: "done",
      stop_reason: "all-completed",
      ended_at: "2026-05-03T12:30:00.000Z",
      executed_keyword_ids: ["a"],
      cancelled_keyword_ids: [],
    });
    const after = store.selectKeywordBatch(id);
    expect(after?.status).toBe("done");
    expect(after?.stop_reason).toBe("all-completed");
    expect(after?.executed_keyword_ids).toEqual(["a"]);
    store.close();
  });
});
