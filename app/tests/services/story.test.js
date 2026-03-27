const test = require("node:test");
const assert = require("node:assert/strict");

const STORY_SERVICE_PATH = require.resolve("../../miniprogram/services/story");
const API_CLIENT_PATH = require.resolve("../../miniprogram/core/apiClient");
const RUNTIME_CONFIG_PATH = require.resolve("../../miniprogram/core/runtime-config");
const RUNTIME_MODE_PATH = require.resolve("../../miniprogram/core/runtime-mode");

const UNIFIED_TEST_COVER_IMAGE = "/images/test_cover.jpg";

const clearStoryModules = () => {
  delete require.cache[STORY_SERVICE_PATH];
  delete require.cache[API_CLIENT_PATH];
  delete require.cache[RUNTIME_CONFIG_PATH];
  delete require.cache[RUNTIME_MODE_PATH];
};

const loadStoryService = () => {
  clearStoryModules();
  return require("../../miniprogram/services/story");
};

test.afterEach(() => {
  clearStoryModules();
  delete global.wx;
});

test("fetchStoryList maps backend business cases and sends local identity headers in develop", async () => {
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
        "http://127.0.0.1:8000/api/v1/business-cases?limit=6&cursor=cursor-1&tag=AI%20%E6%8F%90%E6%95%88"
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
                tags: ["连锁增长", "AI 提效"],
                cover_image_url: "https://example.com/case-a.png",
                published_at: "2026-03-20T08:00:00Z",
              },
            ],
            next_cursor: "cursor-2",
            available_tags: ["连锁增长", "AI 提效", "门店升级"],
          },
        },
      });
    },
  };

  const { fetchStoryList } = loadStoryService();
  const result = await fetchStoryList({
    pageSize: 6,
    cursor: "cursor-1",
    tag: "AI 提效",
  });

  assert.equal(result.nextCursor, "cursor-2");
  assert.equal(result.hasMore, true);
  assert.deepEqual(result.availableTags, ["连锁增长", "AI 提效", "门店升级"]);
  assert.deepEqual(result.list[0], {
    id: "1001",
    title: "案例 A",
    summary: "案例摘要",
    coverImage: UNIFIED_TEST_COVER_IMAGE,
    tags: ["连锁增长", "AI 提效"],
    metaItems: [],
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
  assert.equal(result.publishedAtText, "2026.03.20");
  assert.deepEqual(result.tags, ["连锁增长", "AI 提效"]);
  assert.deepEqual(result.metaItems, ["3 份专题文档"]);
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

test("fetchStoryList stays on HTTP and omits local identity headers in release", async () => {
  global.wx = {
    getAccountInfoSync() {
      return {
        miniProgram: {
          envVersion: "release",
        },
      };
    },
    request(options) {
      assert.equal(
        options.url,
        "https://your-http-api-origin.example.com/api/v1/business-cases?limit=6"
      );
      assert.equal(options.method, "GET");
      assert.equal(options.header["X-WX-OPENID"], undefined);
      assert.equal(options.header["X-WX-APPID"], undefined);

      options.success({
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
                tags: ["门店升级"],
                cover_image_url: "https://example.com/case-b.png",
                published_at: "2026-03-25T08:00:00Z",
              },
            ],
            next_cursor: null,
            available_tags: ["门店升级"],
          },
        },
      });
    },
  };

  const { fetchStoryList } = loadStoryService();
  const result = await fetchStoryList({
    pageSize: 6,
  });

  assert.equal(result.hasMore, false);
  assert.equal(result.nextCursor, "");
  assert.deepEqual(result.availableTags, ["门店升级"]);
  assert.equal(result.list[0].id, "1002");
  assert.deepEqual(result.list[0].tags, ["门店升级"]);
});
