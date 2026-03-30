const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const PAGE_PATH = require.resolve("../../miniprogram/pages/mine/index");
const TEMPLATE_PATH = require.resolve("../../miniprogram/pages/mine/index.wxml");
const AUTH_SERVICE_PATH = require.resolve("../../miniprogram/services/auth");
const MEMBERSHIP_SERVICE_PATH = require.resolve("../../miniprogram/services/membership");
const CLOUD_FILE_PATH = require.resolve("../../miniprogram/utils/cloudFile");
const FORMAT_PATH = require.resolve("../../miniprogram/utils/format");
const USER_AUTH_PATH = require.resolve("../../miniprogram/utils/userAuth");

const AUTH_PAGE_STATE = {
  CHECKING: "checking",
  READY: "ready",
  UNAUTHORIZED: "unauthorized",
  ERROR: "error",
};

const clearMinePageModules = () => {
  delete require.cache[PAGE_PATH];
  delete require.cache[AUTH_SERVICE_PATH];
  delete require.cache[MEMBERSHIP_SERVICE_PATH];
  delete require.cache[CLOUD_FILE_PATH];
  delete require.cache[FORMAT_PATH];
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

const loadMinePage = ({
  authorizeCurrentMiniProgramUserProfile = async (profilePatch) => ({
    user: {
      openid: "wechat-openid",
      nickname: profilePatch.nickname || "妙智学员",
      avatar_url: profilePatch.avatar_url || "cloud://env-id.bucket/avatars/original.png",
    },
  }),
  syncCurrentMiniProgramUser = async () => ({
    user: {
      openid: "wechat-openid",
      nickname: "妙智学员",
      avatar_url: "cloud://env-id.bucket/avatars/original.png",
    },
  }),
  purchaseNormalMembership = async () => {},
  isMembershipPaymentCancelled = () => false,
  isMembershipPaymentResultPending = () => false,
  generateAvatarCloudPath = () => "avatars/generated.png",
  isCloudFileId = (value) => typeof value === "string" && value.startsWith("cloud://"),
  resolveCloudFileTempUrlMap = async () => ({
    "cloud://env-id.bucket/avatars/original.png":
      "https://temp.example.com/original.png",
    "cloud://env-id.bucket/avatars/uploaded.png":
      "https://temp.example.com/uploaded.png",
  }),
  uploadFileToCloud = async () => "cloud://env-id.bucket/avatars/uploaded.png",
  formatDateLabel = () => "",
  hasAuthenticatedMiniProgramUser = (user) => Boolean(user?.openid),
} = {}) => {
  clearMinePageModules();

  let pageConfig = null;
  global.Page = (config) => {
    pageConfig = config;
  };

  mockModule(AUTH_SERVICE_PATH, {
    authorizeCurrentMiniProgramUserProfile,
    syncCurrentMiniProgramUser,
  });
  mockModule(MEMBERSHIP_SERVICE_PATH, {
    isMembershipPaymentCancelled,
    isMembershipPaymentResultPending,
    purchaseNormalMembership,
  });
  mockModule(CLOUD_FILE_PATH, {
    generateAvatarCloudPath,
    isCloudFileId,
    resolveCloudFileTempUrlMap,
    uploadFileToCloud,
  });
  mockModule(FORMAT_PATH, {
    formatDateLabel,
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
  clearMinePageModules();
  delete global.Page;
  delete global.wx;
});

test("mine page syncs avatar immediately after chooseAvatar", async () => {
  const profilePatches = [];
  const uploadedFiles = [];
  const pageConfig = loadMinePage({
    authorizeCurrentMiniProgramUserProfile: async (profilePatch) => {
      profilePatches.push(profilePatch);
      return {
        user: {
          openid: "wechat-openid",
          nickname: "妙智学员",
          avatar_url: profilePatch.avatar_url,
        },
      };
    },
    uploadFileToCloud: async (tempFilePath, cloudPath) => {
      uploadedFiles.push({ tempFilePath, cloudPath });
      return "cloud://env-id.bucket/avatars/uploaded.png";
    },
  });
  const page = createPageInstance(pageConfig);
  const toastCalls = [];

  global.wx = {
    showToast(options) {
      toastCalls.push(options);
    },
  };

  page.setData({
    currentUser: {
      openid: "wechat-openid",
      nickname: "妙智学员",
      avatar_url: "cloud://env-id.bucket/avatars/original.png",
    },
    currentUserAvatarUrl: "https://temp.example.com/original.png",
    isEditingProfile: true,
  });

  await page.handleChooseAvatar({
    detail: {
      avatarUrl: "wxfile://tmp/avatar.png",
    },
  });

  assert.deepEqual(uploadedFiles, [
    {
      tempFilePath: "wxfile://tmp/avatar.png",
      cloudPath: "avatars/generated.png",
    },
  ]);
  assert.deepEqual(profilePatches, [
    {
      avatar_url: "cloud://env-id.bucket/avatars/uploaded.png",
    },
  ]);
  assert.equal(page.data.currentUser.avatar_url, "cloud://env-id.bucket/avatars/uploaded.png");
  assert.equal(page.data.authorizationAvatarUrl, "cloud://env-id.bucket/avatars/uploaded.png");
  assert.equal(
    page.data.authorizationAvatarPreviewUrl,
    "https://temp.example.com/uploaded.png"
  );
  assert.deepEqual(toastCalls, [
    {
      title: "头像已更新",
      icon: "success",
    },
  ]);
});

test("mine page syncs nickname on blur only when the value changes", async () => {
  const profilePatches = [];
  const pageConfig = loadMinePage({
    authorizeCurrentMiniProgramUserProfile: async (profilePatch) => {
      profilePatches.push(profilePatch);
      return {
        user: {
          openid: "wechat-openid",
          nickname: profilePatch.nickname,
          avatar_url: "cloud://env-id.bucket/avatars/original.png",
        },
      };
    },
  });
  const page = createPageInstance(pageConfig);
  const toastCalls = [];

  global.wx = {
    showToast(options) {
      toastCalls.push(options);
    },
  };

  page.setData({
    currentUser: {
      openid: "wechat-openid",
      nickname: "旧昵称",
      avatar_url: "cloud://env-id.bucket/avatars/original.png",
    },
    currentUserAvatarUrl: "https://temp.example.com/original.png",
    isEditingProfile: true,
    authorizationNickname: "旧昵称",
  });

  await page.handleNicknameBlur({
    detail: {
      value: "  新昵称  ",
    },
  });

  assert.deepEqual(profilePatches, [
    {
      nickname: "新昵称",
    },
  ]);
  assert.equal(page.data.currentUser.nickname, "新昵称");
  assert.equal(page.data.authorizationNickname, "新昵称");
  assert.deepEqual(toastCalls, [
    {
      title: "昵称已更新",
      icon: "success",
    },
  ]);

  await page.handleNicknameBlur({
    detail: {
      value: "新昵称",
    },
  });

  assert.equal(profilePatches.length, 1);
});

test("mine page template uses blur sync and removes the save button", () => {
  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

  assert.equal(template.includes('bindblur="handleNicknameBlur"'), true);
  assert.equal(template.includes('bindtap="handleSaveProfile"'), false);
  assert.equal(template.includes(">保存<"), false);
  assert.equal(template.includes("可随时补充或更新头像昵称"), false);
});
