import { afterEach, describe, expect, it } from "vitest";

import type { MaterialEntry } from "@/shared/contracts/capture";

import {
  ManualCaptureExecutor,
  type DomEvaluatorOnly,
  type ManualCapturePort,
} from "../domain/manualCaptureExecutor";
import type { LibraryStore } from "../domain/library";

function mountDouyinDetailDom(): void {
  document.body.innerHTML = `
    <div data-e2e="detail-video-info" data-e2e-aweme-id="7613213990534509425">
      <h1>
        <span>第31集 | </span>
        <span>我不够宽阔的臂膀也会是你的，温暖怀抱。 </span>
        <a href="//www.douyin.com/search/topic-a"><span>#青年创作者成长计划</span></a>
      </h1>
      <div class="fzu5HWhU"><div><svg></svg></div><span>16.8万</span></div>
      <div class="fzu5HWhU"><div><svg></svg></div><span>3965</span></div>
      <div class="fzu5HWhU"><div><svg></svg></div><span>1.6万</span></div>
      <div class="fzu5HWhU" data-e2e="video-share-icon-container">
        <div><svg></svg></div><span>2.5万</span>
      </div>
    </div>
    <div data-e2e="user-info">
      <a href="//www.douyin.com/user/MS4wLjABAAAAOPEtgY68bK3SAXUVsE8Z6pDdsIzRV6v-WXHXI70ZgM8"></a>
      <div data-click-from="title">梁琪清.</div>
      <p><span>粉丝</span><span>163.1万</span><span>获赞</span><span>2343.6万</span></p>
    </div>
  `;
}

function createFakeLibrary(existingPostIds: string[] = []): {
  library: LibraryStore;
  entries: MaterialEntry[];
} {
  const existing = new Set(existingPostIds);
  const entries: MaterialEntry[] = [];
  const library = {
    materialEntryExists(postId: string): boolean {
      return existing.has(postId);
    },
    insertOrIgnoreMaterialEntry(entry: MaterialEntry): { kind: "inserted"; entry: MaterialEntry } {
      existing.add(entry.post_id);
      entries.push(entry);
      return { kind: "inserted", entry };
    },
  };
  return { library: library as unknown as LibraryStore, entries };
}

function createFakePort(pressedKeys: string[]): ManualCapturePort {
  const evaluator: DomEvaluatorOnly = {
    async evaluate<T>(fn: () => T | Promise<T>): Promise<T> {
      return fn();
    },
  };
  return {
    isInstalled: () => true,
    isSessionAlive: () => true,
    navigateTo: async () => undefined,
    evaluator: () => evaluator,
    pressKey: async (key: string) => {
      pressedKeys.push(key);
    },
    sleep: async () => undefined,
    closeSession: async () => undefined,
  };
}

async function waitForExecutorDone(executor: ManualCaptureExecutor): Promise<void> {
  for (let i = 0; i < 20; i += 1) {
    const snapshot = executor.snapshot();
    if (snapshot !== null && snapshot.status !== "running") return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

describe("ManualCaptureExecutor Douyin detail capture", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("captures standalone Douyin detail pages without pressing H or F", async () => {
    mountDouyinDetailDom();
    const pressedKeys: string[] = [];
    const { library, entries } = createFakeLibrary();
    const executor = new ManualCaptureExecutor(createFakePort(pressedKeys), library);

    const started = await executor.start({
      url: "https://www.douyin.com/video/7613213990534509425",
    });
    expect(started).toMatchObject({ taskId: expect.any(String), platform: "douyin" });

    await waitForExecutorDone(executor);

    const snapshot = executor.snapshot();
    expect(snapshot?.status).toBe("done");
    expect(snapshot?.stop_reason).toBe("captured");
    expect(snapshot?.result_post_id).toBe("7613213990534509425");
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      post_id: "7613213990534509425",
      captured_by_device: "web:manual:douyin:detail",
      like_count: 168_000,
      comment_count: 3965,
      collect_count: 16_000,
      share_count: 25_000,
      author_follower_count: 1_631_000,
      author_display_name: "梁琪清.",
    });
    expect(pressedKeys).not.toContain("h");
    expect(pressedKeys).not.toContain("f");
  });

  it("finishes as duplicate from the detail branch without pressing H or F", async () => {
    mountDouyinDetailDom();
    const pressedKeys: string[] = [];
    const { library, entries } = createFakeLibrary(["7613213990534509425"]);
    const executor = new ManualCaptureExecutor(createFakePort(pressedKeys), library);

    await executor.start({
      url: "https://www.douyin.com/video/7613213990534509425",
    });
    await waitForExecutorDone(executor);

    expect(executor.snapshot()?.stop_reason).toBe("duplicate");
    expect(executor.snapshot()?.result_post_id).toBe("7613213990534509425");
    expect(entries).toHaveLength(0);
    expect(pressedKeys).toEqual([]);
  });
});
