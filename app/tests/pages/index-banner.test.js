const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const INDEX_PAGE_PATH = require.resolve("../../miniprogram/pages/index/index");
const INDEX_TEMPLATE_PATH = require.resolve("../../miniprogram/pages/index/index.wxml");
const APP_ENTRY_PATH = require.resolve("../../miniprogram/app");
const APP_CONFIG_PATH = require.resolve("../../miniprogram/app.json");
const AUTH_SERVICE_PATH = require.resolve("../../miniprogram/services/auth");

const clearIndexModules = () => {
  delete require.cache[INDEX_PAGE_PATH];
};

const clearAppModules = () => {
  delete require.cache[APP_ENTRY_PATH];
  delete require.cache[AUTH_SERVICE_PATH];
};

const loadIndexPage = () => {
  clearIndexModules();

  let pageConfig = null;
  global.Page = (config) => {
    pageConfig = config;
  };

  require(INDEX_PAGE_PATH);
  return pageConfig;
};

const loadAppConfig = () => {
  let appConfig = null;
  global.App = (config) => {
    appConfig = config;
  };

  require(APP_ENTRY_PATH);
  return appConfig;
};

test.afterEach(() => {
  clearIndexModules();
  clearAppModules();
  delete global.Page;
  delete global.App;
  delete global.wx;
});

test("index page exposes cloud banner image list for the home swiper", () => {
  const pageConfig = loadIndexPage();

  assert.deepEqual(pageConfig.data.bannerImageList, [
    "cloud://rlink-5g3hqx773b8980a1.726c-rlink-5g3hqx773b8980a1-1415950630/images/banner1.png",
    "cloud://rlink-5g3hqx773b8980a1.726c-rlink-5g3hqx773b8980a1-1415950630/images/banner2.png",
  ]);
});

test("index page template uses swiper for banner carousel", () => {
  const template = fs.readFileSync(INDEX_TEMPLATE_PATH, "utf8");

  assert.equal(template.includes("<swiper"), true);
  assert.equal(template.includes("page-banner__swiper"), true);
  assert.equal(template.includes('src="{{item}}"'), true);
  assert.equal(template.includes('src="/images/banner.png"'), false);
});

test("app config uses the native tab bar configuration", () => {
  const appConfig = JSON.parse(fs.readFileSync(APP_CONFIG_PATH, "utf8"));

  assert.equal("custom" in appConfig.tabBar, false);
  assert.equal(appConfig.tabBar.list.length, 4);
  assert.equal(appConfig.tabBar.backgroundColor, "#FFFFFF");
  assert.equal(appConfig.tabBar.color, "#667085");
  assert.equal(appConfig.tabBar.selectedColor, "#111827");
});

test("app initializes cloud environment on launch", () => {
  const cloudInitCalls = [];
  clearAppModules();
  require.cache[AUTH_SERVICE_PATH] = {
    id: AUTH_SERVICE_PATH,
    filename: AUTH_SERVICE_PATH,
    loaded: true,
    exports: {
      syncCurrentMiniProgramUser: async () => null,
      authorizeCurrentMiniProgramUserProfile: async () => null,
      hasAuthorizedUserProfile: () => true,
      isUserProfileAuthorizationDenied: () => false,
    },
  };
  const appConfig = loadAppConfig();

  global.wx = {
    cloud: {
      init(options) {
        cloudInitCalls.push(options);
      },
    },
  };

  appConfig.onLaunch();

  assert.deepEqual(cloudInitCalls, [
    {
      env: "rlink-5g3hqx773b8980a1",
      traceUser: false,
    },
  ]);
});

test("app triggers user profile authorization on launch when current user is incomplete", async () => {
  let authorizeCallCount = 0;
  clearAppModules();
  require.cache[AUTH_SERVICE_PATH] = {
    id: AUTH_SERVICE_PATH,
    filename: AUTH_SERVICE_PATH,
    loaded: true,
    exports: {
      syncCurrentMiniProgramUser: async () => ({
        is_new_user: true,
        user: {
          user_id: "10001",
          nickname: "",
          avatar_url: "",
        },
      }),
      authorizeCurrentMiniProgramUserProfile: async () => {
        authorizeCallCount += 1;
        return {
          user_id: "10001",
          nickname: "妙智学员",
          avatar_url: "https://example.com/avatar.png",
        };
      },
      hasAuthorizedUserProfile: (user) => Boolean(user?.nickname && user?.avatar_url),
      isUserProfileAuthorizationDenied: () => false,
    },
  };
  const appConfig = loadAppConfig();

  global.wx = {
    cloud: {
      init() {},
    },
  };

  appConfig.onLaunch();
  const result = await appConfig.globalData.currentUserReady;

  assert.equal(authorizeCallCount, 1);
  assert.equal(result.user.nickname, "妙智学员");
});
