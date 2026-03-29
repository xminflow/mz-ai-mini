const test = require("node:test");
const assert = require("node:assert/strict");

const RUNTIME_CONFIG_PATH = require.resolve("../../miniprogram/core/runtime-config");
const RUNTIME_MODE_PATH = require.resolve("../../miniprogram/core/runtime-mode");
const LOCAL_RUNTIME_CONFIG_PATH = require.resolve(
  "../../miniprogram/core/runtime-config.local"
);

const clearRuntimeConfigModules = () => {
  delete require.cache[RUNTIME_CONFIG_PATH];
  delete require.cache[RUNTIME_MODE_PATH];
  delete require.cache[LOCAL_RUNTIME_CONFIG_PATH];
};

const loadRuntimeConfig = ({ envVersion, localRuntimeConfig = {} }) => {
  clearRuntimeConfigModules();

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

  return require("../../miniprogram/core/runtime-config");
};

test.afterEach(() => {
  clearRuntimeConfigModules();
});

test("runtime config uses local backend by default in develop", () => {
  const {
    buildRequestIdentityHeaders,
    getBackendEnvironmentState,
    REQUEST_TRANSPORT_HTTP,
    resolveRequestTransport,
  } = loadRuntimeConfig({
    envVersion: "develop",
  });

  assert.deepEqual(resolveRequestTransport(), {
    type: REQUEST_TRANSPORT_HTTP,
    apiBaseUrl: "http://127.0.0.1:8000/api/v1",
  });
  assert.deepEqual(buildRequestIdentityHeaders(), {
    "X-WX-OPENID": "local-dev-openid",
    "X-WX-APPID": "wx-local-dev",
  });
  assert.equal(getBackendEnvironmentState().currentTarget, "local");
  assert.equal(getBackendEnvironmentState().transportType, "http");
});

test("runtime config uses cloud container transport in remote develop mode", () => {
  const {
    buildRequestIdentityHeaders,
    CLOUD_ENV_ID,
    CLOUD_SERVICE_NAME,
    getBackendEnvironmentState,
    REQUEST_TRANSPORT_CONTAINER,
    resolveRequestTransport,
  } = loadRuntimeConfig({
    envVersion: "develop",
    localRuntimeConfig: {
      target: "remote",
    },
  });

  assert.deepEqual(resolveRequestTransport(), {
    type: REQUEST_TRANSPORT_CONTAINER,
    envId: CLOUD_ENV_ID,
    serviceName: CLOUD_SERVICE_NAME,
    pathPrefix: "/api/v1",
  });
  assert.deepEqual(buildRequestIdentityHeaders(), {});
  assert.equal(getBackendEnvironmentState().currentTarget, "remote");
  assert.equal(getBackendEnvironmentState().transportType, "container");
  assert.equal(
    getBackendEnvironmentState().configSource,
    "runtime-config.local.js"
  );
});

test("runtime config fixes trial to production regardless of local overrides", () => {
  const {
    buildRequestIdentityHeaders,
    CLOUD_ENV_ID,
    CLOUD_SERVICE_NAME,
    getBackendEnvironmentState,
    resolveRequestTransport,
  } = loadRuntimeConfig({
    envVersion: "trial",
    localRuntimeConfig: {
      target: "remote",
    },
  });

  assert.deepEqual(resolveRequestTransport(), {
    type: "container",
    envId: CLOUD_ENV_ID,
    serviceName: CLOUD_SERVICE_NAME,
    pathPrefix: "/api/v1",
  });
  assert.deepEqual(buildRequestIdentityHeaders(), {});
  assert.equal(getBackendEnvironmentState().currentTarget, "production");
  assert.equal(getBackendEnvironmentState().transportType, "container");
});

test("runtime config remote develop mode no longer requires direct remote origin", () => {
  const { getBackendEnvironmentState, resolveRequestTransport } = loadRuntimeConfig({
    envVersion: "develop",
    localRuntimeConfig: {
      target: "remote",
    },
  });

  assert.equal(resolveRequestTransport().type, "container");
  assert.equal(getBackendEnvironmentState().currentTarget, "remote");
});
