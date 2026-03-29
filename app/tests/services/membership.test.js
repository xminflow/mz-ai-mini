const test = require("node:test");
const assert = require("node:assert/strict");

const MEMBERSHIP_SERVICE_PATH = require.resolve("../../miniprogram/services/membership");
const API_CLIENT_PATH = require.resolve("../../miniprogram/core/apiClient");
const RUNTIME_CONFIG_PATH = require.resolve("../../miniprogram/core/runtime-config");
const LOCAL_RUNTIME_CONFIG_PATH = require.resolve(
  "../../miniprogram/core/runtime-config.local"
);
const RUNTIME_MODE_PATH = require.resolve("../../miniprogram/core/runtime-mode");

const clearMembershipModules = () => {
  delete require.cache[MEMBERSHIP_SERVICE_PATH];
  delete require.cache[API_CLIENT_PATH];
  delete require.cache[RUNTIME_CONFIG_PATH];
  delete require.cache[LOCAL_RUNTIME_CONFIG_PATH];
  delete require.cache[RUNTIME_MODE_PATH];
};

const loadMembershipService = ({ localRuntimeConfig = {} } = {}) => {
  clearMembershipModules();
  require.cache[LOCAL_RUNTIME_CONFIG_PATH] = {
    id: LOCAL_RUNTIME_CONFIG_PATH,
    filename: LOCAL_RUNTIME_CONFIG_PATH,
    loaded: true,
    exports: localRuntimeConfig,
  };
  return require("../../miniprogram/services/membership");
};

test.afterEach(() => {
  clearMembershipModules();
  delete global.wx;
});

test("purchaseNormalMembership creates order, invokes requestPayment, and resolves on paid order", async () => {
  let requestCount = 0;
  const originalSetTimeout = global.setTimeout;

  global.setTimeout = (callback) => {
    callback();
    return 0;
  };
  global.wx = {
    getAccountInfoSync() {
      return {
        miniProgram: {
          envVersion: "develop",
        },
      };
    },
    requestPayment(options) {
      assert.equal(options.package, "prepay_id=wx-prepay-01");
      options.success({});
    },
    request(options) {
      requestCount += 1;

      if (requestCount === 1) {
        assert.equal(
          options.url,
          "http://127.0.0.1:8000/api/v1/memberships/wechat-mini-program/orders"
        );
        assert.equal(options.method, "POST");
        assert.deepEqual(options.data, {
          tier: "normal",
        });
        options.success({
          statusCode: 200,
          data: {
            code: "COMMON.SUCCESS",
            message: "success",
            data: {
              order_no: "90001",
              tier: "normal",
              amount_fen: 10,
              status: "pending",
              payment_params: {
                time_stamp: "123456",
                nonce_str: "nonce-01",
                package: "prepay_id=wx-prepay-01",
                sign_type: "RSA",
                pay_sign: "signature",
              },
            },
          },
        });
        return;
      }

      if (requestCount === 2) {
        options.success({
          statusCode: 200,
          data: {
            code: "COMMON.SUCCESS",
            message: "success",
            data: {
              order_no: "90001",
              tier: "normal",
              amount_fen: 10,
              status: "pending",
              membership_applied: false,
              membership_started_at: null,
              membership_expires_at: null,
            },
          },
        });
        return;
      }

      assert.equal(
        options.url,
        "http://127.0.0.1:8000/api/v1/memberships/wechat-mini-program/orders/90001"
      );
      options.success({
        statusCode: 200,
        data: {
          code: "COMMON.SUCCESS",
          message: "success",
          data: {
            order_no: "90001",
            tier: "normal",
            amount_fen: 10,
            status: "paid",
            membership_applied: true,
            membership_started_at: "2026-03-29T10:00:00",
            membership_expires_at: "2027-03-29T10:00:00",
          },
        },
      });
    },
  };

  try {
    const { purchaseNormalMembership } = loadMembershipService();
    const result = await purchaseNormalMembership();

    assert.equal(result.order_no, "90001");
    assert.equal(result.status, "paid");
  } finally {
    global.setTimeout = originalSetTimeout;
  }
});

test("purchaseNormalMembership reports cancellation when requestPayment is cancelled", async () => {
  global.wx = {
    getAccountInfoSync() {
      return {
        miniProgram: {
          envVersion: "develop",
        },
      };
    },
    requestPayment(options) {
      options.fail({
        errMsg: "requestPayment:fail cancel",
      });
    },
    request(options) {
      options.success({
        statusCode: 200,
        data: {
          code: "COMMON.SUCCESS",
          message: "success",
          data: {
            order_no: "90002",
            tier: "normal",
            amount_fen: 10,
            status: "pending",
            payment_params: {
              time_stamp: "123456",
              nonce_str: "nonce-01",
              package: "prepay_id=wx-prepay-01",
              sign_type: "RSA",
              pay_sign: "signature",
            },
          },
        },
      });
    },
  };

  const { isMembershipPaymentCancelled, purchaseNormalMembership } = loadMembershipService();

  await assert.rejects(
    () => purchaseNormalMembership(),
    (error) => isMembershipPaymentCancelled(error)
  );
});
