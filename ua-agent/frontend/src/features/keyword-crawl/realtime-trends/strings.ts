import type { DouyinHotBoardKey } from "@/shared/contracts/douyin-hot";

export const realtimeTrendsStrings = {
  pageHeading: "实时热点",
  pageSubheading: "进入页面时实时拉取抖音 4 个开放榜单，点击右上角「刷新」可重新抓取。",
  refreshButton: "刷新",
  refreshing: "刷新中…",
  loadingHint: "正在加载榜单…",
  emptyState: "暂无榜单数据。",
  errorPrefix: "加载失败：",
  openItemPrefix: "打开抖音热榜：",
  fetchedAtPrefix: "数据更新于 ",
  fetchedAtSuffix: "",
} as const;

export const boardLabels: Record<DouyinHotBoardKey, string> = {
  hot: "热点榜",
  seeding: "种草榜",
  entertainment: "娱乐榜",
  society: "社会榜",
};

export const boardOrder = [
  "hot",
  "seeding",
  "entertainment",
  "society",
] as const satisfies readonly DouyinHotBoardKey[];
