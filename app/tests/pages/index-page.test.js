const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const PAGE_PATH = require.resolve("../../miniprogram/pages/index/index");
const STORY_SERVICE_PATH = require.resolve("../../miniprogram/services/story");
const BUSINESS_CASE_ID_PATH =
  require.resolve("../../miniprogram/utils/businessCaseId");
const PAGE_TEMPLATE_PATH =
  require.resolve("../../miniprogram/pages/index/index.wxml");

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

const clearIndexPageModules = () => {
  delete require.cache[PAGE_PATH];
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

const loadIndexPage = ({
  fetchStoryList = async () => ({
    list: [],
    nextCursor: "",
    hasMore: false,
    availableIndustries: DEFAULT_INDUSTRIES,
  }),
  encodeBusinessCaseRouteId = (value) => value,
} = {}) => {
  clearIndexPageModules();

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
  clearIndexPageModules();
  delete global.Page;
  delete global.wx;
});

test("index page opens industry selector when tapping the more tab", () => {
  const pageConfig = loadIndexPage();
  const page = createPageInstance(pageConfig);

  page.handleSelectTab({
    currentTarget: {
      dataset: {
        industry: "__more__",
      },
    },
  });

  assert.equal(page.data.isIndustrySelectorVisible, true);
});

test("index page submits confirmed keyword with the current industry filter", async () => {
  const requests = [];
  const pageConfig = loadIndexPage({
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
    selectedIndustry: "消费",
    keywordInput: "宠物",
    submittedKeyword: "",
  });

  await page.handleSubmitKeywordSearch({
    detail: {
      value: "宠物",
    },
  });

  assert.deepEqual(requests[0], {
    pageSize: 6,
    industry: "消费",
    keyword: "宠物",
  });
  assert.equal(page.data.submittedKeyword, "宠物");
});

test("index page switches industry from the selector and closes the sheet", async () => {
  const requests = [];
  const pageConfig = loadIndexPage({
    fetchStoryList: async (options) => {
      requests.push(options);
      return {
        list: [],
        nextCursor: "",
        hasMore: false,
        availableIndustries: ["科技", "消费", "金融"],
      };
    },
  });
  const page = createPageInstance(pageConfig);

  global.wx = {
    stopPullDownRefresh() {},
    showToast() {},
  };

  page.setData({
    isIndustrySelectorVisible: true,
    selectedIndustry: "",
    submittedKeyword: "增长",
  });

  await page.handleSelectIndustryOption({
    currentTarget: {
      dataset: {
        industry: "金融",
      },
    },
  });

  assert.equal(page.data.isIndustrySelectorVisible, false);
  assert.deepEqual(requests[0], {
    pageSize: 6,
    industry: "金融",
    keyword: "增长",
  });
});

test("index template renders search input and industry selector sheet", () => {
  const template = fs.readFileSync(PAGE_TEMPLATE_PATH, "utf8");

  assert.equal(template.includes('placeholder="搜索案例关键词"'), true);
  assert.equal(
    template.includes('bindconfirm="handleSubmitKeywordSearch"'),
    true,
  );
  assert.equal(template.includes('class="industry-sheet__mask"'), true);
  assert.equal(template.includes('bindtap="handleSelectIndustryOption"'), true);
});
