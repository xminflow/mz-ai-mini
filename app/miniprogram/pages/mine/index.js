const {
  authorizeCurrentMiniProgramUserProfile,
  syncCurrentMiniProgramUser,
} = require("../../services/auth");
const {
  isMembershipPaymentCancelled,
  isMembershipPaymentResultPending,
  purchaseNormalMembership,
} = require("../../services/membership");
const { fetchUserCaseResearchRequests } = require("../../services/case-research");
const {
  generateAvatarCloudPath,
  isCloudFileId,
  resolveCloudFileTempUrlMap,
  uploadFileToCloud,
} = require("../../utils/cloudFile");
const { formatDateLabel } = require("../../utils/format");

const CASE_REQUEST_STATUS_LABELS = Object.freeze({
  pending_review: "审核中",
  accepted: "已立项",
  rejected: "未通过",
  in_progress: "制作中",
  completed: "已完成",
});
const {
  AUTH_PAGE_STATE,
  hasAuthenticatedMiniProgramUser,
} = require("../../utils/userAuth");

const MEMBERSHIP_TIER_NORMAL = "normal";
const MEMBERSHIP_TIER_PLATINUM = "platinum";
const DEFAULT_USER_DISPLAY_NAME = "微信用户";
const DEFAULT_USER_AVATAR_URL = "/images/avatar.png";

const _resolveNormalMembershipState = (user) => {
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
    normalMembershipStatusText: expiresAtText ? `有效期至 ${expiresAtText}` : "会员已生效",
  };
};

const _resolveMembershipBadge = (user) => {
  const membership =
    user && typeof user === "object" && user.membership && typeof user.membership === "object"
      ? user.membership
      : null;

  if (!membership || membership.is_active !== true) {
    return "非会员";
  }

  if (membership.tier === MEMBERSHIP_TIER_NORMAL) {
    const expiresAtText = formatDateLabel(membership.expires_at);
    return expiresAtText ? `普通会员 · 有效期至 ${expiresAtText}` : "普通会员";
  }

  if (membership.tier === MEMBERSHIP_TIER_PLATINUM) {
    const expiresAtText = formatDateLabel(membership.expires_at);
    return expiresAtText ? `白金会员 · 有效期至 ${expiresAtText}` : "白金会员";
  }

  return "非会员";
};

const _resolveUserDisplayName = (user) => {
  const nickname =
    user && typeof user === "object" && typeof user.nickname === "string"
      ? user.nickname.trim()
      : "";
  return nickname || DEFAULT_USER_DISPLAY_NAME;
};

const _resolveUserAvatarSource = (user) =>
  user && typeof user === "object" && typeof user.avatar_url === "string"
    ? user.avatar_url.trim()
    : "";

const _resolveUserAvatarDisplayUrl = async (user) => {
  const avatarUrl = _resolveUserAvatarSource(user);
  if (!avatarUrl) {
    return DEFAULT_USER_AVATAR_URL;
  }

  if (!isCloudFileId(avatarUrl)) {
    return avatarUrl;
  }

  const tempUrlMap = await resolveCloudFileTempUrlMap([avatarUrl]);
  return tempUrlMap[avatarUrl] || avatarUrl;
};

const _normalizeAuthorizationNickname = (value) =>
  typeof value === "string" ? value.trim() : "";

const _normalizeAuthorizationAvatarUrl = (value) =>
  typeof value === "string" ? value.trim() : "";

const _uploadAuthorizedAvatar = async (avatarUrl) => {
  if (avatarUrl === "" || isCloudFileId(avatarUrl)) {
    return avatarUrl;
  }

  return uploadFileToCloud(avatarUrl, generateAvatarCloudPath(avatarUrl));
};

const _buildProfileDraft = (user, avatarPreviewUrl) => ({
  authorizationNickname:
    user && typeof user === "object" && typeof user.nickname === "string"
      ? user.nickname
      : "",
  authorizationAvatarUrl:
    user && typeof user === "object" && typeof user.avatar_url === "string"
      ? user.avatar_url
      : "",
  authorizationAvatarPreviewUrl: avatarPreviewUrl || DEFAULT_USER_AVATAR_URL,
});

