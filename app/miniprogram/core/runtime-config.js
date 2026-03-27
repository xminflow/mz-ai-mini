const API_PREFIX = "/api/v1";
const REQUEST_TIMEOUT_MS = 10000;
const {
  getSupportedMiniProgramEnvVersion,
  shouldUseLocalIdentityHeaders,
} = require("./runtime-mode");

const API_ORIGIN_BY_ENV_VERSION = Object.freeze({
  develop: "http://127.0.0.1:8000",
  trial: "https://your-http-api-origin.example.com",
  release: "https://your-http-api-origin.example.com",
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

const resolveApiBaseUrl = () => {
  const envVersion = getSupportedMiniProgramEnvVersion();
  const apiOrigin = API_ORIGIN_BY_ENV_VERSION[envVersion];

  if (typeof apiOrigin !== "string" || apiOrigin.trim() === "") {
    throw new Error(`HTTP api origin is unavailable for envVersion: ${envVersion}.`);
  }

  return `${apiOrigin.trim()}${API_PREFIX}`;
};

const buildRequestIdentityHeaders = () =>
  shouldUseLocalIdentityHeaders() ? buildLocalIdentityHeaders() : {};

module.exports = {
  buildRequestIdentityHeaders,
  resolveApiBaseUrl,
  REQUEST_TIMEOUT_MS,
};
