const {
  formatDateLabel,
  formatReadTime,
} = require("../utils/format");
const { request } = require("../core/apiClient");

const STORY_PAGE_SIZE = 6;
const UNIFIED_TEST_COVER_IMAGE = "/images/test_cover.jpg";
const DEFAULT_DOCUMENT_KEY = "business_case";
const DOCUMENT_DEFINITIONS = Object.freeze([
  {
    key: "business_case",
    label: "商业案例",
  },
  {
    key: "market_research",
    label: "市场调研",
  },
  {
    key: "ai_business_upgrade",
    label: "AI 升级",
  },
]);

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags.filter(Boolean).slice(0, 3);
};

const normalizeAvailableTags = (tags) => {
  if (!Array.isArray(tags)) {
    return [];
  }

  const normalizedTags = [];
  const seen = new Set();

  tags.forEach((tag) => {
    if (typeof tag !== "string") {
      return;
    }

    const normalizedTag = tag.trim();
    if (!normalizedTag || seen.has(normalizedTag)) {
      return;
    }

    seen.add(normalizedTag);
    normalizedTags.push(normalizedTag);
  });

  return normalizedTags;
};

const buildMetaItems = (story) => {
  return [story.stage, story.industry, story.city].filter(Boolean);
};

const resolvePublishedAt = (story = {}) => story.published_at || story.publishedAt || "";

const buildStoryListMetaItems = (story = {}) => {
  const metaItems = buildMetaItems(story);
  if (metaItems.length > 0) {
    return metaItems;
  }

  return [];
};

const buildDocumentMap = (documents = {}) => {
  return DOCUMENT_DEFINITIONS.reduce((documentMap, definition) => {
    const document = documents[definition.key];
    if (!document) {
      return documentMap;
    }

    documentMap[definition.key] = {
      key: definition.key,
      label: definition.label,
      title: document.title || definition.label,
      markdownContent: document.markdown_content || "",
    };
    return documentMap;
  }, {});
};

const buildLegacyDocumentMap = (story = {}) => {
  if (!story.content) {
    return {};
  }

  return {
    story: {
      key: "story",
      label: "案例正文",
      title: story.title || "案例正文",
      markdownContent: story.content,
    },
  };
};

const buildDocumentTabs = (documentMap = {}) => {
  const orderedTabs = DOCUMENT_DEFINITIONS.filter(
    (definition) => Boolean(documentMap[definition.key])
  ).map((definition) => ({
    key: definition.key,
    label: definition.label,
  }));

  if (orderedTabs.length > 0) {
    return orderedTabs;
  }

  return Object.values(documentMap).map((document) => ({
    key: document.key,
    label: document.label,
  }));
};

const resolveDefaultDocumentKey = (documentMap = {}) => {
  if (documentMap[DEFAULT_DOCUMENT_KEY]) {
    return DEFAULT_DOCUMENT_KEY;
  }

  const documentKeys = Object.keys(documentMap);
  return documentKeys.length > 0 ? documentKeys[0] : "";
};

const normalizeStoryListItem = (story = {}) => ({
  id: story.case_id ? String(story.case_id) : story._id || "",
  title: story.title || "",
  summary: story.summary || "",
  coverImage: UNIFIED_TEST_COVER_IMAGE,
  tags: normalizeTags(story.tags),
  metaItems: buildStoryListMetaItems(story),
  resultText: story.resultText || "",
  readTimeText: formatReadTime(story.readTime),
  publishedAtText: formatDateLabel(resolvePublishedAt(story)),
});

const normalizeStoryDetail = (story = {}) => {
  const documentMap = story.documents
    ? buildDocumentMap(story.documents)
    : buildLegacyDocumentMap(story);
  const documentTabs = buildDocumentTabs(documentMap);
  const metaItems = buildStoryListMetaItems(story);
  const normalizedMetaItems =
    metaItems.length > 0
      ? metaItems
      : story.documents && documentTabs.length > 0
        ? [`${documentTabs.length} 份专题文档`]
        : [];

  return {
    id: story.case_id ? String(story.case_id) : story._id || "",
    title: story.title || "",
    summary: story.summary || "",
    coverImage: UNIFIED_TEST_COVER_IMAGE,
    tags: normalizeTags(story.tags),
    metaItems: normalizedMetaItems,
    resultText: story.resultText || "",
    publishedAtText: formatDateLabel(resolvePublishedAt(story)),
    defaultDocumentKey: resolveDefaultDocumentKey(documentMap),
    documentTabs,
    documentMap,
  };
};

const fetchStoryList = ({ pageSize = STORY_PAGE_SIZE, cursor = "", tag = "" } = {}) =>
  request({
    path: "/business-cases",
    method: "GET",
    query: {
      limit: pageSize,
      cursor,
      tag,
    },
  }).then((result) => ({
    list: (result.items || []).map(normalizeStoryListItem),
    nextCursor: result.next_cursor || "",
    hasMore: Boolean(result.next_cursor),
    availableTags: normalizeAvailableTags(result.available_tags),
  }));

const fetchStoryDetail = (id) =>
  request({
    path: `/business-cases/${id}`,
    method: "GET",
  }).then(normalizeStoryDetail);

module.exports = {
  STORY_PAGE_SIZE,
  fetchStoryDetail,
  fetchStoryList,
};
