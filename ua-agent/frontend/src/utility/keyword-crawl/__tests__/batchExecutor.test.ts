import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BatchExecutor, type ExecutorPort, type PreReadinessGate } from "../domain/batchExecutor";
import * as keywordsStoreModule from "../domain/keywordsStore";

// Fake LibraryStore with the methods BatchExecutor calls on it.
interface FakeLibrary {
  insertKeywordBatch: (b: unknown) => void;
  updateKeywordBatch: (id: string, patch: unknown) => void;
  insertKeywordRun: (r: unknown) => void;
  updateKeywordRun: (id: string, patch: unknown) => void;
  materialEntryExists: (postId: string) => boolean;
  insertOrIgnoreMaterialEntry: (e: { post_id: string }) => { kind: "inserted" | "duplicate"; entry?: unknown };
}

function makeFakeLibrary(preExisting: string[] = []): FakeLibrary {
  const inserted = new Set<string>(preExisting);
  return {
    insertKeywordBatch: () => undefined,
    updateKeywordBatch: () => undefined,
    insertKeywordRun: () => undefined,
    updateKeywordRun: () => undefined,
    materialEntryExists: (id) => inserted.has(id),
    insertOrIgnoreMaterialEntry: (e) => {
      if (inserted.has(e.post_id)) return { kind: "duplicate" };
      inserted.add(e.post_id);
      return { kind: "inserted", entry: e };
    },
  };
}

function alwaysReadyGate(): PreReadinessGate {
  return { check: () => null };
}

interface VideoFixture {
  href: string;
}

/**
 * Mock ExecutorPort that mirrors the browse-mode flow:
 *   pressKey("h")       → enter browse mode (no-op for the mock)
 *   pressKey("ArrowDown") → advance to next video
 *   evaluator.evaluate(fn) → dispatch on the source of `fn`:
 *     - layout-toggle / single-column-detection helpers → true
 *     - readCurrentBrowseVideo → return BrowseModeRaw for `videos[cursor]`
 *
 * After the fixtures are exhausted the mock keeps returning the last video
 * so the executor's "same post id 3× in a row" guard fires `end-of-results`.
 */
function buildPort(videos: VideoFixture[]): ExecutorPort {
  let cursor = 0;
  return {
    isInstalled: () => true,
    isSessionAlive: () => true,
    navigateTo: async () => undefined,
    pressKey: async (key: string) => {
      if (key === "ArrowDown" && cursor < videos.length - 1) cursor++;
    },
    evaluator: () => ({
      evaluate: async <T>(fn: () => T | Promise<T>): Promise<T> => {
        const src = fn.toString();
        // Layout-toggle helpers (clickSingleColumnToggle / waitForSingleColumnLayout)
        if (
          src.includes("单列") ||
          src.includes("single-column") ||
          src.includes("ListIcon")
        ) {
          return true as unknown as T;
        }
        if (src.includes("一天内") || src.includes("一周内") || src.includes("半年内") || src.includes("发布时间")) {
          return true as unknown as T;
        }
        // blurActiveElement — pretend nothing was focused.
        if (src.includes("activeElement")) {
          return false as unknown as T;
        }
        // dispatchBrowseModeHotkey — pretend the synthetic event landed.
        if (src.includes("KeyboardEvent")) {
          return true as unknown as T;
        }
        // Browse-mode read (readCurrentBrowseVideo) — `accountNameEl` is a
        // local var unique to that function body, so it disambiguates from
        // the simpler isBrowseModeActive probe below.
        if (src.includes("accountNameEl")) {
          const v = videos[cursor];
          if (v === undefined) {
            // No fixtures at all — emulate a totally empty viewer.
            return {
              href: null,
              caption: "",
              authorHandle: "",
              authorDisplayName: null,
              likeCount: -1,
              commentCount: -1,
              shareCount: -1,
              hashtags: [],
              pageUrl: "https://www.douyin.com/search/test",
              comments: [],
            } as unknown as T;
          }
          return {
            href: v.href,
            caption: "",
            authorHandle: "",
            authorDisplayName: null,
            likeCount: 0,
            commentCount: 0,
            shareCount: 0,
            hashtags: [],
            pageUrl: v.href,
            comments: [],
          } as unknown as T;
        }
        // isBrowseModeActive probe — must be checked AFTER the BrowseModeRaw
        // branch above because both helpers query the same data-e2e marker.
        if (src.includes("video-player-digg")) {
          return true as unknown as T;
        }
        return undefined as unknown as T;
      },
    }),
    // Honor sleep with a tiny capped delay so the loop yields between
    // iterations — necessary for the user-stop test to interject before the
    // executor races to TARGET_CAP. 5ms per iteration × ~10 iterations within
    // the 50ms test window leaves plenty of room for stop() to land.
    sleep: async (ms: number) =>
      new Promise<void>((r) => setTimeout(r, Math.min(ms, 5))),
  };
}

