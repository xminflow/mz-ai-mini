import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { bloggerAnalyzeTaskKey, useGlobalTaskCenterStore } from "@/shared/tasks/store";
import { BloggerReportPage } from "../pages/BloggerReportPage";

const mockNavigate = vi.fn();
const mockUseBloggerReport = vi.fn();
const mockUseBloggersList = vi.fn();
const mockUseBloggerSamples = vi.fn();
const mockMutateAsync = vi.fn();
const mockDeleteMutate = vi.fn();
const mockSupplementMutateAsync = vi.fn();
const mockDeleteSampleMutate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "blogger-1" }),
  };
});

vi.mock("@/features/blogger-analysis/hooks/useBloggerReport", () => ({
  useBloggerReport: (...args: unknown[]) => mockUseBloggerReport(...args),
}));

vi.mock("@/features/blogger-analysis/hooks/useBloggers", () => ({
  useBloggersList: (...args: unknown[]) => mockUseBloggersList(...args),
  useBloggerAnalyze: () => ({
    isPending: false,
    variables: undefined,
    mutateAsync: mockMutateAsync,
  }),
  useBloggerSampleVideos: () => ({
    isPending: false,
    variables: undefined,
    mutateAsync: mockSupplementMutateAsync,
  }),
  useBloggerCaptureProfile: () => ({
    isPending: false,
    variables: undefined,
    mutate: vi.fn(),
  }),
  useBloggerDelete: () => ({
    isPending: false,
    variables: undefined,
    mutate: mockDeleteMutate,
  }),
  useBloggerDeleteSample: () => ({
    isPending: false,
    variables: undefined,
    mutate: mockDeleteSampleMutate,
  }),
}));

vi.mock("@/features/blogger-analysis/hooks/useBloggerSamples", () => ({
  useBloggerSamples: (...args: unknown[]) => mockUseBloggerSamples(...args),
}));

