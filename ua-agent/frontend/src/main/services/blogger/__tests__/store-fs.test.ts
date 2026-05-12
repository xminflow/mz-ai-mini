import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { BloggerVideoSample } from "@/shared/contracts/blogger";

let tmpDir: string;

// `app.getPath('userData')` is mocked to point at a fresh tmp dir per test.
vi.mock("electron", () => ({
  app: {
    getPath: (k: string) => {
      if (k !== "userData") throw new Error(`unexpected getPath(${k})`);
      return tmpDir;
    },
  },
}));

vi.mock("electron-log/main", () => ({
  default: { warn: () => {}, info: () => {}, error: () => {} },
}));

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "blogger-fs-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function makeSample(
  position: number,
  url: string,
  overrides: Partial<BloggerVideoSample> = {},
): BloggerVideoSample {
  return {
    position,
    video_url: url,
    title: `t${position}`,
    source_index: position,
    sampled_at: "2026-05-06T12:00:00.000Z",
    transcript: null,
    transcript_lang: null,
    frames: [],
    analyzed_at: null,
    analyze_error: null,
    ...overrides,
  };
}

describe("store-fs — bloggers", () => {
  it("upsert + list + get round-trip", async () => {
    const store = await import("../store-fs");
    const created = await store.upsertBlogger({
      platform: "douyin",
      profile_url: "https://www.douyin.com/user/MS4wTEST",
      sec_uid: "MS4wTEST",
      nowIso: "2026-05-06T12:00:00.000Z",
    });
    expect(created.status).toBe("pending");
    expect(created.analysis_generated_at).toBeNull();
    expect(created.analysis_error).toBeNull();
    expect(created.profile_url).toBe("https://www.douyin.com/user/MS4wTEST");
    const list = await store.listBloggers();
    expect(list).toHaveLength(1);
    expect(list[0]!.id).toBe(created.id);
    const fetched = await store.getBlogger(created.id);
    expect(fetched?.id).toBe(created.id);
  });

  it("upsert is idempotent on (platform, profile_url)", async () => {
    const store = await import("../store-fs");
    const a = await store.upsertBlogger({
      platform: "douyin",
      profile_url: "https://www.douyin.com/user/MS4wDUP",
      sec_uid: "MS4wDUP",
      nowIso: "2026-05-06T12:00:00.000Z",
    });
    const b = await store.upsertBlogger({
      platform: "douyin",
      profile_url: "https://www.douyin.com/user/MS4wDUP",
      sec_uid: "MS4wDUP",
      nowIso: "2026-05-06T12:01:00.000Z",
    });
    expect(b.id).toBe(a.id);
  });

  it("delete removes the directory and its samples", async () => {
    const store = await import("../store-fs");
    const b = await store.upsertBlogger({
      platform: "douyin",
      profile_url: "https://www.douyin.com/user/MS4wDEL",
      sec_uid: "MS4wDEL",
      nowIso: "2026-05-06T12:00:00.000Z",
    });
    await store.replaceBloggerSamples(
      b.id,
      [makeSample(0, "https://www.douyin.com/video/7000000000000000001")],
      1,
      "2026-05-06T12:00:00.000Z",
    );
    expect((await store.listBloggerSamples(b.id))).toHaveLength(1);
    expect(await store.deleteBlogger(b.id)).toBe(true);
    expect(await store.getBlogger(b.id)).toBeNull();
    expect(await store.deleteBlogger(b.id)).toBe(false);
  });
});

