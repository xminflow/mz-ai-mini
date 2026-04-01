const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DEFAULT_AVAILABLE_INDUSTRIES,
  MORE_INDUSTRY_TAB_VALUE,
  buildIndustryOptions,
  buildIndustryTabs,
  buildWaterfallColumns,
  estimateStoryCardHeight,
} = require("../../miniprogram/pages/index/layout");

test("estimateStoryCardHeight grows with denser card content", () => {
  const compactStory = {
    title: "短标题",
    summary: "简短摘要",
    tags: [],
    metaItems: [],
    resultText: "",
    publishedAtText: "",
  };
  const denseStory = {
    title: "这是一个更长的标题，用来模拟双列卡片在窄宽度下的两行占位",
    summary:
      "这是一段更长的摘要，用来模拟瀑布流卡片在信息更密集时需要更高的内容区域。".repeat(2),
    tags: ["私域增长", "AI 升级", "门店连锁"],
    metaItems: ["成熟期", "消费品", "上海"],
    resultText: "三个月内复购率提升 32%，并完成首个单店模型验证。",
    publishedAtText: "2026.03.26",
  };

  assert.ok(estimateStoryCardHeight(denseStory) > estimateStoryCardHeight(compactStory));
});

test("buildWaterfallColumns distributes stories into balanced left and right columns", () => {
  const stories = [
    {
      id: "1",
      title: "短标题",
      summary: "短摘要",
      tags: [],
      metaItems: [],
      resultText: "",
      readTimeText: "5 分钟阅读",
    },
    {
      id: "2",
      title: "用于测试的超长标题，模拟高信息密度卡片在双列布局中的高度变化",
      summary:
        "这是一段明显更长的摘要文本，用来制造更高的卡片高度并验证瀑布流分发是否会优先填充较矮的列。".repeat(2),
      tags: ["增长", "品牌", "复购"],
      metaItems: ["成熟期", "上海"],
      resultText: "结果描述结果描述结果描述结果描述结果描述",
      readTimeText: "12 分钟阅读",
      publishedAtText: "2026.03.20",
    },
    {
      id: "3",
      title: "中等标题",
      summary: "中等摘要".repeat(4),
      tags: ["SaaS"],
      metaItems: ["早期"],
      resultText: "",
      readTimeText: "8 分钟阅读",
    },
    {
      id: "4",
      title: "补位卡片",
      summary: "",
      tags: [],
      metaItems: [],
      resultText: "",
      readTimeText: "4 分钟阅读",
    },
  ];

  const result = buildWaterfallColumns(stories);

  assert.deepEqual(
    result.leftColumnStoryList.map((story) => story.id),
    ["1", "3"]
  );
  assert.deepEqual(
    result.rightColumnStoryList.map((story) => story.id),
    ["2", "4"]
  );
});

test("buildIndustryTabs keeps fixed tabs and marks more active for non-primary industries", () => {
  assert.deepEqual(buildIndustryTabs("金融"), [
    { key: "all", label: "全部", value: "", isActive: false },
    {
      key: "自媒体",
      label: "自媒体",
      value: "自媒体",
      isActive: false,
    },
    { key: "消费", label: "消费", value: "消费", isActive: false },
    { key: "娱乐", label: "娱乐", value: "娱乐", isActive: false },
    {
      key: "more",
      label: "更多",
      value: MORE_INDUSTRY_TAB_VALUE,
      isActive: true,
      isMore: true,
    },
  ]);
});

test("buildIndustryOptions prepends all option and preserves full selector order", () => {
  assert.deepEqual(
    buildIndustryOptions(DEFAULT_AVAILABLE_INDUSTRIES, "消费").slice(0, 4),
    [
      { key: "all", label: "全部", value: "", isActive: false },
      { key: "科技", label: "科技", value: "科技", isActive: false },
      { key: "消费", label: "消费", value: "消费", isActive: true },
      { key: "金融", label: "金融", value: "金融", isActive: false },
    ]
  );
});