describe("BloggerReportPage", () => {
  afterEach(() => {
    useGlobalTaskCenterStore.getState().reset();
  });

  it("renders the resume header, sample list and report tabs", async () => {
    mockUseBloggersList.mockReturnValue({
      bloggers: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mockUseBloggerSamples.mockReturnValue({
      samples: [
        {
          position: 0,
          video_url: "https://www.douyin.com/video/1",
          title: "示例作品",
          source_index: 2,
          sampled_at: "2026-05-06T00:00:00.000Z",
          transcript: "这是一段转写。",
          transcript_lang: "zh",
          frames: ["/frames/1.png", "/frames/2.png"],
          analyzed_at: "2026-05-06T01:00:00.000Z",
          analyze_error: null,
        },
        {
          position: 1,
          video_url: "https://www.douyin.com/video/2",
          title: "采样失败作品",
          source_index: 5,
          sampled_at: "2026-05-06T00:05:00.000Z",
          transcript: null,
          transcript_lang: null,
          frames: [],
          analyzed_at: null,
          analyze_error: "INTERNAL: GET mp4 HTTP 403",
        },
      ],
      isLoading: false,
      isError: false,
    });
    mockUseBloggerReport.mockReturnValue({
      isLoading: false,
      report: {
        schema_version: "1",
        ok: true,
        blogger: {
          id: "blogger-1",
          platform: "douyin",
          profile_url: "https://www.douyin.com/user/MS4wTEST",
          sec_uid: "MS4wTEST",
          douyin_id: "zuozhejia",
          display_name: "作者甲",
          avatar_url: null,
          follow_count: 1234,
          fans_count: 5678,
          liked_count: 91011,
          signature: "认真做内容",
          status: "sampled",
          last_error: null,
          profile_captured_at: "2026-05-05T00:00:00.000Z",
          sampled_at: "2026-05-06T00:00:00.000Z",
          total_works_at_sample: 12,
          analysis_generated_at: "2026-05-06T02:00:00.000Z",
          analysis_error: null,
          created_at: "2026-05-01T00:00:00.000Z",
          updated_at: "2026-05-06T02:00:00.000Z",
        },
        markdown: [
          "---",
          "runId: abc",
          "generatedAt: 2026-05-06T00:00:00.000Z",
          "---",
          "# 为什么作者甲能跑出来",
          "",
          "> 这是一段总判断。",
          "",
          "正文判断段落。",
          "",
          "## 附录",
          "",
          "### 证据附录",
          "",
          "- 证据 A",
          "",
          "### 数据说明",
          "",
          "- 已读取样本：12",
        ].join("\n"),
        path: "D:/tmp/analysis.md",
        generated_at: "2026-05-06T00:00:00.000Z",
      },
    });
    mockDeleteMutate.mockImplementation((_args, options?: { onSuccess?: (result: { ok: boolean }) => void }) => {
      options?.onSuccess?.({ ok: true });
    });
    mockSupplementMutateAsync.mockResolvedValue({
      schema_version: "1",
      ok: true,
      blogger: { id: "blogger-1" },
      samples: [],
    });

    render(<BloggerReportPage />);

    expect(screen.getByTestId("blogger-detail-screen")).toBeInTheDocument();
    expect(screen.getByText("作者甲")).toBeInTheDocument();
    expect(screen.getByText("抖音号: zuozhejia")).toBeInTheDocument();
    expect(screen.getByText("已采样素材")).toBeInTheDocument();
    expect(screen.getByText("示例作品")).toBeInTheDocument();
    expect(screen.getByText("采样失败作品")).toBeInTheDocument();
    expect(screen.getByText("处理失败")).toBeInTheDocument();
    expect(screen.getByText("文案")).toBeInTheDocument();
    expect(screen.queryByText("转写 zh")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "删除素材" })).toHaveLength(2);
    expect(
      screen.getByText("视频下载被平台拒绝（HTTP 403），这类失败会触发自动补样。"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("为什么作者甲能跑出来").length).toBeGreaterThan(0);
    expect(screen.queryByText("runId: abc")).not.toBeInTheDocument();
    expect(screen.queryByText("D:/tmp/analysis.md")).not.toBeInTheDocument();
    expect(screen.queryByText("INTERNAL: GET mp4 HTTP 403")).not.toBeInTheDocument();

    expect(screen.getByRole("tab", { name: "数据说明" })).toBeInTheDocument();
    expect(screen.getByText("证据 A")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "删除素材" })[0]!);
    expect(mockDeleteSampleMutate).toHaveBeenCalledWith({
      blogger_id: "blogger-1",
      video_url: "https://www.douyin.com/video/1",
    });

    fireEvent.click(screen.getByRole("button", { name: "补充素材" }));
    expect(screen.getByRole("heading", { name: "补充素材" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "开始补充并拆解" }));
    });
    expect(mockSupplementMutateAsync).toHaveBeenCalledWith({
      id: "blogger-1",
      k: 5,
      append: true,
    });
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ id: "blogger-1" });
    });

    fireEvent.click(screen.getByRole("button", { name: "重新拆解" }));
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });

    fireEvent.click(screen.getByRole("button", { name: "删除" }));
    expect(screen.getByText("删除博主")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    fireEvent.click(screen.getByRole("button", { name: "返回列表" }));
    expect(mockNavigate).toHaveBeenCalledWith("/blogger-analysis/douyin");
  });

  it("treats a global analyze task as busy after remount", () => {
    act(() => {
      useGlobalTaskCenterStore.setState({
        tasks: {
          [bloggerAnalyzeTaskKey("blogger-1")]: {
            key: bloggerAnalyzeTaskKey("blogger-1"),
            kind: "blogger-analyze",
            entityId: "blogger-1",
            title: "博主拆解",
            subtitle: "博主 12345678",
            detail: "生成拆解报告",
            startedAt: "2026-05-07T00:00:00.000Z",
            progressPercent: 95,
            stopAction: { type: "blogger-analyze", bloggerId: "blogger-1" },
          },
        },
      });
    });
    mockUseBloggersList.mockReturnValue({
      bloggers: [
        {
          id: "blogger-1",
          platform: "douyin",
          profile_url: "https://www.douyin.com/user/MS4wTEST",
          sec_uid: "MS4wTEST",
          douyin_id: "zuozhejia",
          display_name: "作者甲",
          avatar_url: null,
          follow_count: 1234,
          fans_count: 5678,
          liked_count: 91011,
          signature: "认真做内容",
          status: "sampled",
          last_error: null,
          profile_captured_at: "2026-05-05T00:00:00.000Z",
          sampled_at: "2026-05-06T00:00:00.000Z",
          total_works_at_sample: 12,
          analysis_generated_at: null,
          analysis_error: null,
          created_at: "2026-05-01T00:00:00.000Z",
          updated_at: "2026-05-06T02:00:00.000Z",
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mockUseBloggerSamples.mockReturnValue({
      samples: [],
      isLoading: false,
      isError: false,
    });
    mockUseBloggerReport.mockReturnValue({
      isLoading: false,
      report: {
        schema_version: "1",
        ok: false,
        error: { code: "BLOGGER_REPORT_NOT_FOUND", message: "not found" },
      },
    });

    render(<BloggerReportPage />);

    expect(screen.getAllByRole("button", { name: "生成报告中…" })[0]).toBeDisabled();
  });
});