const validUuid = (n: number): string =>
  `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;

// Default keyword fixture — single enabled keyword with the historical
// TARGET_CAP=50 / HEALTH_CAP=200 caps so the existing tests keep their
// shape (the schema's new defaults are 10 / 500 but those would make the
// "fills to 50" test redefine itself).
const fixtureKeywords = [
  {
    id: validUuid(1),
    text: "前端",
    position: 0,
    enabled: true,
    target_cap: 50,
    health_cap: 200,
    metric_filter_mode: "ratio",
    min_like_follower_ratio: 0,
    publish_time_range: "all",
    author_follower_count_op: null,
    author_follower_count_value: null,
    like_count_op: null,
    like_count_value: null,
    created_at: "2026-05-03T12:00:00.000Z",
    updated_at: "2026-05-03T12:00:00.000Z",
  },
];

beforeEach(() => {
  vi.spyOn(keywordsStoreModule, "getKeywordsStore").mockReturnValue({
    list: () => fixtureKeywords,
    listEnabled: () => fixtureKeywords.filter((k) => k.enabled),
  } as unknown as ReturnType<typeof keywordsStoreModule.getKeywordsStore>);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("BatchExecutor", () => {
  it("executes a single-keyword run that fills to TARGET_CAP=50", async () => {
    const videos: VideoFixture[] = Array.from({ length: 60 }, (_, i) => ({
      href: `https://www.douyin.com/video/aweme${i}`,
    }));
    const exec = new BatchExecutor(buildPort(videos), alwaysReadyGate(), makeFakeLibrary() as never);
    const out = await exec.start({ platform: "douyin" });
    expect("batchId" in out).toBe(true);
    await exec._awaitForTests();
    const snap = exec.snapshot();
    expect(snap?.runs[0]?.captured_count).toBe(50);
    expect(snap?.runs[0]?.stop_reason).toBe("cap");
    expect(snap?.status).toBe("done");
  });

  it("ends with end-of-results once the feed stops advancing", async () => {
    // Only 3 unique videos; after the cursor pins to videos[2], pressing
    // ArrowDown can no longer advance, the same post id repeats, and the
    // executor's `consecutiveSamePost >= 3` guard fires `end-of-results`.
    // Post ids must be 6-32 chars (canonicalizeDouyinUrl), hence the padding.
    const videos: VideoFixture[] = [
      { href: "https://www.douyin.com/video/endres1" },
      { href: "https://www.douyin.com/video/endres2" },
      { href: "https://www.douyin.com/video/endres3" },
    ];
    const exec = new BatchExecutor(buildPort(videos), alwaysReadyGate(), makeFakeLibrary() as never);
    await exec.start({ platform: "douyin" });
    await exec._awaitForTests();
    const snap = exec.snapshot();
    expect(snap?.runs[0]?.stop_reason).toBe("end-of-results");
    expect(snap?.runs[0]?.captured_count).toBe(3);
  });

  it("closes the browser after each keyword and reopens it for the next keyword", async () => {
    const keywords = [
      { ...fixtureKeywords[0], id: validUuid(1), text: "前端", target_cap: 1 },
      { ...fixtureKeywords[0], id: validUuid(2), text: "副业", target_cap: 1 },
    ];
    vi.spyOn(keywordsStoreModule, "getKeywordsStore").mockReturnValue({
      list: () => keywords,
      listEnabled: () => keywords,
    } as unknown as ReturnType<typeof keywordsStoreModule.getKeywordsStore>);

    const basePort = buildPort([
      { href: "https://www.douyin.com/video/life001" },
      { href: "https://www.douyin.com/video/life002" },
    ]);
    let sessionAlive = false;
    const lifecycle: string[] = [];
    const port: ExecutorPort = {
      ...basePort,
      isSessionAlive: () => sessionAlive,
      ensureSession: async () => {
        lifecycle.push("open");
        sessionAlive = true;
      },
      closeSession: async () => {
        lifecycle.push("close");
        sessionAlive = false;
      },
    };

    const exec = new BatchExecutor(port, alwaysReadyGate(), makeFakeLibrary() as never);
    await exec.start({ platform: "douyin" });
    await exec._awaitForTests();

    expect(lifecycle).toEqual(["open", "close", "open", "close"]);
    expect(exec.snapshot()?.runs.map((run) => run.stop_reason)).toEqual(["cap", "cap"]);
  });

  it("treats end-of-feed pressKey transients as end-of-results when captures already happened", async () => {
    // Simulates the live failure mode: 4 successful captures, then ArrowDown
    // throws "BrowserPage is not available" forever (the player tab swapped
    // out at end-of-feed). Pre-fix this used to retry as 5× hard errors and
    // bail with `error-threshold`; now we recognise the transient pattern,
    // exhaust 3 retries, and downgrade to `end-of-results` because the run
    // already produced material.
    const videos: VideoFixture[] = Array.from({ length: 4 }, (_, i) => ({
      href: `https://www.douyin.com/video/transient${i}00`,
    }));
    let cursor = 0;
    const port: ExecutorPort = {
      isInstalled: () => true,
      isSessionAlive: () => true,
      navigateTo: async () => undefined,
      pressKey: async (key: string) => {
        if (key === "ArrowDown") {
          if (cursor >= videos.length - 1) {
            throw new Error("BrowserPage is not available");
          }
          cursor++;
        }
      },
      evaluator: () => ({
        evaluate: async <T>(fn: () => T | Promise<T>): Promise<T> => {
          const src = fn.toString();
          if (src.includes("单列") || src.includes("single-column")) return true as unknown as T;
          if (src.includes("activeElement")) return false as unknown as T;
          if (src.includes("KeyboardEvent")) return true as unknown as T;
          if (src.includes("accountNameEl")) {
            const v = videos[cursor]!;
            return {
              href: v.href,
              caption: "",
              authorHandle: "",
              authorDisplayName: null,
              likeRaw: "0",
              commentRaw: "0",
              shareRaw: "0",
              collectRaw: "0",
              hashtags: [],
              pageUrl: v.href,
            } as unknown as T;
          }
          if (src.includes("video-player-digg")) return true as unknown as T;
          return undefined as unknown as T;
        },
      }),
      sleep: async (ms: number) =>
        new Promise<void>((r) => setTimeout(r, Math.min(ms, 5))),
    };
    const exec = new BatchExecutor(port, alwaysReadyGate(), makeFakeLibrary() as never);
    await exec.start({ platform: "douyin" });
    await exec._awaitForTests();
    const snap = exec.snapshot();
    expect(snap?.runs[0]?.captured_count).toBe(4);
    expect(snap?.runs[0]?.stop_reason).toBe("end-of-results");
    // exactly one hard error gets recorded (after retries exhausted), not 5
    expect(snap?.runs[0]?.error_count).toBe(1);
  });

  it("counts duplicates as scanned only, not captured", async () => {
    const videos: VideoFixture[] = [
      { href: "https://www.douyin.com/video/dupv01" },
      { href: "https://www.douyin.com/video/dupv02" },
      { href: "https://www.douyin.com/video/dupv03" },
      { href: "https://www.douyin.com/video/dupv04" },
    ];
    // Pre-seed the library with two of the four post ids so they're
    // recognised as duplicates via materialEntryExists.
    const exec = new BatchExecutor(
      buildPort(videos),
      alwaysReadyGate(),
      makeFakeLibrary(["dupv02", "dupv03"]) as never,
    );
    await exec.start({ platform: "douyin" });
    await exec._awaitForTests();
    const snap = exec.snapshot();
    expect(snap?.runs[0]?.captured_count).toBe(2);
    expect(snap?.runs[0]?.scanned_count).toBeGreaterThanOrEqual(4);
  });

  it("applies direct like-threshold filtering in author-metrics mode", async () => {
    vi.spyOn(keywordsStoreModule, "getKeywordsStore").mockReturnValue({
      list: () => [
        {
          ...fixtureKeywords[0],
          metric_filter_mode: "author_metrics",
          min_like_follower_ratio: 0,
          like_count_op: "gte",
          like_count_value: 1,
        },
      ],
      listEnabled: () => [
        {
          ...fixtureKeywords[0],
          metric_filter_mode: "author_metrics",
          min_like_follower_ratio: 0,
          like_count_op: "gte",
          like_count_value: 1,
        },
      ],
    } as unknown as ReturnType<typeof keywordsStoreModule.getKeywordsStore>);
    const videos: VideoFixture[] = [
      { href: "https://www.douyin.com/video/filt001" },
      { href: "https://www.douyin.com/video/filt002" },
      { href: "https://www.douyin.com/video/filt003" },
    ];
    const exec = new BatchExecutor(buildPort(videos), alwaysReadyGate(), makeFakeLibrary() as never);
    await exec.start({ platform: "douyin" });
    await exec._awaitForTests();
    const snap = exec.snapshot();
    expect(snap?.runs[0]?.filtered_count).toBeGreaterThan(0);
    expect(snap?.runs[0]?.captured_count).toBe(0);
  });

  it("applies the douyin publish-time filter before crawling", async () => {
    vi.spyOn(keywordsStoreModule, "getKeywordsStore").mockReturnValue({
      list: () => [
        {
          ...fixtureKeywords[0],
          metric_filter_mode: "none",
          min_like_follower_ratio: 0,
          publish_time_range: "day",
        },
      ],
      listEnabled: () => [
        {
          ...fixtureKeywords[0],
          metric_filter_mode: "none",
          min_like_follower_ratio: 0,
          publish_time_range: "day",
        },
      ],
    } as unknown as ReturnType<typeof keywordsStoreModule.getKeywordsStore>);
    const videos: VideoFixture[] = [
      { href: "https://www.douyin.com/video/time001" },
      { href: "https://www.douyin.com/video/time002" },
      { href: "https://www.douyin.com/video/time003" },
    ];
    const exec = new BatchExecutor(buildPort(videos), alwaysReadyGate(), makeFakeLibrary() as never);
    await exec.start({ platform: "douyin" });
    await exec._awaitForTests();
    const snap = exec.snapshot();
    expect(snap?.runs[0]?.captured_count).toBe(3);
    expect(snap?.runs[0]?.stop_reason).toBe("end-of-results");
  });

  it("refuses concurrent start with BATCH_BUSY", async () => {
    const videos = [{ href: "https://www.douyin.com/video/busy01" }];
    const exec = new BatchExecutor(buildPort(videos), alwaysReadyGate(), makeFakeLibrary() as never);
    await exec.start({ platform: "douyin" });
    const second = await exec.start({ platform: "douyin" });
    expect((second as { ok?: boolean }).ok).toBe(false);
    expect((second as { error?: { code: string } }).error?.code).toBe("BATCH_BUSY");
    await exec._awaitForTests();
  });

  it("respects user stop and ends the batch with stop_reason=user", async () => {
    const videos: VideoFixture[] = Array.from({ length: 200 }, (_, i) => ({
      href: `https://www.douyin.com/video/userstop${String(i).padStart(3, "0")}`,
    }));
    const exec = new BatchExecutor(buildPort(videos), alwaysReadyGate(), makeFakeLibrary() as never);
    await exec.start({ platform: "douyin" });
    await new Promise((r) => setTimeout(r, 50));
    await exec.stop();
    await exec._awaitForTests();
    const snap = exec.snapshot();
    expect(snap?.stop_reason === "user" || snap?.runs[0]?.stop_reason === "user").toBe(true);
  });
});
