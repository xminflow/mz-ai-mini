const HEIGHT_WEIGHTS = Object.freeze({
  cover: 220,
  bodyPadding: 72,
  metaRow: 34,
  titleRow: 40,
  summaryRow: 32,
  tagRow: 44,
  resultRow: 30,
  resultBlockPadding: 32,
});

const DEFAULT_AVAILABLE_INDUSTRIES = Object.freeze([
  "科技",
  "消费",
  "金融",
  "医疗",
  "教育",
  "企业服务",
  "自媒体",
  "娱乐",
  "本地生活",
  "工业与供应链",
  "其他",
]);

const PRIMARY_INDUSTRY_LIST = Object.freeze([
  "自媒体",
  "消费",
  "娱乐",
]);

const MORE_INDUSTRY_TAB_VALUE = "__more__";

const getTextLength = (value = "") => Array.from(String(value).trim()).length;

const getLineCount = (value, charsPerLine, maxLines) => {
  const textLength = getTextLength(value);

  if (textLength === 0) {
    return 0;
  }

  return Math.min(Math.ceil(textLength / charsPerLine), maxLines);
};

const getTagRowCount = (tags = []) => {
  if (!Array.isArray(tags) || tags.length === 0) {
    return 0;
  }

  let rowCount = 1;
  let currentRowWidth = 0;

  tags.forEach((tag) => {
    const nextWidth = getTextLength(tag) + 4;

    if (currentRowWidth !== 0 && currentRowWidth + nextWidth > 16) {
      rowCount += 1;
      currentRowWidth = 0;
    }

    currentRowWidth += nextWidth;
  });

  return rowCount;
};

const estimateStoryCardHeight = (story = {}) => {
  const hasMeta = Array.isArray(story.metaItems) && story.metaItems.length > 0;
  const titleLines = Math.max(getLineCount(story.title, 12, 2), 1);
  const summaryLines = getLineCount(story.summary, 12, 4);
  const resultLines = getLineCount(story.resultText, 12, 3);
  const tagRows = getTagRowCount(story.tags);
  const resultHeight =
    resultLines > 0
      ? resultLines * HEIGHT_WEIGHTS.resultRow + HEIGHT_WEIGHTS.resultBlockPadding
      : 0;

  return (
    HEIGHT_WEIGHTS.cover +
    HEIGHT_WEIGHTS.bodyPadding +
    (hasMeta ? HEIGHT_WEIGHTS.metaRow : 0) +
    titleLines * HEIGHT_WEIGHTS.titleRow +
    summaryLines * HEIGHT_WEIGHTS.summaryRow +
    tagRows * HEIGHT_WEIGHTS.tagRow +
    resultHeight
  );
};

const buildWaterfallColumns = (storyList = []) => {
  const columns = [
    { items: [], estimatedHeight: 0 },
    { items: [], estimatedHeight: 0 },
  ];

  storyList.forEach((story) => {
    const targetColumnIndex =
      columns[0].estimatedHeight <= columns[1].estimatedHeight ? 0 : 1;
    const estimatedHeight = estimateStoryCardHeight(story);

    columns[targetColumnIndex].items.push(story);
    columns[targetColumnIndex].estimatedHeight += estimatedHeight;
  });

  return {
    leftColumnStoryList: columns[0].items,
    rightColumnStoryList: columns[1].items,
  };
};

const normalizeAvailableIndustries = (availableIndustries = []) => {
  if (!Array.isArray(availableIndustries) || availableIndustries.length === 0) {
    return [...DEFAULT_AVAILABLE_INDUSTRIES];
  }

  const industries = [];
  const seen = new Set();

  availableIndustries.forEach((industry) => {
    if (typeof industry !== "string") {
      return;
    }

    const normalizedIndustry = industry.trim();
    if (!normalizedIndustry || seen.has(normalizedIndustry)) {
      return;
    }

    seen.add(normalizedIndustry);
    industries.push(normalizedIndustry);
  });

  return industries.length > 0 ? industries : [...DEFAULT_AVAILABLE_INDUSTRIES];
};

const buildIndustryTabs = (selectedIndustry = "") => {
  const isMoreActive =
    selectedIndustry !== "" && !PRIMARY_INDUSTRY_LIST.includes(selectedIndustry);

  return [
    {
      key: "all",
      label: "全部",
      value: "",
      isActive: selectedIndustry === "",
    },
    ...PRIMARY_INDUSTRY_LIST.map((industry) => ({
      key: industry,
      label: industry,
      value: industry,
      isActive: selectedIndustry === industry,
    })),
    {
      key: "more",
      label: "更多",
      value: MORE_INDUSTRY_TAB_VALUE,
      isActive: isMoreActive,
      isMore: true,
    },
  ];
};

const buildIndustryOptions = (
  availableIndustries = DEFAULT_AVAILABLE_INDUSTRIES,
  selectedIndustry = ""
) => {
  const normalizedIndustries = normalizeAvailableIndustries(availableIndustries);

  return [
    {
      key: "all",
      label: "全部",
      value: "",
      isActive: selectedIndustry === "",
    },
    ...normalizedIndustries.map((industry) => ({
      key: industry,
      label: industry,
      value: industry,
      isActive: selectedIndustry === industry,
    })),
  ];
};

module.exports = {
  DEFAULT_AVAILABLE_INDUSTRIES,
  MORE_INDUSTRY_TAB_VALUE,
  buildIndustryOptions,
  buildIndustryTabs,
  normalizeAvailableIndustries,
  buildWaterfallColumns,
  estimateStoryCardHeight,
};
