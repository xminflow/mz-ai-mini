import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { keywordUpdateResultSchema } from "@/shared/contracts/keyword/keyword-update";

import * as libraryModule from "../domain/library";
import { LibraryStore, _resetSharedStoreForTests } from "../domain/library";
import { _resetKeywordsStoreForTests, getKeywordsStore } from "../domain/keywordsStore";
import { keywordUpdateHandler } from "../handlers/keywordUpdate";

let tmpDir: string;
let store: LibraryStore;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kw-update-"));
  store = LibraryStore.open(path.join(tmpDir, "library.db"));
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

describe("keywordUpdate contract", () => {
  it("happy path returns updated row", async () => {
    const created = getKeywordsStore().create("foo", "douyin");
    const out = await keywordUpdateHandler({ id: created.id, text: "bar" });
    const parsed = keywordUpdateResultSchema.parse(out);
    if (parsed.ok === false) throw new Error("expected ok");
    expect(parsed.keyword.text).toBe("bar");
  });

  it("returns KEYWORD_NOT_FOUND for unknown id", async () => {
    const out = await keywordUpdateHandler({
      id: "11111111-1111-1111-1111-111111111111",
      text: "x",
    });
    const parsed = keywordUpdateResultSchema.parse(out);
    if (parsed.ok) throw new Error("expected error");
    expect(parsed.error.code).toBe("KEYWORD_NOT_FOUND");
  });

  it("returns KEYWORD_DUPLICATE when colliding with another row", async () => {
    getKeywordsStore().create("a", "douyin");
    const b = getKeywordsStore().create("b", "douyin");
    const out = await keywordUpdateHandler({ id: b.id, text: "a" });
    const parsed = keywordUpdateResultSchema.parse(out);
    if (parsed.ok) throw new Error("expected error");
    expect(parsed.error.code).toBe("KEYWORD_DUPLICATE");
  });

  it("returns KEYWORD_INVALID for empty text", async () => {
    const created = getKeywordsStore().create("foo", "douyin");
    const out = await keywordUpdateHandler({ id: created.id, text: "    " });
    const parsed = keywordUpdateResultSchema.parse(out);
    if (parsed.ok) throw new Error("expected error");
    expect(parsed.error.code).toBe("KEYWORD_INVALID");
  });
});
