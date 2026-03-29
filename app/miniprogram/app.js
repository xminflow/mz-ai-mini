const {
  authorizeCurrentMiniProgramUserProfile,
  hasAuthorizedUserProfile,
  isUserProfileAuthorizationDenied,
  syncCurrentMiniProgramUser,
} = require("./services/auth");
const { CLOUD_ENV_ID } = require("./core/runtime-config");

const authorizeCurrentUserOnLaunchIfNeeded = async () => {
  const result = await syncCurrentMiniProgramUser();

  if (hasAuthorizedUserProfile(result?.user)) {
    return result;
  }

  const currentUser = await authorizeCurrentMiniProgramUserProfile();
  return {
    is_new_user: result ? Boolean(result.is_new_user) : false,
    user: currentUser,
  };
};

App({
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: CLOUD_ENV_ID,
        traceUser: false,
      });
    }

    this.globalData.currentUser = null;
    this.globalData.currentUserSyncError = null;
    this.globalData.currentUserReady = authorizeCurrentUserOnLaunchIfNeeded()
      .catch((error) => {
        if (isUserProfileAuthorizationDenied(error)) {
          console.info("Mini program user profile authorization was denied on launch.");
          return null;
        }

        console.warn("Failed to resolve current mini program user on launch.", error);
        return null;
      });
  },
  globalData: {},
});