describe("store-fs — samples", () => {
  it("round-trips analysis fields via update + list", async () => {
    const store = await import("../store-fs");
    const b = await store.upsertBlogger({
      platform: "douyin",
      profile_url: "https://www.douyin.com/user/MS4wRT",
      sec_uid: "MS4wRT",
      nowIso: "2026-05-06T12:00:00.000Z",
    });
    const url = "https://www.douyin.com/video/7000000000000000001";
    await store.replaceBloggerSamples(
      b.id,
      [makeSample(0, url)],
      1,
      "2026-05-06T12:00:00.000Z",
    );
    await store.updateBloggerSampleAnalysis(b.id, url, {
      transcript: "hello world",
      transcript_lang: "zh",
      frames: [
        "blogger-frames/x/1.jpg",
        "blogger-frames/x/2.jpg",
        "blogger-frames/x/3.jpg",
        "blogger-frames/x/4.jpg",
      ],
      analyzed_at: "2026-05-06T12:01:00.000Z",
      analyze_error: null,
    });
    const samples = await store.listBloggerSamples(b.id);
    expect(samples).toHaveLength(1);
    const s = samples[0]!;
    expect(s.transcript).toBe("hello world");
    expect(s.transcript_lang).toBe("zh");
    expect(s.frames).toHaveLength(4);
    expect(s.analyzed_at).toBe("2026-05-06T12:01:00.000Z");
    expect(s.analyze_error).toBeNull();
  });

  it("clears stale report metadata when sample analysis changes", async () => {
    const store = await import("../store-fs");
    const b = await store.upsertBlogger({
      platform: "douyin",
      profile_url: "https://www.douyin.com/user/MS4wREPORT",
      sec_uid: "MS4wREPORT",
      nowIso: "2026-05-06T12:00:00.000Z",
    });
    const url = "https://www.douyin.com/video/7000000000000000100";
    await store.replaceBloggerSamples(
      b.id,
      [makeSample(0, url)],
      1,
      "2026-05-06T12:00:00.000Z",
    );
    await store.updateBloggerReportState(b.id, {
      analysis_generated_at: "2026-05-06T12:10:00.000Z",
      analysis_error: null,
      updated_at: "2026-05-06T12:10:00.000Z",
    });
    const reportDir = path.join(tmpDir, "blogger-frames", b.id);
    fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(path.join(reportDir, "analysis.md"), "# report\n", "utf8");
    fs.writeFileSync(path.join(reportDir, "analysis.generated.md"), "# draft\n", "utf8");

    await store.updateBloggerSampleAnalysis(b.id, url, {
      transcript: "changed",
      analyzed_at: "2026-05-06T12:11:00.000Z",
    });

    const fetched = await store.getBlogger(b.id);
    expect(fetched?.analysis_generated_at).toBeNull();
    expect(fetched?.analysis_error).toBeNull();
    expect(fs.existsSync(path.join(reportDir, "analysis.md"))).toBe(false);
    expect(fs.existsSync(path.join(reportDir, "analysis.generated.md"))).toBe(false);
  });

  it("preserves analysis across resample for surviving video URLs", async () => {
    const store = await import("../store-fs");
    const b = await store.upsertBlogger({
      platform: "douyin",
      profile_url: "https://www.douyin.com/user/MS4wKEEP",
      sec_uid: "MS4wKEEP",
      nowIso: "2026-05-06T12:00:00.000Z",
    });
    const survivor = "https://www.douyin.com/video/7000000000000000001";
    const dropped = "https://www.douyin.com/video/7000000000000000002";
    const fresh = "https://www.douyin.com/video/7000000000000000003";

    await store.replaceBloggerSamples(
      b.id,
      [makeSample(0, survivor), makeSample(1, dropped)],
      2,
      "2026-05-06T12:00:00.000Z",
    );
    await store.updateBloggerSampleAnalysis(b.id, survivor, {
      transcript: "carry me forward",
      transcript_lang: "zh",
      frames: ["a/1.jpg", "a/2.jpg", "a/3.jpg", "a/4.jpg"],
      analyzed_at: "2026-05-06T12:01:00.000Z",
    });

    // Resample drops `dropped` and adds `fresh`.
    await store.replaceBloggerSamples(
      b.id,
      [makeSample(0, survivor), makeSample(1, fresh)],
      2,
      "2026-05-06T12:05:00.000Z",
    );

    const samples = await store.listBloggerSamples(b.id);
    expect(samples).toHaveLength(2);
    const survivorRow = samples.find((s) => s.video_url === survivor)!;
    const freshRow = samples.find((s) => s.video_url === fresh)!;
    expect(survivorRow.transcript).toBe("carry me forward");
    expect(survivorRow.frames).toHaveLength(4);
    expect(survivorRow.analyzed_at).toBe("2026-05-06T12:01:00.000Z");
    expect(freshRow.transcript).toBeNull();
    expect(freshRow.frames).toEqual([]);
    expect(freshRow.analyzed_at).toBeNull();
  });

  it("infers report readiness from legacy analysis.md on disk", async () => {
    const store = await import("../store-fs");
    const b = await store.upsertBlogger({
      platform: "douyin",
      profile_url: "https://www.douyin.com/user/MS4wLEGACY",
      sec_uid: "MS4wLEGACY",
      nowIso: "2026-05-06T12:00:00.000Z",
    });
    const reportPath = path.join(tmpDir, "blogger-frames", b.id, "analysis.md");
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, "# legacy report\n", "utf8");

    const fetched = await store.getBlogger(b.id);
    expect(fetched?.analysis_generated_at).not.toBeNull();
  });

  it("deletes one sample, clears stale report, and downgrades to profile_ready when empty", async () => {
    const store = await import("../store-fs");
    const b = await store.upsertBlogger({
      platform: "douyin",
      profile_url: "https://www.douyin.com/user/MS4wDELETEONE",
      sec_uid: "MS4wDELETEONE",
      nowIso: "2026-05-06T12:00:00.000Z",
    });
    const first = "https://www.douyin.com/video/7000000000000001001";
    const second = "https://www.douyin.com/video/7000000000000001002";
    await store.replaceBloggerSamples(
      b.id,
      [makeSample(0, first), makeSample(1, second)],
      2,
      "2026-05-06T12:00:00.000Z",
    );
    await store.updateBloggerReportState(b.id, {
      analysis_generated_at: "2026-05-06T12:10:00.000Z",
      analysis_error: null,
      updated_at: "2026-05-06T12:10:00.000Z",
    });
    fs.writeFileSync(path.join(tmpDir, "blogger-frames", b.id, "analysis.md"), "# report\n", "utf8");
    fs.writeFileSync(
      path.join(tmpDir, "blogger-frames", b.id, "analysis.generated.md"),
      "# draft\n",
      "utf8",
    );

    const firstDelete = await store.deleteBloggerSample(
      b.id,
      first,
      "2026-05-06T12:20:00.000Z",
    );
    expect(firstDelete.deleted).toBe(true);
    expect(firstDelete.remaining_samples).toBe(1);
    expect(firstDelete.blogger?.status).toBe("sampled");
    expect(fs.existsSync(path.join(tmpDir, "blogger-frames", b.id, "analysis.md"))).toBe(false);
    expect(
      fs.existsSync(path.join(tmpDir, "blogger-frames", b.id, "analysis.generated.md")),
    ).toBe(false);
    const afterFirstDelete = await store.listBloggerSamples(b.id);
    expect(afterFirstDelete).toHaveLength(1);
    expect(afterFirstDelete[0]?.position).toBe(0);
    expect(afterFirstDelete[0]?.video_url).toBe(second);

    const secondDelete = await store.deleteBloggerSample(
      b.id,
      second,
      "2026-05-06T12:21:00.000Z",
    );
    expect(secondDelete.deleted).toBe(true);
    expect(secondDelete.remaining_samples).toBe(0);
    expect(secondDelete.blogger?.status).toBe("profile_ready");
    expect(secondDelete.blogger?.sampled_at).toBeNull();
    expect(secondDelete.blogger?.total_works_at_sample).toBeNull();
    expect(await store.listBloggerSamples(b.id)).toEqual([]);
  });
});
