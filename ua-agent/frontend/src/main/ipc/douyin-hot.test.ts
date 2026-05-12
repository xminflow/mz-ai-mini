import { describe, expect, it, vi } from "vitest";

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

vi.mock("electron-log/main", () => ({
  default: {
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

import { extractItems } from "./douyin-hot";

describe("douyin-hot item extraction", () => {
  it("adds clickable Douyin hot-detail URLs from sentence_id", () => {
    const items = extractItems({
      data: {
        word_list: [
          {
            word: "世界杯转播权仍未谈拢",
            sentence_id: "2490293",
            position: 1,
            hot_value: 12112609,
            label: "热",
          },
        ],
      },
    });

    expect(items).toEqual([
      {
        rank: 1,
        word: "世界杯转播权仍未谈拢",
        url: "https://www.douyin.com/hot/2490293",
        hot_value: 12112609,
        label: "热",
      },
    ]);
  });

  it("prefers upstream URLs and falls back to search links", () => {
    const items = extractItems({
      data: {
        word_list: [
          {
            word: "已有上游链接",
            link_url: "//www.douyin.com/hot/abc",
            position: 1,
          },
          {
            word: "没有句子 ID",
            position: 2,
          },
        ],
      },
    });

    expect(items[0]?.url).toBe("https://www.douyin.com/hot/abc");
    expect(items[1]?.url).toBe(
      "https://www.douyin.com/search/%E6%B2%A1%E6%9C%89%E5%8F%A5%E5%AD%90%20ID",
    );
  });
});
