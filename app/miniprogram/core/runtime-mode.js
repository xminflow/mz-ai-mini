const HTTP_ENV_VERSIONS = new Set(["develop", "trial", "release"]);
const LOCAL_IDENTITY_HEADER_ENV_VERSIONS = new Set(["develop"]);

const getMiniProgramEnvVersion = () => {
  if (typeof wx === "undefined" || typeof wx.getAccountInfoSync !== "function") {
    throw new Error("wx.getAccountInfoSync is unavailable.");
  }

  const accountInfo = wx.getAccountInfoSync();
  const envVersion = accountInfo?.miniProgram?.envVersion;

  if (typeof envVersion !== "string" || envVersion.trim() === "") {
    throw new Error("Mini program envVersion is unavailable.");
  }

  return envVersion.trim();
};

const getSupportedMiniProgramEnvVersion = () => {
  const envVersion = getMiniProgramEnvVersion();

  if (HTTP_ENV_VERSIONS.has(envVersion)) {
    return envVersion;
  }

  throw new Error(`Unsupported mini program envVersion: ${envVersion}`);
};

const shouldUseLocalIdentityHeaders = () =>
  LOCAL_IDENTITY_HEADER_ENV_VERSIONS.has(getSupportedMiniProgramEnvVersion());

module.exports = {
  getMiniProgramEnvVersion,
  getSupportedMiniProgramEnvVersion,
  shouldUseLocalIdentityHeaders,
};
