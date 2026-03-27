const {
  authorizeCurrentMiniProgramUserProfile,
  isUserProfileAuthorizationDenied,
  syncCurrentMiniProgramUser,
} = require("../../services/auth");
const { AUTH_PAGE_STATE, hasAuthorizedUserProfile } = require("../../utils/userAuth");

Page({
  data: {
    authPageState: AUTH_PAGE_STATE,
    authState: AUTH_PAGE_STATE.CHECKING,
    currentUser: null,
    isAuthorizing: false,
  },

  onShow() {
    this.refreshAuthorizationState();
  },

  async refreshAuthorizationState(forceRefresh = false) {
    this.setData({
      authState: AUTH_PAGE_STATE.CHECKING,
    });

    try {
      const result = await syncCurrentMiniProgramUser({ forceRefresh });
      const currentUser = result ? result.user : null;

      this.setData({
        currentUser,
        authState: hasAuthorizedUserProfile(currentUser)
          ? AUTH_PAGE_STATE.READY
          : AUTH_PAGE_STATE.UNAUTHORIZED,
      });
    } catch (error) {
      console.warn("Failed to resolve mine page authorization state.", error);
      this.setData({
        currentUser: null,
        authState: AUTH_PAGE_STATE.ERROR,
      });
    }
  },

  async handleAuthorize() {
    if (this.data.isAuthorizing) {
      return;
    }

    this.setData({
      isAuthorizing: true,
    });

    try {
      const currentUser = await authorizeCurrentMiniProgramUserProfile();
      this.setData({
        currentUser,
        authState: AUTH_PAGE_STATE.READY,
      });
      wx.showToast({
        title: "授权成功",
        icon: "success",
      });
    } catch (error) {
      if (isUserProfileAuthorizationDenied(error)) {
        this.setData({
          authState: AUTH_PAGE_STATE.UNAUTHORIZED,
        });
        wx.showToast({
          title: "你已取消授权",
          icon: "none",
        });
      } else {
        console.warn("Failed to authorize mini program user profile.", error);
        this.setData({
          authState: AUTH_PAGE_STATE.ERROR,
        });
        wx.showToast({
          title: "授权失败，请稍后重试",
          icon: "none",
        });
      }
    } finally {
      this.setData({
        isAuthorizing: false,
      });
    }
  },

  handleRetryAuth() {
    this.refreshAuthorizationState(true);
  },
});
