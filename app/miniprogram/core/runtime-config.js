const API_PREFIX = "/api/v1";
const REQUEST_TIMEOUT_MS = 10000;
const REQUEST_TRANSPORT_HTTP = "http";
const REQUEST_TRANSPORT_CONTAINER = "container";
const MINI_PROGRAM_DEVELOP_ENV = "develop";
const MINI_PROGRAM_TRIAL_ENV = "trial";
const MINI_PROGRAM_RELEASE_ENV = "release";
const BACKEND_TARGET_LOCAL = "local";
const BACKEND_TARGET_REMOTE = "remote";
const BACKEND_TARGET_PRODUCTION = "production";
const DEFAULT_LOCAL_API_ORIGIN = "http://127.0.0.1:8001";
const PRODUCTION_API_ORIGIN = "https://api.weelume.com";
const CLOUD_ENV_ID = "rlink-5g3hqx773b8980a1";
const CLOUD_SERVICE_NAME = "mz-ai";
const { getSupportedMiniProgramEnvVersion } = require("./runtime-mode");
const localRuntimeConfig = require("./runtime-config.local");

const normalizeConfiguredOrigin = (origin) => {
  if (typeof origin !== "string") {
    return "";
  }

  return origin.trim().replace(/\/+$/, "");
};

const LOCAL_API_ORIGIN =
  normalizeConfiguredOrigin(localRuntimeConfig?.localApiOrigin) ||
  DEFAULT_LOCAL_API_ORIGIN;

const BACKEND_TARGET_LABELS = Object.freeze({
  [BACKEND_TARGET_LOCAL]: "本地后端",
  [BACKEND_TARGET_REMOTE]: "远程开发后端",
  [BACKEND_TARGET_PRODUCTION]: "生产后端",
});

const LOCAL_MINI_PROGRAM_IDENTITY = Object.freeze({
  openid: "local-dev-openid",
  unionId: "",
  appId: "wx-local-dev",
});

const buildLocalIdentityHeaders = () => ({
  "X-WX-OPENID": LOCAL_MINI_PROGRAM_IDENTITY.openid,
  "X-WX-APPID": LOCAL_MINI_PROGRAM_IDENTITY.appId,
  ...(LOCAL_MINI_PROGRAM_IDENTITY.unionId
    ? { "X-WX-UNIONID": LOCAL_MINI_PROGRAM_IDENTITY.unionId }
    : {}),
});

const resolveDevelopRuntimeConfig = () => {
  const target =
    localRuntimeConfig?.target === BACKEND_TARGET_REMOTE
      ? BACKEND_TARGET_REMOTE
      : BACKEND_TARGET_LOCAL;

  return {
    target,
  };
};

const resolveBackendTarget = () => {
  const envVersion = getSupportedMiniProgramEnvVersion();

  if (envVersion === MINI_PROGRAM_DEVELOP_ENV) {
    return resolveDevelopRuntimeConfig().target;
  }

  if (envVersion === MINI_PROGRAM_TRIAL_ENV) {
    return BACKEND_TARGET_PRODUCTION;
  }

  if (envVersion === MINI_PROGRAM_RELEASE_ENV) {
    return BACKEND_TARGET_PRODUCTION;
  }

  throw new Error(`Unsupported mini program envVersion: ${envVersion}`);
};

const resolveApiOriginForTarget = (target) => {
  if (target === BACKEND_TARGET_LOCAL) {
    return LOCAL_API_ORIGIN;
  }

  throw new Error(`Unsupported backend target: ${target}.`);
};

const resolveRequestTransport = () => {
  const currentTarget = resolveBackendTarget();

  if (currentTarget === BACKEND_TARGET_LOCAL) {
    return {
      type: REQUEST_TRANSPORT_HTTP,
      apiBaseUrl: `${resolveApiOriginForTarget(currentTarget)}${API_PREFIX}`,
    };
  }

  if (
    currentTarget === BACKEND_TARGET_REMOTE ||
    currentTarget === BACKEND_TARGET_PRODUCTION
  ) {
    return {
      type: REQUEST_TRANSPORT_CONTAINER,
      envId: CLOUD_ENV_ID,
      serviceName: CLOUD_SERVICE_NAME,
      pathPrefix: API_PREFIX,
    };
  }

  throw new Error(`Unsupported backend target: ${currentTarget}.`);
};

const buildRequestIdentityHeaders = () =>
  resolveBackendTarget() === BACKEND_TARGET_LOCAL
    ? buildLocalIdentityHeaders()
    : {};

const getBackendEnvironmentState = () => {
  const miniProgramEnvVersion = getSupportedMiniProgramEnvVersion();
  const currentTarget = resolveBackendTarget();
  const developRuntimeConfig =
    miniProgramEnvVersion === MINI_PROGRAM_DEVELOP_ENV
      ? resolveDevelopRuntimeConfig()
      : null;
  const requestTransport = resolveRequestTransport();

  return {
    miniProgramEnvVersion,
    currentTarget,
    currentTargetLabel: BACKEND_TARGET_LABELS[currentTarget],
    transportType: requestTransport.type,
    currentEndpoint:
      requestTransport.type === REQUEST_TRANSPORT_HTTP
        ? requestTransport.apiBaseUrl
        : `${requestTransport.serviceName}${requestTransport.pathPrefix}`,
    cloudEnvId: CLOUD_ENV_ID,
    cloudServiceName: CLOUD_SERVICE_NAME,
    isUsingLocalIdentityHeaders: currentTarget === BACKEND_TARGET_LOCAL,
    configSource:
      miniProgramEnvVersion === MINI_PROGRAM_DEVELOP_ENV
        ? "runtime-config.local.js"
        : "runtime-config.js",
  };
};

module.exports = {
  API_PREFIX,
  BACKEND_TARGET_LOCAL,
  BACKEND_TARGET_PRODUCTION,
  BACKEND_TARGET_REMOTE,
  CLOUD_ENV_ID,
  CLOUD_SERVICE_NAME,
  LOCAL_API_ORIGIN,
  PRODUCTION_API_ORIGIN,
  REQUEST_TRANSPORT_CONTAINER,
  REQUEST_TRANSPORT_HTTP,
  buildRequestIdentityHeaders,
  getBackendEnvironmentState,
  resolveRequestTransport,
  REQUEST_TIMEOUT_MS,
};
