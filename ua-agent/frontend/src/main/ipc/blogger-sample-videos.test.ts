import { beforeEach, describe, expect, it, vi } from "vitest";

const handleMock = vi.fn();
const removeHandlerMock = vi.fn();
const rpcMock = vi.fn();
const getBloggerMock = vi.fn();
const appendBloggerSamplesMock = vi.fn();
const listBloggerSamplesMock = vi.fn();

vi.mock("electron", () => ({
  ipcMain: {
    handle: handleMock,
    removeHandler: removeHandlerMock,
  },
}));

vi.mock("electron-log/main", () => ({
  default: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../utility-host", () => ({
  getUtilityHost: () => ({
    rpc: rpcMock,
  }),
}));

vi.mock("../services/blogger/store-fs", () => ({
  getBlogger: getBloggerMock,
  appendBloggerSamples: appendBloggerSamplesMock,
  listBloggerSamples: listBloggerSamplesMock,
  replaceBloggerSamples: vi.fn(),
  updateBloggerStatus: vi.fn(),
}));

describe("blogger:sample-videos IPC", () => {
  beforeEach(() => {
    handleMock.mockReset();
    removeHandlerMock.mockReset();
    rpcMock.mockReset();
    getBloggerMock.mockReset();
    appendBloggerSamplesMock.mockReset();
    listBloggerSamplesMock.mockReset();
  });

  it("accepts append=true even when extra keys are present", async () => {
    const blogger = {
      id: "11111111-1111-4111-8111-111111111111",
      platform: "douyin",
      profile_url: "https://www.douyin.com/user/MS4wTEST",
      sec_uid: "MS4wTEST",
      douyin_id: "tester",
      display_name: "测试博主",
      avatar_url: null,
      follow_count: null,
      fans_count: null,
      liked_count: null,
      signature: null,
      status: "sampled",
      last_error: null,
      profile_captured_at: "2026-05-07T00:00:00.000Z",
      sampled_at: "2026-05-07T00:00:00.000Z",
      total_works_at_sample: 1,
      analysis_generated_at: null,
      analysis_error: null,
      created_at: "2026-05-07T00:00:00.000Z",
      updated_at: "2026-05-07T00:00:00.000Z",
    };
    const existingSample = {
      position: 0,
      video_url: "https://www.douyin.com/video/7000000000000000001",
      title: "旧作品",
      source_index: 0,
      sampled_at: "2026-05-07T00:00:00.000Z",
      transcript: null,
      transcript_lang: null,
      frames: [],
      analyzed_at: null,
      analyze_error: null,
    };
    const newSample = {
      position: 0,
      video_url: "https://www.douyin.com/video/7000000000000000002",
      title: "新作品",
      source_index: 1,
      sampled_at: "2026-05-07T00:01:00.000Z",
      transcript: null,
      transcript_lang: null,
      frames: [],
      analyzed_at: null,
      analyze_error: null,
    };

    getBloggerMock.mockResolvedValueOnce(blogger).mockResolvedValueOnce(blogger);
    listBloggerSamplesMock.mockResolvedValueOnce([existingSample]).mockResolvedValueOnce([
      existingSample,
      newSample,
    ]);
    appendBloggerSamplesMock.mockResolvedValue(undefined);
    rpcMock.mockResolvedValue({
      schema_version: "1",
      ok: true,
      total_works: 2,
      samples: [
        {
          position: 0,
          video_url: newSample.video_url,
          title: newSample.title,
          source_index: newSample.source_index,
        },
      ],
    });

    const mod = await import("./blogger-sample-videos");
    mod.registerBloggerSampleVideosHandler();

    const registered = handleMock.mock.calls.find((call) => call[0] === "blogger:sample-videos");
    expect(registered).toBeDefined();
    const handler = registered?.[1] as (event: unknown, args: unknown) => Promise<unknown>;

    const result = await handler({}, {
      id: blogger.id,
      k: 1,
      append: true,
      future_flag: "ignored",
    });

    expect(rpcMock).toHaveBeenCalledWith("bloggerSampleVideos", {
      blogger_id: blogger.id,
      profile_url: blogger.profile_url,
      k: 1,
      exclude_video_urls: [existingSample.video_url],
    });
    expect(appendBloggerSamplesMock).toHaveBeenCalledOnce();
    expect(result).toMatchObject({
      schema_version: "1",
      ok: true,
      blogger: { id: blogger.id },
      samples: [{ video_url: existingSample.video_url }, { video_url: newSample.video_url }],
    });
  });
});
