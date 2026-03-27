const { request } = require("../core/apiClient");
const { hasAuthorizedUserProfile } = require("../utils/userAuth");

const USER_PROFILE_DENIED_CODE = "AUTH.USER_PROFILE_DENIED";
const USER_PROFILE_API_UNAVAILABLE_CODE = "AUTH.USER_PROFILE_API_UNAVAILABLE";
const USER_PROFILE_INCOMPLETE_CODE = "AUTH.USER_PROFILE_INCOMPLETE";

class MiniProgramAuthorizeError extends Error {
  constructor(message, { code = "" } = {}) {
    super(message);
    this.name = "MiniProgramAuthorizeError";
    this.code = code;
  }
}

let syncCurrentMiniProgramUserPromise = null;
let authorizeCurrentMiniProgramUserProfilePromise = null;

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
    globalData.currentUserReady = Promise.resolve(result);
  }
  return result;
};

const storeCurrentUserError = (error) => {
  const globalData = resolveAppGlobalData();
  if (globalData) {
    globalData.currentUser = null;
    globalData.currentUserSyncError = error;
  }
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

const requestMiniProgramUserProfile = () =>
  new Promise((resolve, reject) => {
    if (typeof wx === "undefined" || typeof wx.getUserProfile !== "function") {
      reject(
        new MiniProgramAuthorizeError("wx.getUserProfile is unavailable.", {
          code: USER_PROFILE_API_UNAVAILABLE_CODE,
        })
      );
      return;
    }

    wx.getUserProfile({
      desc: "用于完善你的会员资料",
      success(response) {
        const userInfo = response.userInfo || {};
        const nickname =
          typeof userInfo.nickName === "string" ? userInfo.nickName.trim() : "";
        const avatarUrl =
          typeof userInfo.avatarUrl === "string" ? userInfo.avatarUrl.trim() : "";

        if (nickname === "" || avatarUrl === "") {
          reject(
            new MiniProgramAuthorizeError("Authorized user profile is incomplete.", {
              code: USER_PROFILE_INCOMPLETE_CODE,
            })
          );
          return;
        }

        resolve({
          nickname,
          avatar_url: avatarUrl,
        });
      },
      fail(error) {
        reject(
          new MiniProgramAuthorizeError(
            error?.errMsg || "Mini program user profile authorization was denied.",
            {
              code: USER_PROFILE_DENIED_CODE,
            }
          )
        );
      },
    });
  });

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

  const globalData = resolveAppGlobalData();
  if (globalData) {
    globalData.currentUserReady = syncCurrentMiniProgramUserPromise;
  }

  return syncCurrentMiniProgramUserPromise;
};

const authorizeCurrentMiniProgramUserProfile = async () => {
  if (authorizeCurrentMiniProgramUserProfilePromise !== null) {
    return authorizeCurrentMiniProgramUserProfilePromise;
  }

  authorizeCurrentMiniProgramUserProfilePromise = syncCurrentMiniProgramUser()
    .then(async (result) => {
      if (result?.user && hasAuthorizedUserProfile(result.user)) {
        return result.user;
      }

      const profile = await requestMiniProgramUserProfile();
      const updatedProfileResult = await updateCurrentMiniProgramUserProfile(profile);
      const syncedResult = storeCurrentUserResult({
        is_new_user: result ? Boolean(result.is_new_user) : false,
        user: updatedProfileResult.user,
      });
      syncCurrentMiniProgramUserPromise = Promise.resolve(syncedResult);
      return syncedResult.user;
    })
    .finally(() => {
      authorizeCurrentMiniProgramUserProfilePromise = null;
    });

  return authorizeCurrentMiniProgramUserProfilePromise;
};

const getCurrentMiniProgramUser = () => {
  const globalData = resolveAppGlobalData();
  return globalData ? globalData.currentUser || null : null;
};

const isUserProfileAuthorizationDenied = (error) =>
  error instanceof MiniProgramAuthorizeError &&
  error.code === USER_PROFILE_DENIED_CODE;

module.exports = {
  authorizeCurrentMiniProgramUserProfile,
  getCurrentMiniProgramUser,
  hasAuthorizedUserProfile,
  isUserProfileAuthorizationDenied,
  MiniProgramAuthorizeError,
  syncCurrentMiniProgramUser,
};
