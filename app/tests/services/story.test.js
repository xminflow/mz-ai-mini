const test = require("node:test");
const assert = require("node:assert/strict");

const STORY_SERVICE_PATH = require.resolve("../../miniprogram/services/story");
const API_CLIENT_PATH = require.resolve("../../miniprogram/core/apiClient");
const RUNTIME_CONFIG_PATH = require.resolve("../../miniprogram/core/runtime-config");
const LOCAL_RUNTIME_CONFIG_PATH = require.resolve(
  "../../miniprogram/core/runtime-config.local"
);
const RUNTIME_MODE_PATH = require.resolve("../../miniprogram/core/runtime-mode");

const clearStoryModules = () => {
  delete require.cache[STORY_SERVICE_PATH];
  delete require.cache[API_CLIENT_PATH];
  delete require.cache[RUNTIME_CONFIG_PATH];
  delete require.cache[LOCAL_RUNTIME_CONFIG_PATH];
  delete require.cache[RUNTIME_MODE_PATH];
};

const loadStoryService = ({ localRuntimeConfig = {} } = {}) => {
  clearStoryModules();
  require.cache[LOCAL_RUNTIME_CONFIG_PATH] = {
    id: LOCAL_RUNTIME_CONFIG_PATH,
    filename: LOCAL_RUNTIME_CONFIG_PATH,
    loaded: true,
    exports: localRuntimeConfig,
  };
  return require("../../miniprogram/services/story");
};

test.afterEach(() => {
  clearStoryModules();
  delete global.wx;
});

test("fetchStoryList maps backend business cases and keeps direct cover image urls in develop", async () => {
  global.wx = {
    getAccountInfoSync() {
      return {
        miniProgram: {
          envVersion: "develop",
        },
      };
    },
    request(options) {
      assert.equal(
        options.url,
        "http://127.0.0.1:8000/api/v1/business-cases?limit=6&cursor=cursor-1&industry=%E6%B6%88%E8%B4%B9&keyword=AI%20%E6%8F%90%E6%95%88"
      );
      assert.equal(options.method, "GET");
      assert.equal(options.header["X-WX-OPENID"], "local-dev-openid");
      assert.equal(options.header["X-WX-APPID"], "wx-local-dev");

      options.success({
        statusCode: 200,
        data: {
          code: "COMMON.SUCCESS",
          message: "success",
          data: {
            items: [
              {
                case_id: 1001,
                title: "案例 A",
                summary: "案例摘要",
                industry: "消费",
                tags: ["连锁增长", "AI 提效"],
                cover_image_url: "https://example.com/case-a.png",
                published_at: "2026-03-20T08:00:00Z",
              },
            ],
            next_cursor: "cursor-2",
            available_industries: ["科技", "消费", "金融"],
          },
        },
      });
    },
  };

  const { fetchStoryList } = loadStoryService();
  const result = await fetchStoryList({
    pageSize: 6,
    cursor: "cursor-1",
    industry: "消费",
    keyword: "AI 提效",
  });

  assert.equal(result.nextCursor, "cursor-2");
  assert.equal(result.hasMore, true);
  assert.deepEqual(result.availableIndustries, ["科技", "消费", "金融"]);
  assert.deepEqual(result.list[0], {
    id: "1001",
    title: "案例 A",
    summary: "案例摘要",
    industry: "消费",
    coverImage: "https://example.com/case-a.png",
    tags: ["连锁增长", "AI 提效"],
    metaItems: ["消费"],
    resultText: "",
    readTimeText: "5 分钟阅读",
    publishedAtText: "2026.03.20",
  });
});

