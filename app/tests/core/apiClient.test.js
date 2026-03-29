const test = require("node:test");
const assert = require("node:assert/strict");

const API_CLIENT_PATH = require.resolve("../../miniprogram/core/apiClient");
const RUNTIME_CONFIG_PATH = require.resolve("../../miniprogram/core/runtime-config");
const RUNTIME_MODE_PATH = require.resolve("../../miniprogram/core/runtime-mode");
const LOCAL_RUNTIME_CONFIG_PATH = require.resolve(
  "../../miniprogram/core/runtime-config.local"
);

const clearApiClientModules = () => {
  delete require.cache[API_CLIENT_PATH];
  delete require.cache[RUNTIME_CONFIG_PATH];
  delete require.cache[RUNTIME_MODE_PATH];
  delete require.cache[LOCAL_RUNTIME_CONFIG_PATH];
};

const loadApiClient = ({ envVersion, localRuntimeConfig = {} }) => {
  clearApiClientModules();

  require.cache[RUNTIME_MODE_PATH] = {
    id: RUNTIME_MODE_PATH,
    filename: RUNTIME_MODE_PATH,
    loaded: true,
    exports: {
      getSupportedMiniProgramEnvVersion: () => envVersion,
    },
  };

  require.cache[LOCAL_RUNTIME_CONFIG_PATH] = {
    id: LOCAL_RUNTIME_CONFIG_PATH,
    filename: LOCAL_RUNTIME_CONFIG_PATH,
    loaded: true,
    exports: localRuntimeConfig,
  };

  return require("../../miniprogram/core/apiClient");
};

test.afterEach(() => {
  clearApiClientModules();
  delete global.wx;
});

test("request preserves callContainer failure details in remote develop mode", async () => {
  const callContainerError = {
    errMsg: "cloud.callContainer:fail Error: Your server is Forbidden For CallContainer",
  };
  const warningLogs = [];
  const originalConsoleWarn = console.warn;

  console.warn = (...args) => {
    warningLogs.push(args);
  };

  global.wx = {
    cloud: {
      async callContainer() {
        throw callContainerError;
      },
    },
  };

  try {
    const { request } = loadApiClient({
      envVersion: "develop",
      localRuntimeConfig: {
        target: "remote",
      },
    });

    await assert.rejects(
      () =>
        request({
          path: "/business-cases",
          method: "GET",
          query: {
            limit: 6,
          },
        }),
      (error) => {
        assert.equal(error.name, "ApiClientError");
        assert.equal(
          error.message,
          "cloud.callContainer:fail Error: Your server is Forbidden For CallContainer"
        );
        assert.equal(error.code, "CONTAINER_NETWORK_ERROR");
        assert.equal(error.statusCode, 0);
        assert.equal(error.cause, callContainerError);
        assert.deepEqual(error.details, {
          envId: "rlink-5g3hqx773b8980a1",
          serviceName: "mz-ai",
          path: "/api/v1/business-cases?limit=6",
          method: "GET",
        });
        return true;
      }
    );

    assert.equal(warningLogs.length, 1);
    assert.equal(warningLogs[0][0], "Container request failed.");
    assert.deepEqual(warningLogs[0][1], {
      envId: "rlink-5g3hqx773b8980a1",
      serviceName: "mz-ai",
      path: "/api/v1/business-cases?limit=6",
      method: "GET",
      error: callContainerError,
    });
  } finally {
    console.warn = originalConsoleWarn;
  }
});
