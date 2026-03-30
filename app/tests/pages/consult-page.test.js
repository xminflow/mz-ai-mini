const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const PAGE_PATH = require.resolve("../../miniprogram/pages/consult/index");
const TEMPLATE_PATH = require.resolve("../../miniprogram/pages/consult/index.wxml");
const CONSULTATION_SERVICE_PATH = require.resolve(
  "../../miniprogram/services/consultation"
);
const AUTH_SERVICE_PATH = require.resolve("../../miniprogram/services/auth");
const USER_AUTH_PATH = require.resolve("../../miniprogram/utils/userAuth");

const AUTH_PAGE_STATE = {
  CHECKING: "checking",
  READY: "ready",
  UNAUTHORIZED: "unauthorized",
  ERROR: "error",
};

const clearConsultPageModules = () => {
  delete require.cache[PAGE_PATH];
  delete require.cache[CONSULTATION_SERVICE_PATH];
  delete require.cache[AUTH_SERVICE_PATH];
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

const loadConsultPage = ({
  createConsultationRequest = async () => ({
    consultation_id: "20001",
    submitted_at: "2026-03-30T12:00:00",
  }),
  syncCurrentMiniProgramUser = async () => ({
    user: {
      openid: "wechat-openid",
      nickname: "妙智学员",
    },
  }),
  hasAuthenticatedMiniProgramUser = (user) => Boolean(user?.openid),
} = {}) => {
  clearConsultPageModules();

  let pageConfig = null;
  global.Page = (config) => {
    pageConfig = config;
  };

  mockModule(CONSULTATION_SERVICE_PATH, {
    createConsultationRequest,
  });
  mockModule(AUTH_SERVICE_PATH, {
    syncCurrentMiniProgramUser,
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
  clearConsultPageModules();
  delete global.Page;
  delete global.wx;
});

test("consult page falls back to unauthorized state when no authenticated user is available", async () => {
  const pageConfig = loadConsultPage({
    syncCurrentMiniProgramUser: async () => ({
      user: null,
    }),
    hasAuthenticatedMiniProgramUser: () => false,
  });
  const page = createPageInstance(pageConfig);

  await page.refreshAuthorizationState();

  assert.equal(page.data.authState, AUTH_PAGE_STATE.UNAUTHORIZED);
  assert.equal(page.data.currentUser, null);
});

test("consult page requires other type detail before submission and resets form on success", async () => {
  const requestPayloads = [];
  const pageConfig = loadConsultPage({
    createConsultationRequest: async (payload) => {
      requestPayloads.push(payload);
      return {
        consultation_id: "30001",
        submitted_at: "2026-03-30T12:00:00",
      };
    },
  });
  const page = createPageInstance(pageConfig);
  const toastCalls = [];

  global.wx = {
    showToast(options) {
      toastCalls.push(options);
    },
    switchTab() {},
  };

  page.setData({
    authState: AUTH_PAGE_STATE.READY,
    phone: "13800138000",
    email: "owner@example.com",
    businessType: "other",
    businessTypeIndex: 7,
    businessTypeOther: "",
    businessDescription: "想让 AI 帮助巡检与排班。",
  });

  await page.handleSubmit();

  assert.deepEqual(requestPayloads, []);
  assert.deepEqual(toastCalls[0], {
    title: "请补充其他业务类型说明",
    icon: "none",
  });

  page.setData({
    businessTypeOther: "门店巡检",
  });

  await page.handleSubmit();

  assert.deepEqual(requestPayloads, [
    {
      phone: "13800138000",
      email: "owner@example.com",
      business_type: "other",
      business_type_other: "门店巡检",
      business_description: "想让 AI 帮助巡检与排班。",
    },
  ]);
  assert.equal(page.data.hasSubmitted, true);
  assert.equal(page.data.phone, "");
  assert.equal(page.data.email, "");
  assert.equal(page.data.businessType, "marketing_growth");
  assert.equal(page.data.businessTypeIndex, 0);
  assert.equal(page.data.businessTypeOther, "");
  assert.equal(page.data.businessDescription, "");
  assert.deepEqual(toastCalls[1], {
    title: "提交成功",
    icon: "success",
  });
});

test("consult page template includes reply expectation and conditional other business type input", () => {
  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

  assert.equal(template.includes("1-3 个工作日内给予回复"), true);
  assert.equal(template.includes('wx:if="{{businessType === \'other\'}}"'), true);
  assert.equal(template.includes('bindtap="handleAuthorize"'), true);
  assert.equal(template.includes("当前提交身份"), false);
  assert.equal(template.includes('placeholder-style="color: #9CA3AF;"'), true);
  assert.equal(template.includes("form-field__control"), true);
  assert.equal(template.includes("images/solution.png"), true);
  assert.equal(template.includes("consult-banner"), true);
  assert.equal(template.includes('mode="widthFix"'), true);
  assert.equal(template.includes("form-card__banner"), false);
});
