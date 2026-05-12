/**
 * Centralised tooltip strings for icons / badges that appear in the material
 * library views. Keep "label" short, "sublabel" one short sentence answering
 * "what does this mean / why does it matter".
 */

export interface IconHint {
  label: string;
  sublabel?: string;
}

export const iconHints = {
  // Action buttons
  copyShareUrl: {
    label: "复制视频链接",
    sublabel: "把这条素材的原始分享链接复制到剪贴板",
  },
  copyShareUrlDone: { label: "已复制" },
  copyShareUrlFailed: {
    label: "复制失败",
    sublabel: "请检查浏览器剪贴板权限",
  },

  copyDownload: {
    label: "复制下载链接",
    sublabel: "解析无水印下载地址,复制到剪贴板(仅抖音视频)",
  },
  copyDownloadLoading: {
    label: "解析中…",
    sublabel: "正在向抖音请求无水印源",
  },
  copyDownloadDone: { label: "已复制" },
  copyDownloadFailed: { label: "解析失败" },

  extractTranscript: {
    label: "提取文案",
    sublabel: "把视频音频转写为文字",
  },
  extractTranscriptAgain: {
    label: "重新提取",
    sublabel: "重新跑一遍 ASR,覆盖现有文案",
  },
  extractTranscriptLoading: { label: "提取中…" },
  extractTranscriptFailed: { label: "提取失败" },

  deleteEntry: {
    label: "删除该条素材",
    sublabel: "从本地素材库移除这条记录",
  },

  // Toggles
  expandComments: {
    label: "展开评论",
    sublabel: "查看完整评论列表",
  },
  collapseComments: { label: "收起评论" },
  expandTranscript: {
    label: "展开文案",
    sublabel: "查看转写出的完整文案",
  },
  collapseTranscript: { label: "收起文案" },

  // Badges
  platformXiaohongshu: {
    label: "来自小红书",
    sublabel: "数据采集平台",
  },
  platformDouyin: {
    label: "来自抖音",
    sublabel: "数据采集平台",
  },
  lowFollowerHighLike: {
    label: "低粉高赞",
    sublabel: "点赞数 ≥ 粉丝数,可能是小博主出爆款的信号",
  },

  // Source badges (LibraryRow)
  sourcePhone: {
    label: "手机采集",
    sublabel: "通过手机端 mitmproxy 抓包获得",
  },
  sourceXhsKeyword: {
    label: "小红书网页搜索",
    sublabel: "通过浏览器关键词搜索任务批量获得",
  },
  sourceDouyinKeyword: {
    label: "抖音网页搜索",
    sublabel: "通过浏览器关键词搜索任务批量获得",
  },
  sourceDouyinWeb: {
    label: "抖音网页采集",
    sublabel: "由旧版抓取流程采集",
  },
} as const satisfies Record<string, IconHint>;

type StatKind = "likes" | "comments" | "shares" | "collects" | "followers";

const STAT_LABEL: Record<StatKind, string> = {
  likes: "点赞",
  comments: "评论",
  shares: "转发",
  collects: "收藏",
  followers: "粉丝数",
};

const STAT_SUBLABEL: Record<StatKind, string> = {
  likes: "用户为这条内容点的红心数",
  comments: "可见评论总数(不含被屏蔽)",
  shares: "用户分享出去的次数",
  collects: "被加入收藏夹的次数",
  followers: "采集时刻该账号的粉丝总量",
};

/**
 * Build a hint for a stat icon. When `count < 0` (sentinel meaning "未知"),
 * shows a friendlier "未知" label instead of a negative number.
 */
export function statHint(kind: StatKind, count: number): IconHint {
  if (count < 0) {
    if (kind === "followers") {
      return {
        label: "粉丝数未知",
        sublabel: "采集时该平台未公开粉丝数",
      };
    }
    return { label: `${STAT_LABEL[kind]}未知`, sublabel: STAT_SUBLABEL[kind] };
  }
  return {
    label: `${STAT_LABEL[kind]} ${count.toLocaleString("zh-CN")}`,
    sublabel: STAT_SUBLABEL[kind],
  };
}

/** Hint for the "关键词:xxx" badge. */
export function keywordHint(keyword: string): IconHint {
  return {
    label: `搜索词:${keyword}`,
    sublabel: "通过关键词搜索采集到这条素材",
  };
}