test("fetchStoryDetail maps keyed documents and ordered tabs over HTTP in develop", async () => {
  global.wx = {
    getAccountInfoSync() {
      return {
        miniProgram: {
          envVersion: "develop",
        },
      };
    },
    request(options) {
      assert.equal(options.url, "http://127.0.0.1:8000/api/v1/business-cases/1001");
      assert.equal(options.method, "GET");
      assert.equal(options.header["X-WX-OPENID"], "local-dev-openid");

      options.success({
        statusCode: 200,
        data: {
          code: "COMMON.SUCCESS",
          message: "success",
          data: {
            case_id: 1001,
            title: "案例 A",
            summary: "案例摘要",
            industry: "消费",
            tags: ["连锁增长", "AI 提效"],
            cover_image_url: "https://example.com/case-a.png",
            published_at: "2026-03-20T08:00:00Z",
            documents: {
              business_case: {
                title: "从线下咨询到线上课程",
                markdown_content: "# 商业案例\n\n**第一段**\n\n- 第二段",
              },
              market_research: {
                title: "目标市场调研",
                markdown_content: "## 市场调研\n\n1. 用户画像\n\n2. 渠道判断",
              },
              ai_business_upgrade: {
                title: "AI 升级路径",
                markdown_content: "### AI 升级\n\n`自动化脚本`\n\n[上线节奏](https://example.com)",
              },
            },
          },
        },
      });
    },
  };

  const { fetchStoryDetail } = loadStoryService();
  const result = await fetchStoryDetail("1001");

  assert.equal(result.id, "1001");
  assert.equal(result.coverImage, "https://example.com/case-a.png");
  assert.equal(result.publishedAtText, "2026.03.20");
  assert.equal(result.industry, "消费");
  assert.deepEqual(result.tags, ["连锁增长", "AI 提效"]);
  assert.deepEqual(result.metaItems, ["消费"]);
  assert.equal(Object.hasOwn(result, "readTimeText"), false);
  assert.equal(result.defaultDocumentKey, "business_case");
  assert.deepEqual(result.documentTabs, [
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
  assert.deepEqual(result.documentMap.business_case, {
    key: "business_case",
    label: "商业案例",
    title: "从线下咨询到线上课程",
    markdownContent: "# 商业案例\n\n**第一段**\n\n- 第二段",
  });
  assert.equal(
    result.documentMap.ai_business_upgrade.markdownContent,
    "### AI 升级\n\n`自动化脚本`\n\n[上线节奏](https://example.com)"
  );
});

test("fetchStoryList resolves cloud cover image ids through CloudBase temp urls", async () => {
  global.wx = {
    getAccountInfoSync() {
      return {
        miniProgram: {
          envVersion: "develop",
        },
      };
    },
    request(options) {
      options.success({
        statusCode: 200,
        data: {
          code: "COMMON.SUCCESS",
          message: "success",
          data: {
            items: [
              {
                case_id: 1003,
                title: "案例 C",
                summary: "案例摘要",
                industry: "科技",
                tags: ["宠物"],
                cover_image_url: "cloud://demo-env.bucket/path/case-c.png",
                published_at: "2026-03-20T08:00:00Z",
              },
            ],
            next_cursor: null,
            available_industries: [],
          },
        },
      });
    },
    cloud: {
      getTempFileURL(options) {
        assert.deepEqual(options.fileList, [
          "cloud://demo-env.bucket/path/case-c.png",
        ]);
        options.success({
          fileList: [
            {
              fileID: "cloud://demo-env.bucket/path/case-c.png",
              status: 0,
              tempFileURL: "https://temp.example.com/case-c.png",
            },
          ],
        });
      },
    },
  };

  const { fetchStoryList } = loadStoryService();
  const result = await fetchStoryList();

  assert.equal(result.list[0].coverImage, "https://temp.example.com/case-c.png");
});

test("fetchStoryList uses fixed production backend in trial", async () => {
  global.wx = {
    getAccountInfoSync() {
      return {
        miniProgram: {
          envVersion: "trial",
        },
      };
    },
    cloud: {
      async callContainer(options) {
        assert.deepEqual(options.config, {
          env: "rlink-5g3hqx773b8980a1",
        });
        assert.equal(options.path, "/api/v1/business-cases?limit=6");
        assert.equal(options.method, "GET");
        assert.equal(options.header["X-WX-SERVICE"], "mz-ai");
        assert.equal(options.header["X-WX-OPENID"], undefined);
        assert.equal(options.header["X-WX-APPID"], undefined);

        return {
          statusCode: 200,
          data: {
            code: "COMMON.SUCCESS",
            message: "success",
            data: {
              items: [],
              next_cursor: null,
              available_industries: [],
            },
          },
        };
      },
    },
  };

  const { fetchStoryList } = loadStoryService({
    localRuntimeConfig: {
      target: "remote",
    },
  });
  const result = await fetchStoryList({
    pageSize: 6,
  });

  assert.equal(result.hasMore, false);
  assert.equal(result.nextCursor, "");
  assert.deepEqual(result.availableIndustries, []);
});

test("fetchStoryList uses production backend and omits local identity headers in release", async () => {
  global.wx = {
    getAccountInfoSync() {
      return {
        miniProgram: {
          envVersion: "release",
        },
      };
    },
    cloud: {
      async callContainer(options) {
        assert.deepEqual(options.config, {
          env: "rlink-5g3hqx773b8980a1",
        });
        assert.equal(options.path, "/api/v1/business-cases?limit=6");
        assert.equal(options.method, "GET");
        assert.equal(options.header["X-WX-SERVICE"], "mz-ai");
        assert.equal(options.header["X-WX-OPENID"], undefined);
        assert.equal(options.header["X-WX-APPID"], undefined);

        return {
          statusCode: 200,
          data: {
            code: "COMMON.SUCCESS",
            message: "success",
            data: {
              items: [
                {
                  case_id: 1002,
                  title: "案例 B",
                  summary: "线上接口摘要",
                  industry: "娱乐",
                  tags: ["门店升级"],
                  cover_image_url: "https://example.com/case-b.png",
                  published_at: "2026-03-25T08:00:00Z",
                },
              ],
              next_cursor: null,
              available_industries: ["科技", "娱乐"],
            },
          },
        };
      },
    },
  };

  const { fetchStoryList } = loadStoryService({
    localRuntimeConfig: {
      target: "remote",
    },
  });
  const result = await fetchStoryList({
    pageSize: 6,
  });

  assert.equal(result.hasMore, false);
  assert.equal(result.nextCursor, "");
  assert.deepEqual(result.availableIndustries, ["科技", "娱乐"]);
  assert.equal(result.list[0].id, "1002");
  assert.equal(result.list[0].industry, "娱乐");
  assert.equal(result.list[0].coverImage, "https://example.com/case-b.png");
  assert.deepEqual(result.list[0].tags, ["门店升级"]);
  assert.deepEqual(result.list[0].metaItems, ["娱乐"]);
});
