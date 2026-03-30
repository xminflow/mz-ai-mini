const { syncCurrentMiniProgramUser } = require("./services/auth");
const { CLOUD_ENV_ID } = require("./core/runtime-config");

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
    this.globalData.currentUserReady = syncCurrentMiniProgramUser().catch((error) => {
      console.warn("Failed to sync current mini program user on launch.", error);
      return null;
    });
  },
  globalData: {},
});