const _resolveCurrentUserState = async (currentUser) => {
  const normalMembershipState = _resolveNormalMembershipState(currentUser);
  const currentUserAvatarUrl = await _resolveUserAvatarDisplayUrl(currentUser);

  return {
    currentUser,
    authState: hasAuthenticatedMiniProgramUser(currentUser)
      ? AUTH_PAGE_STATE.READY
      : AUTH_PAGE_STATE.UNAUTHORIZED,
    currentUserDisplayName: _resolveUserDisplayName(currentUser),
    currentUserAvatarUrl,
    isNormalMembershipActive: normalMembershipState.isNormalMembershipActive,
    normalMembershipStatusText: normalMembershipState.normalMembershipStatusText,
    membershipBadge: _resolveMembershipBadge(currentUser),
  };
};

Page({
  data: {
    authPageState: AUTH_PAGE_STATE,
    authState: AUTH_PAGE_STATE.CHECKING,
    currentUser: null,
    currentUserDisplayName: DEFAULT_USER_DISPLAY_NAME,
    currentUserAvatarUrl: DEFAULT_USER_AVATAR_URL,
    isEditingProfile: false,
    isUpdatingAvatar: false,
    isUpdatingNickname: false,
    authorizationNickname: "",
    authorizationAvatarUrl: "",
    authorizationAvatarPreviewUrl: DEFAULT_USER_AVATAR_URL,
    isPurchasingMembership: false,
    isNormalMembershipActive: false,
    normalMembershipStatusText: "开通后可体验普通会员内容与服务",
    membershipBadge: "非会员",
    userCaseRequests: [],
  },

  onShow() {
    this.refreshAuthorizationState();
  },

  async _loadUserCaseRequests() {
    try {
      const result = await fetchUserCaseResearchRequests();
      const items = Array.isArray(result?.items) ? result.items : [];
      this.setData({
        userCaseRequests: items.map((item) => ({
          requestId: item.request_id,
          title: item.title,
          statusLabel: CASE_REQUEST_STATUS_LABELS[item.status] || item.status,
          linkedCaseId: item.linked_case_id || null,
          createdAtText: formatDateLabel(item.created_at),
        })),
      });
    } catch (error) {
      console.warn("Failed to load user case research requests.", error);
    }
  },

  async applyCurrentUserState(currentUser, { resetProfileDraft = false } = {}) {
    const currentUserState = await _resolveCurrentUserState(currentUser);
    const profileDraft = resetProfileDraft
      ? _buildProfileDraft(currentUser, currentUserState.currentUserAvatarUrl)
      : {};

    this.setData({
      ...currentUserState,
      ...profileDraft,
    });

    if (hasAuthenticatedMiniProgramUser(currentUser)) {
      this._loadUserCaseRequests();
    }
  },

  async syncProfilePatch(profilePatch) {
    const result = await authorizeCurrentMiniProgramUserProfile(profilePatch);
    const currentUser = result ? result.user : null;
    await this.applyCurrentUserState(currentUser, { resetProfileDraft: true });
    return currentUser;
  },

  async refreshAuthorizationState(forceRefresh = false) {
    this.setData({ authState: AUTH_PAGE_STATE.CHECKING });

    try {
      const result = await syncCurrentMiniProgramUser({ forceRefresh });
      const currentUser = result ? result.user : null;
      await this.applyCurrentUserState(currentUser, {
        resetProfileDraft: !this.data.isEditingProfile,
      });
    } catch (error) {
      console.warn("Failed to resolve mine page authorization state.", error);
      this.setData({
        currentUser: null,
        authState: AUTH_PAGE_STATE.ERROR,
        currentUserDisplayName: DEFAULT_USER_DISPLAY_NAME,
        currentUserAvatarUrl: DEFAULT_USER_AVATAR_URL,
        isEditingProfile: false,
        isUpdatingAvatar: false,
        isUpdatingNickname: false,
        isNormalMembershipActive: false,
        normalMembershipStatusText: "开通后可体验普通会员内容与服务",
        membershipBadge: "非会员",
      });
    }
  },

  handleStartProfileEdit() {
    this.setData({
      isEditingProfile: true,
      ..._buildProfileDraft(this.data.currentUser, this.data.currentUserAvatarUrl),
    });
  },

  handleCancelProfileEdit() {
    this.setData({
      isEditingProfile: false,
      ..._buildProfileDraft(this.data.currentUser, this.data.currentUserAvatarUrl),
    });
  },

  async handleChooseAvatar(event) {
    if (this.data.isUpdatingAvatar) return;

    const avatarUrl = _normalizeAuthorizationAvatarUrl(event?.detail?.avatarUrl);
    if (avatarUrl === "") return;

    this.setData({
      isUpdatingAvatar: true,
      authorizationAvatarUrl: avatarUrl,
      authorizationAvatarPreviewUrl: avatarUrl,
    });

    try {
      const uploadedAvatarUrl = await _uploadAuthorizedAvatar(avatarUrl);
      await this.syncProfilePatch({
        avatar_url: uploadedAvatarUrl,
      });
      wx.showToast({ title: "头像已更新", icon: "success" });
    } catch (error) {
      console.warn("Failed to sync avatar from mine page.", error);
      this.setData({
        ..._buildProfileDraft(this.data.currentUser, this.data.currentUserAvatarUrl),
      });
      wx.showToast({ title: "头像更新失败，请稍后重试", icon: "none" });
    } finally {
      this.setData({ isUpdatingAvatar: false });
    }
  },

  handleNicknameInput(event) {
    this.setData({
      authorizationNickname:
        typeof event?.detail?.value === "string" ? event.detail.value : "",
    });
  },

  async handleNicknameBlur(event) {
    if (this.data.isUpdatingNickname) return;

    const rawNickname =
      typeof event?.detail?.value === "string"
        ? event.detail.value
        : this.data.authorizationNickname;
    const nickname = _normalizeAuthorizationNickname(rawNickname);
    const currentNickname = _normalizeAuthorizationNickname(this.data.currentUser?.nickname);

    this.setData({
      authorizationNickname: rawNickname,
    });

    if (nickname === "") {
      this.setData({
        authorizationNickname: currentNickname,
      });
      wx.showToast({ title: "昵称不能为空", icon: "none" });
      return;
    }

    if (nickname === currentNickname) {
      this.setData({
        authorizationNickname: nickname,
      });
      return;
    }

    this.setData({
      authorizationNickname: nickname,
      isUpdatingNickname: true,
    });

    try {
      await this.syncProfilePatch({
        nickname,
      });
      wx.showToast({ title: "昵称已更新", icon: "success" });
    } catch (error) {
      console.warn("Failed to sync nickname from mine page.", error);
      this.setData({
        authorizationNickname: currentNickname,
      });
      wx.showToast({ title: "昵称更新失败，请稍后重试", icon: "none" });
    } finally {
      this.setData({ isUpdatingNickname: false });
    }
  },

  handleRetryAuth() {
    this.refreshAuthorizationState(true);
  },

  handleViewCase(event) {
    const caseId = event?.currentTarget?.dataset?.caseId;
    if (!caseId) return;
    wx.navigateTo({ url: `/pages/story-detail/index?id=${encodeURIComponent(caseId)}` });
  },

  async handleOpenNormalMembership() {
    if (this.data.isPurchasingMembership || this.data.isNormalMembershipActive) return;

    this.setData({ isPurchasingMembership: true });

    try {
      await purchaseNormalMembership();
      await this.refreshAuthorizationState(true);
      wx.showToast({ title: "开通成功", icon: "success" });
    } catch (error) {
      if (isMembershipPaymentCancelled(error)) {
        wx.showToast({ title: "你已取消支付", icon: "none" });
        return;
      }
      if (isMembershipPaymentResultPending(error)) {
        wx.showToast({ title: "支付处理中，请稍后刷新", icon: "none" });
        return;
      }
      console.warn("Failed to purchase normal membership.", error);
      wx.showToast({ title: "开通失败，请稍后重试", icon: "none" });
    } finally {
      this.setData({ isPurchasingMembership: false });
    }
  },
});
