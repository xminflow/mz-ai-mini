import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { keywordListResultSchema } from "@/shared/contracts/keyword/keyword-list";

import * as libraryModule from "../domain/library";
import { LibraryStore, _resetSharedStoreForTests } from "../domain/library";
import { _resetKeywordsStoreForTests, getKeywordsStore } from "../domain/keywordsStore";
import { keywordListHandler } from "../handlers/keywordList";

let tmpDir: string;
let store: LibraryStore;
let dbFile: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kw-list-"));
  dbFile = path.join(tmpDir, "library.db");
  store = LibraryStore.open(dbFile);
  _resetSharedStoreForTests();
  _resetKeywordsStoreForTests();
  vi.spyOn(libraryModule, "openLibrary").mockImplementation(() => store);
});

afterEach(() => {
  store.close();
  _resetKeywordsStoreForTests();
  _resetSharedStoreForTests();
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("keywordList contract", () => {
  it("returns an empty list payload that conforms to schema", async () => {
    const out = await keywordListHandler({});
    const parsed = keywordListResultSchema.safeParse(out);
    expect(parsed.success).toBe(true);
    if (parsed.success && parsed.data.ok) {
      expect(parsed.data.keywords).toEqual([]);
    } else {
      throw new Error("expected ok=true");
    }
  });

  it("returns inserted rows in position order", async () => {
    getKeywordsStore().create("前端", "douyin");
    getKeywordsStore().create("副业", "douyin");
    const out = await keywordListHandler({});
    const parsed = keywordListResultSchema.parse(out);
    if (!parsed.ok) throw new Error("expected ok=true");
    expect(parsed.keywords.map((k) => k.text)).toEqual(["前端", "副业"]);
  });

  it("skips invalid legacy rows instead of failing the whole list", async () => {
    getKeywordsStore().create("前端", "douyin");
    const Database = (await import("better-sqlite3")).default;
    const db = new Database(dbFile);
    try {
      db.prepare(
        `INSERT INTO keywords
          (id, platform, text, position, enabled, target_cap, health_cap, metric_filter_mode,
           min_like_follower_ratio, publish_time_range, author_follower_count_op,
           author_follower_count_value, like_count_op, like_count_value, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        "11111111-1111-1111-1111-111111111111",
        "douyin",
        "坏数据",
        1,
        1,
        10,
        500,
        "author_metrics",
        0,
        "all",
        null,
        null,
        null,
        null,
        "2026-05-03T00:00:00.000Z",
        "2026-05-03T00:00:00.000Z",
      );
    } finally {
      db.close();
    }

    const out = await keywordListHandler({});
    const parsed = keywordListResultSchema.parse(out);
    if (!parsed.ok) throw new Error("expected ok=true");
    expect(parsed.keywords.map((k) => k.text)).toEqual(["前端"]);
  });
});
