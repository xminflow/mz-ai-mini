const {
  authorizeCurrentMiniProgramUserProfile,
  isUserProfileAuthorizationDenied,
  syncCurrentMiniProgramUser,
} = require("../../services/auth");
const { formatDateLabel } = require("../../utils/format");
const { AUTH_PAGE_STATE, hasAuthorizedUserProfile } = require("../../utils/userAuth");

const MEMBERSHIP_TIER_NORMAL = "normal";
const MEMBERSHIP_TIER_PLATINUM = "platinum";

const resolveMembershipStatusText = (user) => {
  const membership =
    user && typeof user === "object" && user.membership && typeof user.membership === "object"
      ? user.membership
      : null;

  if (!membership || membership.is_active !== true) {
    return "当前为非会员，可前往订阅页开通普通会员。";
  }

  if (membership.tier === MEMBERSHIP_TIER_NORMAL) {
    const expiresAtText = formatDateLabel(membership.expires_at);
    return expiresAtText
      ? `普通会员（有效期至 ${expiresAtText}）`
      : "普通会员";
  }

  if (membership.tier === MEMBERSHIP_TIER_PLATINUM) {
    const expiresAtText = formatDateLabel(membership.expires_at);
    return expiresAtText
      ? `白金会员（有效期至 ${expiresAtText}）`
      : "白金会员";
  }

  return "当前为非会员，可前往订阅页开通普通会员。";
};

Page({
  data: {
    authPageState: AUTH_PAGE_STATE,
    authState: AUTH_PAGE_STATE.CHECKING,
    currentUser: null,
    isAuthorizing: false,
    membershipStatusText: "当前为非会员，可前往订阅页开通普通会员。",
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
        membershipStatusText: resolveMembershipStatusText(currentUser),
        authState: hasAuthorizedUserProfile(currentUser)
          ? AUTH_PAGE_STATE.READY
          : AUTH_PAGE_STATE.UNAUTHORIZED,
      });
    } catch (error) {
      console.warn("Failed to resolve mine page authorization state.", error);
      this.setData({
        currentUser: null,
        authState: AUTH_PAGE_STATE.ERROR,
        membershipStatusText: "当前为非会员，可前往订阅页开通普通会员。",
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
        membershipStatusText: resolveMembershipStatusText(currentUser),
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
