import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { keywordCreateResultSchema } from "@/shared/contracts/keyword/keyword-create";

import * as libraryModule from "../domain/library";
import { LibraryStore, _resetSharedStoreForTests } from "../domain/library";
import { _resetKeywordsStoreForTests } from "../domain/keywordsStore";
import { keywordCreateHandler } from "../handlers/keywordCreate";

let tmpDir: string;
let store: LibraryStore;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kw-create-"));
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

describe("keywordCreate contract", () => {
  it("happy path returns ok=true with inserted row", async () => {
    const out = await keywordCreateHandler({ text: "前端", platform: "douyin" });
    const parsed = keywordCreateResultSchema.parse(out);
    if (parsed.ok === false) throw new Error("expected ok=true");
    expect(parsed.keyword.text).toBe("前端");
    expect(parsed.keyword.position).toBe(0);
  });

  it("returns KEYWORD_INVALID for empty input", async () => {
    const out = await keywordCreateHandler({ text: "", platform: "douyin" });
    const parsed = keywordCreateResultSchema.parse(out);
    if (parsed.ok) throw new Error("expected error");
    expect(parsed.error.code).toBe("KEYWORD_INVALID");
  });

  it("returns KEYWORD_INVALID for whitespace-only input", async () => {
    const out = await keywordCreateHandler({ text: "    ", platform: "douyin" });
    const parsed = keywordCreateResultSchema.parse(out);
    if (parsed.ok) throw new Error("expected error");
    expect(parsed.error.code).toBe("KEYWORD_INVALID");
  });

  it("returns KEYWORD_DUPLICATE for case-insensitive collision", async () => {
    await keywordCreateHandler({ text: "前端", platform: "douyin" });
    const out = await keywordCreateHandler({ text: " 前端 ", platform: "douyin" });
    const parsed = keywordCreateResultSchema.parse(out);
    if (parsed.ok) throw new Error("expected error");
    expect(parsed.error.code).toBe("KEYWORD_DUPLICATE");
  });
});
