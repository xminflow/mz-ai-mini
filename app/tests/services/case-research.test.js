const test = require("node:test");
const assert = require("node:assert/strict");

const CASE_RESEARCH_SERVICE_PATH = require.resolve(
  "../../miniprogram/services/case-research"
);
const API_CLIENT_PATH = require.resolve("../../miniprogram/core/apiClient");
const RUNTIME_CONFIG_PATH = require.resolve("../../miniprogram/core/runtime-config");
const LOCAL_RUNTIME_CONFIG_PATH = require.resolve(
  "../../miniprogram/core/runtime-config.local"
);
const RUNTIME_MODE_PATH = require.resolve("../../miniprogram/core/runtime-mode");

const clearModules = () => {
  delete require.cache[CASE_RESEARCH_SERVICE_PATH];
  delete require.cache[API_CLIENT_PATH];
  delete require.cache[RUNTIME_CONFIG_PATH];
  delete require.cache[LOCAL_RUNTIME_CONFIG_PATH];
  delete require.cache[RUNTIME_MODE_PATH];
};

const loadCaseResearchService = ({ localRuntimeConfig = {} } = {}) => {
  clearModules();
  require.cache[LOCAL_RUNTIME_CONFIG_PATH] = {
    id: LOCAL_RUNTIME_CONFIG_PATH,
    filename: LOCAL_RUNTIME_CONFIG_PATH,
    loaded: true,
    exports: localRuntimeConfig,
  };
  return require("../../miniprogram/services/case-research");
};

test.afterEach(() => {
  clearModules();
  delete global.wx;
});

test("createPublicCaseResearchRequest posts the case research payload to backend", async () => {
  global.wx = {
    getAccountInfoSync() {
      return { miniProgram: { envVersion: "develop" } };
    },
    request(options) {
      assert.equal(
        options.url,
        "http://127.0.0.1:8000/api/v1/case-research/wechat-mini-program/requests"
      );
      assert.equal(options.method, "POST");
      assert.deepEqual(options.data, {
        title: "示范科技公司案例调研",
        description: "主要从事 AI 赋能业务。",
      });
      options.success({
        statusCode: 200,
        data: {
          code: "COMMON.SUCCESS",
          data: { request_id: "123", visibility: "public", status: "pending_review" },
          message: "ok",
          request_id: "req-1",
          timestamp: "2024-01-01T00:00:00",
        },
      });
    },
  };

  const { createPublicCaseResearchRequest } = loadCaseResearchService();
  const result = await createPublicCaseResearchRequest({
    title: "示范科技公司案例调研",
    description: "主要从事 AI 赋能业务。",
  });

  assert.equal(result.request_id, "123");
  assert.equal(result.visibility, "public");
});

test("isCaseResearchPaymentCancelled returns true for cancelled error", () => {
  const { CaseResearchPaymentError, isCaseResearchPaymentCancelled } =
    loadCaseResearchService();
  const error = new CaseResearchPaymentError("cancelled", {
    code: "CASE_RESEARCH.PAYMENT_CANCELLED",
  });
  assert.equal(isCaseResearchPaymentCancelled(error), true);
});

test("isCaseResearchPaymentCancelled returns false for non-cancelled error", () => {
  const { CaseResearchPaymentError, isCaseResearchPaymentCancelled } =
    loadCaseResearchService();
  const error = new CaseResearchPaymentError("failed", {
    code: "CASE_RESEARCH.PAYMENT_FAILED",
  });
  assert.equal(isCaseResearchPaymentCancelled(error), false);
});

test("isCaseResearchPaymentResultPending returns true for pending error", () => {
  const { CaseResearchPaymentError, isCaseResearchPaymentResultPending } =
    loadCaseResearchService();
  const error = new CaseResearchPaymentError("pending", {
    code: "CASE_RESEARCH.PAYMENT_RESULT_PENDING",
  });
  assert.equal(isCaseResearchPaymentResultPending(error), true);
});
