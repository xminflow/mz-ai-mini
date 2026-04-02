const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const PAGE_PATH = require.resolve("../../miniprogram/pages/project/index");
const PAGE_FACTORY_PATH = require.resolve("../../miniprogram/pages/story-feed/createPage");
const STORY_SERVICE_PATH = require.resolve("../../miniprogram/services/story");
const BUSINESS_CASE_ID_PATH =
  require.resolve("../../miniprogram/utils/businessCaseId");
const PAGE_TEMPLATE_PATH =
  require.resolve("../../miniprogram/pages/project/index.wxml");
const APP_CONFIG_PATH = require.resolve("../../miniprogram/app.json");

const DEFAULT_INDUSTRIES = [
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
];

const clearProjectPageModules = () => {
  delete require.cache[PAGE_PATH];
  delete require.cache[PAGE_FACTORY_PATH];
  delete require.cache[STORY_SERVICE_PATH];
  delete require.cache[BUSINESS_CASE_ID_PATH];
};

const mockModule = (modulePath, exports) => {
  require.cache[modulePath] = {
    id: modulePath,
    filename: modulePath,
    loaded: true,
    exports,
  };
};

const loadProjectPage = ({
  fetchStoryList = async () => ({
    list: [],
    nextCursor: "",
    hasMore: false,
    availableIndustries: DEFAULT_INDUSTRIES,
  }),
  encodeBusinessCaseRouteId = (value) => value,
} = {}) => {
  clearProjectPageModules();

  let pageConfig = null;
  global.Page = (config) => {
    pageConfig = config;
  };

  mockModule(STORY_SERVICE_PATH, {
    STORY_PAGE_SIZE: 6,
    fetchStoryList,
  });
  mockModule(BUSINESS_CASE_ID_PATH, {
    encodeBusinessCaseRouteId,
  });

  require(PAGE_PATH);
  return pageConfig;
};

const createPageInstance = (pageConfig) => {
  const instance = {
    data: {
      ...pageConfig.data,
    },
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
  clearProjectPageModules();
  delete global.Page;
  delete global.wx;
});

test("project page uses project feed copy and type", () => {
  const pageConfig = loadProjectPage();

  assert.equal(pageConfig.data.storyType, "project");
  assert.equal(pageConfig.data.pageCopy.searchPlaceholder, "搜索项目关键词");
  assert.equal(pageConfig.data.pageCopy.emptyDefaultTitle, "还没有发布项目");
});

test("project page submits confirmed keyword with the project type filter", async () => {
  const requests = [];
  const pageConfig = loadProjectPage({
    fetchStoryList: async (options) => {
      requests.push(options);
      return {
        list: [],
        nextCursor: "",
        hasMore: false,
        availableIndustries: ["科技", "消费"],
      };
    },
  });
  const page = createPageInstance(pageConfig);

  global.wx = {
    stopPullDownRefresh() {},
    showToast() {},
  };

  page.setData({
    selectedIndustry: "科技",
    keywordInput: "自动化",
    submittedKeyword: "",
  });

  await page.handleSubmitKeywordSearch({
    detail: {
      value: "自动化",
    },
  });

  assert.deepEqual(requests[0], {
    pageSize: 6,
    type: "project",
    industry: "科技",
    keyword: "自动化",
  });
});

test("project template renders shared placeholder binding", () => {
  const template = fs.readFileSync(PAGE_TEMPLATE_PATH, "utf8");

  assert.equal(template.includes('placeholder="{{pageCopy.searchPlaceholder}}"'), true);
  assert.equal(template.includes("pageCopy.emptyDefaultText"), true);
  assert.equal(template.includes('<view class="story-tabs">'), true);
  assert.equal(template.includes("<scroll-view"), false);
});

test("app config registers the project page and tab", () => {
  const appConfig = JSON.parse(fs.readFileSync(APP_CONFIG_PATH, "utf8"));

  assert.equal(appConfig.pages[0], "pages/project/index");
  assert.deepEqual(appConfig.tabBar.list[0], {
    pagePath: "pages/project/index",
    text: "项目",
    iconPath: "images/icons/project.png",
    selectedIconPath: "images/icons/project-active.png",
  });
});
