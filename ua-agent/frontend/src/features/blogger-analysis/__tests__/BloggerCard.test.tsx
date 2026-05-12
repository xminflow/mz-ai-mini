import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Blogger } from "@/shared/contracts/blogger";

import { BloggerCard } from "../components/BloggerCard";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/features/blogger-analysis/hooks/useBloggers", () => ({
  useBloggerAnalyze: () => ({}),
  useBloggerCaptureProfile: () => ({}),
  useBloggerDelete: () => ({}),
}));

describe("BloggerCard", () => {
  it("navigates to the detail page when the card is clicked", () => {
    const blogger: Blogger = {
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
      signature: null,
      status: "pending",
      last_error: null,
      profile_captured_at: null,
      sampled_at: null,
      total_works_at_sample: null,
      analysis_generated_at: null,
      analysis_error: null,
      created_at: "2026-05-01T00:00:00.000Z",
      updated_at: "2026-05-01T00:00:00.000Z",
    };

    render(<BloggerCard blogger={blogger} />);

    expect(screen.queryByRole("button")).toBeNull();
    fireEvent.click(screen.getByTestId("blogger-card"));

    expect(mockNavigate).toHaveBeenCalledWith("/blogger-analysis/douyin/blogger-1");
  });

  it("hides analysis failure details on the card", () => {
    const blogger: Blogger = {
      id: "blogger-2",
      platform: "douyin",
      profile_url: "https://www.douyin.com/user/MS4wTEST2",
      sec_uid: "MS4wTEST2",
      douyin_id: "zuozhejia2",
      display_name: "作者乙",
      avatar_url: null,
      follow_count: 123,
      fans_count: 456,
      liked_count: 789,
      signature: null,
      status: "sampled",
      last_error: null,
      profile_captured_at: "2026-05-01T00:00:00.000Z",
      sampled_at: "2026-05-02T00:00:00.000Z",
      total_works_at_sample: 12,
      analysis_generated_at: null,
      analysis_error: "Traceback: sample failure detail",
      created_at: "2026-05-01T00:00:00.000Z",
      updated_at: "2026-05-02T00:00:00.000Z",
    };

    render(<BloggerCard blogger={blogger} />);

    expect(screen.queryByText("报告失败")).toBeNull();
    expect(screen.queryByText("Traceback: sample failure detail")).toBeNull();
  });
});
