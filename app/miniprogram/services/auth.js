const { request } = require("../core/apiClient");
const { hasAuthenticatedMiniProgramUser } = require("../utils/userAuth");

let syncCurrentMiniProgramUserPromise = null;
const USER_PROFILE_AUTHORIZATION_DENIED_CODE = "USER_PROFILE_AUTHORIZATION_DENIED";
const USER_PROFILE_DATA_INVALID_CODE = "USER_PROFILE_DATA_INVALID";

class UserProfileAuthorizationError extends Error {
  constructor(message, { code, cause = null } = {}) {
    super(message);
    this.name = "UserProfileAuthorizationError";
    this.code = code || "";
    this.cause = cause;
  }
}

const resolveAppGlobalData = () => {
  if (typeof getApp !== "function") {
    return null;
  }

  const app = getApp();
  if (!app || typeof app !== "object") {
    return null;
  }

  if (!app.globalData || typeof app.globalData !== "object") {
    app.globalData = {};
  }

  return app.globalData;
};

const storeCurrentUserResult = (result) => {
  const globalData = resolveAppGlobalData();
  if (globalData) {
    globalData.currentUser = result ? result.user : null;
    globalData.currentUserSyncError = null;
  }
  syncCurrentMiniProgramUserPromise = Promise.resolve(result);
  return result;
};

const storeCurrentUserError = (error) => {
  const globalData = resolveAppGlobalData();
  if (globalData) {
    globalData.currentUser = null;
    globalData.currentUserSyncError = error;
  }
  syncCurrentMiniProgramUserPromise = null;
  throw error;
};

const syncCurrentMiniProgramUserFromHttp = () =>
  request({
    path: "/auth/wechat-mini-program/users/current",
    method: "PUT",
  });

const updateCurrentMiniProgramUserProfile = (profile) =>
  request({
    path: "/auth/wechat-mini-program/users/current/profile",
    method: "PUT",
    data: profile,
  });

const normalizeAuthorizedProfile = (profileResponse) => {
  const profile =
    profileResponse && typeof profileResponse === "object" ? profileResponse : null;
  const nickname =
    typeof profile?.nickname === "string"
      ? profile.nickname.trim()
      : typeof profile?.nickName === "string"
        ? profile.nickName.trim()
        : "";
  const avatarUrl =
    typeof profile?.avatar_url === "string"
      ? profile.avatar_url.trim()
      : typeof profile?.avatarUrl === "string"
      ? profile.avatarUrl.trim()
      : "";

  if (nickname === "" && avatarUrl === "") {
    throw new UserProfileAuthorizationError(
      "Mini program user profile patch is empty.",
      {
        code: USER_PROFILE_DATA_INVALID_CODE,
      }
    );
  }

  const normalizedProfile = {};
  if (nickname !== "") {
    normalizedProfile.nickname = nickname;
  }
  if (avatarUrl !== "") {
    normalizedProfile.avatar_url = avatarUrl;
  }

  return normalizedProfile;
};

const isUserProfileAuthorizationDenied = (error) =>
  Boolean(error) &&
  (error.code === USER_PROFILE_AUTHORIZATION_DENIED_CODE ||
    (typeof error.errMsg === "string" && error.errMsg.includes("auth deny")) ||
    (typeof error.errMsg === "string" && error.errMsg.includes("auth denied")));

const authorizeCurrentMiniProgramUserProfile = async (profileResponse) =>
  storeCurrentUserResult(
    await updateCurrentMiniProgramUserProfile(
      normalizeAuthorizedProfile(profileResponse)
    )
  );

const syncCurrentMiniProgramUser = async ({ forceRefresh = false } = {}) => {
  if (!forceRefresh && syncCurrentMiniProgramUserPromise !== null) {
    return syncCurrentMiniProgramUserPromise;
  }

  syncCurrentMiniProgramUserPromise = syncCurrentMiniProgramUserFromHttp()
    .then(storeCurrentUserResult)
    .catch((error) => {
      syncCurrentMiniProgramUserPromise = null;
      return storeCurrentUserError(error);
    });

  return syncCurrentMiniProgramUserPromise;
};

const getCurrentMiniProgramUser = () => {
  const globalData = resolveAppGlobalData();
  return globalData ? globalData.currentUser || null : null;
};

module.exports = {
  authorizeCurrentMiniProgramUserProfile,
  getCurrentMiniProgramUser,
  hasAuthenticatedMiniProgramUser,
  isUserProfileAuthorizationDenied,
  syncCurrentMiniProgramUser,
  updateCurrentMiniProgramUserProfile,
  UserProfileAuthorizationError,
};
