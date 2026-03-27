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

const ALL_STORY_TAB = Object.freeze({
  label: "全部",
  value: "",
});

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

const buildStoryTabs = (availableTags = []) => {
  const tabs = [ALL_STORY_TAB];
  const seen = new Set();

  availableTags.forEach((tag) => {
    if (typeof tag !== "string") {
      return;
    }

    const normalizedTag = tag.trim();
    if (!normalizedTag || seen.has(normalizedTag)) {
      return;
    }

    seen.add(normalizedTag);
    tabs.push({
      label: normalizedTag,
      value: normalizedTag,
    });
  });

  return tabs;
};

module.exports = {
  buildStoryTabs,
  buildWaterfallColumns,
  estimateStoryCardHeight,
};
