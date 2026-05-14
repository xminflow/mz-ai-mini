const test = require("node:test");
const assert = require("node:assert/strict");

const CONSULTATION_SERVICE_PATH = require.resolve(
  "../../miniprogram/services/consultation"
);
const API_CLIENT_PATH = require.resolve("../../miniprogram/core/apiClient");
const RUNTIME_CONFIG_PATH = require.resolve("../../miniprogram/core/runtime-config");
const LOCAL_RUNTIME_CONFIG_PATH = require.resolve(
  "../../miniprogram/core/runtime-config.local"
);
const RUNTIME_MODE_PATH = require.resolve("../../miniprogram/core/runtime-mode");

const clearConsultationModules = () => {
  delete require.cache[CONSULTATION_SERVICE_PATH];
  delete require.cache[API_CLIENT_PATH];
  delete require.cache[RUNTIME_CONFIG_PATH];
  delete require.cache[LOCAL_RUNTIME_CONFIG_PATH];
  delete require.cache[RUNTIME_MODE_PATH];
};

const loadConsultationService = ({ localRuntimeConfig = {} } = {}) => {
  clearConsultationModules();
  require.cache[LOCAL_RUNTIME_CONFIG_PATH] = {
    id: LOCAL_RUNTIME_CONFIG_PATH,
    filename: LOCAL_RUNTIME_CONFIG_PATH,
    loaded: true,
    exports: localRuntimeConfig,
  };
  return require("../../miniprogram/services/consultation");
};

test.afterEach(() => {
  clearConsultationModules();
  delete global.wx;
});

test("createConsultationRequest posts the consultation payload to backend", async () => {
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
        "http://127.0.0.1:8001/api/v1/consultations/wechat-mini-program/requests"
      );
      assert.equal(options.method, "POST");
      assert.deepEqual(options.data, {
        phone: "13800138000",
        email: "owner@example.com",
        business_type: "other",
        business_type_other: "门店巡检",
        business_description: "希望通过 AI 提升门店运营效率。",
      });

      options.success({
        statusCode: 200,
        data: {
          code: "COMMON.SUCCESS",
          message: "success",
          data: {
            consultation_id: "20001",
            submitted_at: "2026-03-30T12:00:00",
          },
        },
      });
    },
  };

  const { createConsultationRequest } = loadConsultationService();
  const result = await createConsultationRequest({
    phone: "13800138000",
    email: "owner@example.com",
    business_type: "other",
    business_type_other: "门店巡检",
    business_description: "希望通过 AI 提升门店运营效率。",
  });

  assert.equal(result.consultation_id, "20001");
  assert.equal(result.submitted_at, "2026-03-30T12:00:00");
});
