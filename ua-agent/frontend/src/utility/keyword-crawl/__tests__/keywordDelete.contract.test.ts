import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { keywordDeleteResultSchema } from "@/shared/contracts/keyword/keyword-delete";

import * as libraryModule from "../domain/library";
import { LibraryStore, _resetSharedStoreForTests } from "../domain/library";
import { _resetKeywordsStoreForTests, getKeywordsStore } from "../domain/keywordsStore";
import { keywordDeleteHandler, setKeywordRunningCheck } from "../handlers/keywordDelete";

let tmpDir: string;
let store: LibraryStore;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kw-delete-"));
  store = LibraryStore.open(path.join(tmpDir, "library.db"));
  _resetSharedStoreForTests();
  _resetKeywordsStoreForTests();
  vi.spyOn(libraryModule, "openLibrary").mockImplementation(() => store);
  setKeywordRunningCheck(() => false);
});

afterEach(() => {
  store.close();
  _resetKeywordsStoreForTests();
  _resetSharedStoreForTests();
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
  setKeywordRunningCheck(() => false);
});

describe("keywordDelete contract", () => {
  it("deletes an existing row", async () => {
    const row = getKeywordsStore().create("x", "douyin");
    const out = await keywordDeleteHandler({ id: row.id });
    const parsed = keywordDeleteResultSchema.parse(out);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.deleted_id).toBe(row.id);
  });

  it("returns KEYWORD_NOT_FOUND for unknown id", async () => {
    const out = await keywordDeleteHandler({
      id: "11111111-1111-1111-1111-111111111111",
    });
    const parsed = keywordDeleteResultSchema.parse(out);
    if (parsed.ok) throw new Error("expected error");
    expect(parsed.error.code).toBe("KEYWORD_NOT_FOUND");
  });

  it("returns BATCH_BUSY when running-check returns true", async () => {
    const row = getKeywordsStore().create("x", "douyin");
    setKeywordRunningCheck((id) => id === row.id);
    const out = await keywordDeleteHandler({ id: row.id });
    const parsed = keywordDeleteResultSchema.parse(out);
    if (parsed.ok) throw new Error("expected error");
    expect(parsed.error.code).toBe("BATCH_BUSY");
  });
});
