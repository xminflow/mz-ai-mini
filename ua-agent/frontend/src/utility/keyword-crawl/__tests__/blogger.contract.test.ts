import { beforeEach, describe, expect, it, vi } from "vitest";

const emitBloggerEventMock = vi.fn();
const terminateBrowserMock = vi.fn();
const navigateToMock = vi.fn();
const sleepMock = vi.fn();
const pressKeyMock = vi.fn();
const scrollWorksToBottomMock = vi.fn();
const extractAllWorksMock = vi.fn();
const stratifiedSampleMock = vi.fn();

vi.mock("../infra/events", () => ({
  emitBloggerEvent: emitBloggerEventMock,
}));

vi.mock("../infra/logger", () => ({
  getLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock("../service", () => ({
  getService: () => ({
    terminateBrowser: terminateBrowserMock,
  }),
}));

vi.mock("../runtime/executorContext", () => ({
  getBatchExecutorFromContext: () => ({
    isRunning: () => false,
  }),
  getBatchExecutorReady: async () => ({
    getPort: () => ({
      navigateTo: navigateToMock,
      sleep: sleepMock,
      evaluator: () => ({}),
      pressKey: pressKeyMock,
    }),
  }),
}));

vi.mock("../domain/douyinProfileDom", () => ({
  expandBioIfTruncated: vi.fn(),
  readDouyinProfile: vi.fn(),
  scrollWorksToBottom: scrollWorksToBottomMock,
  extractAllWorks: extractAllWorksMock,
}));

vi.mock("../domain/sampling", () => ({
  stratifiedSample: stratifiedSampleMock,
}));

describe("bloggerSampleVideosHandler", () => {
  beforeEach(() => {
    emitBloggerEventMock.mockReset();
    terminateBrowserMock.mockReset();
    navigateToMock.mockReset();
    sleepMock.mockReset();
    pressKeyMock.mockReset();
    scrollWorksToBottomMock.mockReset();
    extractAllWorksMock.mockReset();
    stratifiedSampleMock.mockReset();

    terminateBrowserMock.mockResolvedValue(undefined);
    navigateToMock.mockResolvedValue(undefined);
    sleepMock.mockResolvedValue(undefined);
    pressKeyMock.mockResolvedValue(undefined);
    scrollWorksToBottomMock.mockResolvedValue({
      totalScrolls: 3,
      finalCardCount: 2,
      reachedBottom: true,
    });
    extractAllWorksMock.mockResolvedValue([
      { url: "https://www.douyin.com/video/7000000000000000001", title: "作品 1", index: 0 },
      { url: "https://www.douyin.com/video/7000000000000000002", title: "作品 2", index: 1 },
    ]);
    stratifiedSampleMock.mockImplementation((works: unknown[]) => works.slice(0, 1));
  });

  it("treats append as a compatibility no-op instead of INVALID_INPUT", async () => {
    const { bloggerSampleVideosHandler } = await import("../handlers/blogger");
    const result = await bloggerSampleVideosHandler({
      blogger_id: "11111111-1111-4111-8111-111111111111",
      profile_url: "https://www.douyin.com/user/MS4wTEST",
      k: 1,
      append: true,
    });

    expect(result).toMatchObject({
      schema_version: "1",
      ok: true,
      total_works: 2,
      samples: [
        {
          position: 0,
          video_url: "https://www.douyin.com/video/7000000000000000001",
        },
      ],
    });
  });
});
