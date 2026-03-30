const {
  syncCurrentMiniProgramUser,
} = require("../../services/auth");
const {
  isMembershipPaymentCancelled,
  isMembershipPaymentResultPending,
  purchaseNormalMembership,
} = require("../../services/membership");
const { formatDateLabel } = require("../../utils/format");
const {
  AUTH_PAGE_STATE,
  hasAuthenticatedMiniProgramUser,
} = require("../../utils/userAuth");

const MEMBERSHIP_TIER_NORMAL = "normal";

const resolveNormalMembershipState = (user) => {
  const membership =
    user && typeof user === "object" && user.membership && typeof user.membership === "object"
      ? user.membership
      : null;
  const isNormalMembershipActive =
    membership &&
    membership.tier === MEMBERSHIP_TIER_NORMAL &&
    membership.is_active === true;

  if (!isNormalMembershipActive) {
    return {
      isNormalMembershipActive: false,
      normalMembershipStatusText: "开通后可体验普通会员内容与服务",
    };
  }

  const expiresAtText = formatDateLabel(membership.expires_at);
  return {
    isNormalMembershipActive: true,
    normalMembershipStatusText: expiresAtText
      ? `有效期至 ${expiresAtText}`
      : "会员已生效",
  };
};

Page({
  data: {
    authPageState: AUTH_PAGE_STATE,
    authState: AUTH_PAGE_STATE.CHECKING,
    isAuthorizing: false,
    isPurchasingMembership: false,
    currentUser: null,
    isNormalMembershipActive: false,
    normalMembershipStatusText: "开通后可体验普通会员内容与服务",
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
      const normalMembershipState = resolveNormalMembershipState(currentUser);
      this.setData({
        currentUser,
        authState: hasAuthenticatedMiniProgramUser(currentUser)
          ? AUTH_PAGE_STATE.READY
          : AUTH_PAGE_STATE.UNAUTHORIZED,
        isNormalMembershipActive: normalMembershipState.isNormalMembershipActive,
        normalMembershipStatusText: normalMembershipState.normalMembershipStatusText,
      });
    } catch (error) {
      console.warn("Failed to resolve subscribe page authorization state.", error);
      this.setData({
        currentUser: null,
        authState: AUTH_PAGE_STATE.ERROR,
        isNormalMembershipActive: false,
        normalMembershipStatusText: "开通后可体验普通会员内容与服务",
      });
    }
  },

  handleAuthorize() {
    wx.switchTab({ url: "/pages/mine/index" });
  },

  handleRetryAuth() {
    this.refreshAuthorizationState(true);
  },

  async handleOpenNormalMembership() {
    if (this.data.isPurchasingMembership || this.data.isNormalMembershipActive) {
      return;
    }

    this.setData({
      isPurchasingMembership: true,
    });

    try {
      await purchaseNormalMembership();
      await this.refreshAuthorizationState(true);
      wx.showToast({
        title: "开通成功",
        icon: "success",
      });
    } catch (error) {
      if (isMembershipPaymentCancelled(error)) {
        wx.showToast({
          title: "你已取消支付",
          icon: "none",
        });
        return;
      }

      if (isMembershipPaymentResultPending(error)) {
        wx.showToast({
          title: "支付处理中，请稍后刷新",
          icon: "none",
        });
        return;
      }

      console.warn("Failed to purchase normal membership.", error);
      wx.showToast({
        title: "开通失败，请稍后重试",
        icon: "none",
      });
    } finally {
      this.setData({
        isPurchasingMembership: false,
      });
    }
  },
});
