const {
  formatDateLabel,
  formatReadTime,
} = require("../utils/format");
const {
  isCloudFileId,
  resolveCloudFileTempUrlMap,
} = require("../utils/cloudFile");
const { request } = require("../core/apiClient");

const STORY_PAGE_SIZE = 6;
const STORY_TYPES = Object.freeze({
  CASE: "case",
  PROJECT: "project",
});
const DEFAULT_DOCUMENT_KEY = "business_case";
const DOCUMENT_DEFINITIONS = Object.freeze([
  {
    key: "business_case",
    label: "创业机会分析",
  },
  {
    key: "market_research",
    label: "市场调研",
  },
  {
    key: "business_model",
    label: "商业模式",
  },
  {
    key: "ai_business_upgrade",
    label: "AI 升级",
  },
  {
    key: "how_to_do",
    label: "如何做",
  },
]);

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags.filter(Boolean).slice(0, 3);
};

const normalizeIndustry = (industry) => {
  if (typeof industry !== "string") {
    return "";
  }

  return industry.trim();
};

const normalizeStoryType = (storyType, { required = true } = {}) => {
  if (typeof storyType !== "string") {
    if (required) {
      throw new Error("story type is invalid.");
    }
    return "";
  }

  const normalizedStoryType = storyType.trim();
  if (normalizedStoryType === "") {
    if (required) {
      throw new Error("story type is invalid.");
    }
    return "";
  }

  if (!Object.values(STORY_TYPES).includes(normalizedStoryType)) {
    throw new Error("story type is invalid.");
  }

  return normalizedStoryType;
};

const normalizeAvailableIndustries = (industries) => {
  if (!Array.isArray(industries)) {
    return [];
  }

  const normalizedIndustries = [];
  const seen = new Set();

  industries.forEach((industry) => {
    if (typeof industry !== "string") {
      return;
    }

    const normalizedIndustry = industry.trim();
    if (!normalizedIndustry || seen.has(normalizedIndustry)) {
      return;
    }

    seen.add(normalizedIndustry);
    normalizedIndustries.push(normalizedIndustry);
  });

  return normalizedIndustries;
};

const buildMetaItems = (story) => {
  return [story.stage, story.industry, story.city].filter(Boolean);
};

const resolvePublishedAt = (story = {}) => story.published_at || story.publishedAt || "";
const resolveRawCoverImage = (story = {}) =>
  typeof story.cover_image_url === "string"
    ? story.cover_image_url.trim()
    : typeof story.coverImageUrl === "string"
      ? story.coverImageUrl.trim()
      : "";

const buildCoverImageTempUrlMap = (stories = []) =>
  resolveCloudFileTempUrlMap(stories.map(resolveRawCoverImage));

const resolveCoverImage = (story = {}, coverImageTempUrlMap = {}) => {
  const rawCoverImage = resolveRawCoverImage(story);

  if (rawCoverImage === "") {
    return "";
  }

  if (isCloudFileId(rawCoverImage)) {
    return coverImageTempUrlMap[rawCoverImage] || "";
  }

  return rawCoverImage;
};

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

const normalizeStoryListItem = (story = {}, coverImageTempUrlMap = {}) => ({
  id: story.case_id ? String(story.case_id) : story._id || "",
  type: normalizeStoryType(story.type),
  title: story.title || "",
  summary: story.summary || "",
  industry: normalizeIndustry(story.industry),
  coverImage: resolveCoverImage(story, coverImageTempUrlMap),
  tags: normalizeTags(story.tags),
  metaItems: buildStoryListMetaItems(story),
  resultText: story.resultText || "",
  readTimeText: formatReadTime(story.readTime),
  publishedAtText: formatDateLabel(resolvePublishedAt(story)),
});

const normalizeStoryDetail = (story = {}, coverImageTempUrlMap = {}) => {
  const documentMap = story.documents
    ? buildDocumentMap(story.documents)
    : buildLegacyDocumentMap(story);

  const summaryMarkdown =
    typeof story.summary_markdown === "string" ? story.summary_markdown.trim() : "";
  if (summaryMarkdown) {
    documentMap["summary"] = {
      key: "summary",
      label: "简介",
      title: "简介",
      markdownContent: summaryMarkdown,
    };
  }

  const rawDocumentTabs = buildDocumentTabs(documentMap);
  const documentTabs = rawDocumentTabs;

  const metaItems = buildStoryListMetaItems(story);
  const normalizedMetaItems =
    metaItems.length > 0
      ? metaItems
      : story.documents && rawDocumentTabs.length > 0
        ? [`${rawDocumentTabs.length} 份专题文档`]
        : [];

  return {
    id: story.case_id ? String(story.case_id) : story._id || "",
    type: normalizeStoryType(story.type),
    title: story.title || "",
    summary: story.summary || "",
    industry: normalizeIndustry(story.industry),
    coverImage: resolveCoverImage(story, coverImageTempUrlMap),
    tags: normalizeTags(story.tags),
    metaItems: normalizedMetaItems,
    resultText: story.resultText || "",
    publishedAtText: formatDateLabel(resolvePublishedAt(story)),
    defaultDocumentKey: summaryMarkdown ? "summary" : resolveDefaultDocumentKey(documentMap),
    documentTabs,
    documentMap,
  };
};

const fetchStoryList = async ({
  pageSize = STORY_PAGE_SIZE,
  cursor = "",
  type,
  industry = "",
  keyword = "",
} = {}) => {
  const normalizedType = normalizeStoryType(type, { required: false });
  const query = {
    limit: pageSize,
    cursor,
    industry,
    keyword,
  };
  if (normalizedType) {
    query.type = normalizedType;
  }
  const result = await request({
    path: "/business-cases",
    method: "GET",
    query,
  });
  const itemList = Array.isArray(result.items) ? result.items : [];
  const coverImageTempUrlMap = await buildCoverImageTempUrlMap(itemList);

  return {
    list: itemList.map((item) => normalizeStoryListItem(item, coverImageTempUrlMap)),
    nextCursor: result.next_cursor || "",
    hasMore: Boolean(result.next_cursor),
    availableIndustries: normalizeAvailableIndustries(result.available_industries),
  };
};

const fetchStoryDetail = async (id) => {
  const result = await request({
    path: `/business-cases/${id}`,
    method: "GET",
  });
  const coverImageTempUrlMap = await buildCoverImageTempUrlMap([result]);

  return normalizeStoryDetail(result, coverImageTempUrlMap);
};

module.exports = {
  STORY_PAGE_SIZE,
  STORY_TYPES,
  fetchStoryDetail,
  fetchStoryList,
};
