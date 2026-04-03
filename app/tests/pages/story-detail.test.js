const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const PAGE_PATH = require.resolve("../../miniprogram/pages/story-detail/index");
const STORY_SERVICE_PATH = require.resolve("../../miniprogram/services/story");
const AUTH_SERVICE_PATH = require.resolve("../../miniprogram/services/auth");
const BUSINESS_CASE_ID_PATH = require.resolve("../../miniprogram/utils/businessCaseId");
const USER_AUTH_PATH = require.resolve("../../miniprogram/utils/userAuth");
const PAGE_TEMPLATE_PATH = require.resolve("../../miniprogram/pages/story-detail/index.wxml");

const AUTH_PAGE_STATE = {
  CHECKING: "checking",
  READY: "ready",
  UNAUTHORIZED: "unauthorized",
  ERROR: "error",
};

const STORY_DETAIL = {
  id: "case-4",
  title: "宠物新零售行业创业案例",
  summary: "案例摘要",
  coverImage: "https://example.com/case-4.png",
  tags: ["宠物零售"],
  metaItems: ["4 份专题文档"],
  resultText: "",
  publishedAtText: "2026.03.27",
  defaultDocumentKey: "business_case",
  documentTabs: [
    {
      key: "business_case",
      label: "商业案例",
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
  ],
  documentMap: {
    business_case: {
      key: "business_case",
      label: "商业案例",
      title: "Rework 文档",
      markdownContent: "# 商业案例\n\n第一段\n\n第二段",
    },
    market_research: {
      key: "market_research",
      label: "市场调研",
      title: "市场文档",
      markdownContent: "## 市场调研\n\n市场段落",
    },
    business_model: {
      key: "business_model",
      label: "商业模式",
      title: "商业模式文档",
      markdownContent: "## 商业模式\n\n订阅收入",
    },
    ai_business_upgrade: {
      key: "ai_business_upgrade",
      label: "AI 升级",
      title: "AI 文档",
      markdownContent: "### AI 升级\n\nAI 段落",
    },
  },
};

const PROJECT_STORY_DETAIL = {
  ...STORY_DETAIL,
  id: "project-1",
  type: "project",
  metaItems: ["4 份专题文档"],
  documentTabs: [
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
    {
      key: "how_to_do",
      label: "如何做",
    },
  ],
  documentMap: {
    business_case: STORY_DETAIL.documentMap.business_case,
    market_research: STORY_DETAIL.documentMap.market_research,
    ai_business_upgrade: STORY_DETAIL.documentMap.ai_business_upgrade,
    how_to_do: {
      key: "how_to_do",
      label: "如何做",
      title: "如何做",
      markdownContent: "# 如何做\n\n执行步骤",
    },
  },
};

const clearStoryDetailPageModules = () => {
  delete require.cache[PAGE_PATH];
  delete require.cache[STORY_SERVICE_PATH];
  delete require.cache[AUTH_SERVICE_PATH];
  delete require.cache[BUSINESS_CASE_ID_PATH];
  delete require.cache[USER_AUTH_PATH];
};

const mockModule = (modulePath, exports) => {
  require.cache[modulePath] = {
    id: modulePath,
    filename: modulePath,
    loaded: true,
    exports,
  };
};

const loadStoryDetailPage = ({
  fetchStoryDetail = async () => STORY_DETAIL,
  authorizeCurrentMiniProgramUserProfile = async () => {},
  isUserProfileAuthorizationDenied = () => false,
  syncCurrentMiniProgramUser = async () => ({
    user: {
      openid: "wechat-openid",
      nickname: "妙智学员",
      avatar_url: "cloud://env-id.bucket/avatars/avatar.png",
    },
  }),
  hasAuthenticatedMiniProgramUser = (user) => Boolean(user?.openid),
  decodeBusinessCaseRouteId = (value) => value,
} = {}) => {
  clearStoryDetailPageModules();

  let pageConfig = null;
  global.Page = (config) => {
    pageConfig = config;
  };

  mockModule(STORY_SERVICE_PATH, {
    fetchStoryDetail,
  });
  mockModule(AUTH_SERVICE_PATH, {
    authorizeCurrentMiniProgramUserProfile,
    isUserProfileAuthorizationDenied,
    syncCurrentMiniProgramUser,
  });
  mockModule(BUSINESS_CASE_ID_PATH, {
    decodeBusinessCaseRouteId,
  });
  mockModule(USER_AUTH_PATH, {
    AUTH_PAGE_STATE,
    hasAuthenticatedMiniProgramUser,
  });

  require(PAGE_PATH);
  return pageConfig;
};

const createPageInstance = (pageConfig) => {
  const instance = {
    data: {
      ...pageConfig.data,
    },
    storyId: "",
    setData(update) {
      this.data = {
        ...this.data,
        ...update,
      };
    },
  };

  Object.entries(pageConfig).forEach(([key, value]) => {
    if (typeof value === "function") {
      instance[key] = value;
    }
  });

  return instance;
};

test.afterEach(() => {
  clearStoryDetailPageModules();
  delete global.Page;
  delete global.getApp;
  delete global.wx;
});

test("story detail page opens rework document by default after loading story", async () => {
  const pageConfig = loadStoryDetailPage();
  const page = createPageInstance(pageConfig);

  global.wx = {
    hideNavigationBarLoading() {},
    setNavigationBarTitle() {},
    showNavigationBarLoading() {},
    showToast() {},
  };

  page.storyId = "case-4";
  page.setData({
    authState: AUTH_PAGE_STATE.READY,
  });

  await page.loadStoryDetail();

  assert.equal(page.data.story, STORY_DETAIL);
  assert.equal(page.data.activeDocumentKey, "business_case");
  assert.deepEqual(page.data.activeDocument, STORY_DETAIL.documentMap.business_case);
});

test("story detail page switches active document from the keyed document map", () => {
  const pageConfig = loadStoryDetailPage();
  const page = createPageInstance(pageConfig);

  page.setData({
    story: STORY_DETAIL,
    activeDocumentKey: "business_case",
    activeDocument: STORY_DETAIL.documentMap.business_case,
  });

  page.handleDocumentTabTap({
    currentTarget: {
      dataset: {
        key: "market_research",
      },
    },
  });

  assert.equal(page.data.activeDocumentKey, "market_research");
  assert.deepEqual(page.data.activeDocument, STORY_DETAIL.documentMap.market_research);
});

test("story detail page switches to the case business_model tab", () => {
  const pageConfig = loadStoryDetailPage();
  const page = createPageInstance(pageConfig);

  page.setData({
    story: STORY_DETAIL,
    activeDocumentKey: "business_case",
    activeDocument: STORY_DETAIL.documentMap.business_case,
  });

  page.handleDocumentTabTap({
    currentTarget: {
      dataset: {
        key: "business_model",
      },
    },
  });

  assert.equal(page.data.activeDocumentKey, "business_model");
  assert.deepEqual(page.data.activeDocument, STORY_DETAIL.documentMap.business_model);
});

test("story detail page supports switching to the project how_to_do tab", () => {
  const pageConfig = loadStoryDetailPage({
    fetchStoryDetail: async () => PROJECT_STORY_DETAIL,
  });
  const page = createPageInstance(pageConfig);

  page.setData({
    story: PROJECT_STORY_DETAIL,
    activeDocumentKey: "business_case",
    activeDocument: PROJECT_STORY_DETAIL.documentMap.business_case,
  });

  page.handleDocumentTabTap({
    currentTarget: {
      dataset: {
        key: "how_to_do",
      },
    },
  });

  assert.equal(page.data.activeDocumentKey, "how_to_do");
  assert.deepEqual(page.data.activeDocument, PROJECT_STORY_DETAIL.documentMap.how_to_do);
});

test("story detail page waits for app launch auth before checking current user", async () => {
  let resolveCurrentUserReady = () => {};
  let syncCallCount = 0;
  const app = {
    globalData: {
      currentUserReady: new Promise((resolve) => {
        resolveCurrentUserReady = resolve;
      }),
      currentUserSyncError: null,
    },
  };
  global.getApp = () => app;

  const pageConfig = loadStoryDetailPage({
    syncCurrentMiniProgramUser: async () => {
      syncCallCount += 1;
      return {
        user: {
          openid: "wechat-openid",
          nickname: "妙智学员",
          avatar_url: "cloud://env-id.bucket/avatars/avatar.png",
        },
      };
    },
  });
  const page = createPageInstance(pageConfig);

  global.wx = {
    hideNavigationBarLoading() {},
    setNavigationBarTitle() {},
    showNavigationBarLoading() {},
    showToast() {},
  };

  page.storyId = "case-4";
  const refreshPromise = page.refreshAuthorizationState();

  await Promise.resolve();
  assert.equal(syncCallCount, 0);
  assert.equal(page.data.authState, AUTH_PAGE_STATE.CHECKING);

  resolveCurrentUserReady({
    user: {
      openid: "wechat-openid",
      nickname: "妙智学员",
      avatar_url: "cloud://env-id.bucket/avatars/avatar.png",
    },
  });
  await refreshPromise;

  assert.equal(syncCallCount, 1);
  assert.equal(page.data.authState, AUTH_PAGE_STATE.READY);
});

test("story detail page keeps current content on show after image preview return", () => {
  let syncCallCount = 0

  const pageConfig = loadStoryDetailPage({
    syncCurrentMiniProgramUser: async () => {
      syncCallCount += 1
      return {
        user: {
          openid: "wechat-openid",
          nickname: "妙智学员",
          avatar_url: "cloud://env-id.bucket/avatars/avatar.png",
        },
      }
    },
  })
  const page = createPageInstance(pageConfig)

  page.setData({
    authState: AUTH_PAGE_STATE.READY,
    story: STORY_DETAIL,
    activeDocumentKey: "business_case",
    activeDocument: STORY_DETAIL.documentMap.business_case,
  })

  page.onShow()

  assert.equal(syncCallCount, 0)
  assert.equal(page.data.story, STORY_DETAIL)
  assert.equal(page.data.authState, AUTH_PAGE_STATE.READY)
})

test("story detail template does not render the removed meta row above the title", () => {
  const template = fs.readFileSync(PAGE_TEMPLATE_PATH, "utf8");

  assert.equal(template.includes("detail-article__meta"), false);
  assert.equal(template.includes("detail-article__meta-item"), false);
  assert.equal(template.includes("detail-article__read-time"), false);
  assert.equal(template.includes("story.readTimeText"), false);
  assert.equal(template.includes("detail-section__label"), false);
  assert.equal(template.includes("activeDocument.label"), false);
});

test("story detail template uses the shared markdown renderer for active documents", () => {
  const template = fs.readFileSync(PAGE_TEMPLATE_PATH, "utf8");
  const pageConfig = JSON.parse(fs.readFileSync(require.resolve("../../miniprogram/pages/story-detail/index.json"), "utf8"));

  assert.equal(template.includes("<markdown-renderer"), true);
  assert.equal(template.includes("activeDocument.markdownContent"), true);
  assert.equal(template.includes("activeDocument.paragraphs"), false);
  assert.equal(template.includes("activeDocument.title"), false);
  assert.equal(template.includes("detail-section__title"), false);
  assert.equal(
    pageConfig.usingComponents["markdown-renderer"],
    "/components/markdown-renderer/index"
  );
});

test("story detail page previews cover image only on double tap", () => {
  const pageConfig = loadStoryDetailPage();
  const page = createPageInstance(pageConfig);
  const previewCalls = [];
  const originalDateNow = Date.now;

  global.wx = {
    previewImage(options) {
      previewCalls.push(options);
    },
  };

  page.onLoad({
    id: "case-4",
  });
  page.setData({
    story: STORY_DETAIL,
  });

  let now = 1000;
  Date.now = () => now;

  try {
    page.handleCoverImageTap();
    assert.equal(previewCalls.length, 0);

    now = 1200;
    page.handleCoverImageTap();

    assert.equal(previewCalls.length, 1);
    assert.deepEqual(previewCalls[0], {
      current: STORY_DETAIL.coverImage,
      urls: [STORY_DETAIL.coverImage],
    });
  } finally {
    Date.now = originalDateNow;
  }
});

test("story detail template binds cover image tap handler", () => {
  const template = fs.readFileSync(PAGE_TEMPLATE_PATH, "utf8");

  assert.equal(template.includes('bindtap="handleCoverImageTap"'), true);
});
