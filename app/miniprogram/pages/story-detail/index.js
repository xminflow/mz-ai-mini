const { fetchStoryDetail } = require("../../services/story");
const {
  authorizeCurrentMiniProgramUserProfile,
  isUserProfileAuthorizationDenied,
  syncCurrentMiniProgramUser,
} = require("../../services/auth");
const { decodeBusinessCaseRouteId } = require("../../utils/businessCaseId");
const { AUTH_PAGE_STATE, hasAuthorizedUserProfile } = require("../../utils/userAuth");

const DOUBLE_TAP_INTERVAL_MS = 320;
const isPromiseLike = (value) => Boolean(value) && typeof value.then === "function";
const isWithinDoubleTapWindow = (lastTapTimestamp, currentTapTimestamp) => {
  if (typeof lastTapTimestamp !== "number" || lastTapTimestamp <= 0) {
    return false;
  }

  const delta = currentTapTimestamp - lastTapTimestamp;
  return delta > 0 && delta <= DOUBLE_TAP_INTERVAL_MS;
};

const waitForAppCurrentUserReady = async () => {
  if (typeof getApp !== "function") {
    return null;
  }

  const app = getApp();
  const globalData =
    app && typeof app === "object" && app.globalData && typeof app.globalData === "object"
      ? app.globalData
      : null;

  if (!globalData || !isPromiseLike(globalData.currentUserReady)) {
    return null;
  }

  const result = await globalData.currentUserReady;

  if (globalData.currentUserSyncError) {
    throw globalData.currentUserSyncError;
  }

  return result;
};

const resolveDefaultDocumentKey = (story = {}) => {
  if (story.defaultDocumentKey && story.documentMap?.[story.defaultDocumentKey]) {
    return story.defaultDocumentKey;
  }

  const firstTab = Array.isArray(story.documentTabs) ? story.documentTabs[0] : null;
  return firstTab ? firstTab.key : "";
};

const resolveActiveDocument = (story = {}, documentKey = "") => {
  if (!story.documentMap || !documentKey) {
    return null;
  }

  return story.documentMap[documentKey] || null;
};

Page({
  data: {
    authPageState: AUTH_PAGE_STATE,
    authState: AUTH_PAGE_STATE.CHECKING,
    isAuthorizing: false,
    story: null,
    activeDocumentKey: "",
    activeDocument: null,
    isLoading: true,
    loadError: false,
  },

  onLoad(options) {
    this.storyId = decodeBusinessCaseRouteId(options.id);
    this._coverImageLastTapTimestamp = 0;
  },

  onShow() {
    if (this.data.authState === AUTH_PAGE_STATE.READY && this.data.story) {
      return
    }

    this.refreshAuthorizationState();
  },

  async refreshAuthorizationState(forceRefresh = false) {
    this.setData({
      authState: AUTH_PAGE_STATE.CHECKING,
      story: forceRefresh ? null : this.data.story,
      activeDocumentKey: forceRefresh ? "" : this.data.activeDocumentKey,
      activeDocument: forceRefresh ? null : this.data.activeDocument,
      isLoading: false,
      loadError: false,
    });

    try {
      if (!forceRefresh) {
        await waitForAppCurrentUserReady();
      }

      const result = await syncCurrentMiniProgramUser({ forceRefresh });
      const currentUser = result ? result.user : null;
      const authState = hasAuthorizedUserProfile(currentUser)
        ? AUTH_PAGE_STATE.READY
        : AUTH_PAGE_STATE.UNAUTHORIZED;

      this.setData({
        authState,
        story: authState === AUTH_PAGE_STATE.READY ? this.data.story : null,
        activeDocumentKey:
          authState === AUTH_PAGE_STATE.READY ? this.data.activeDocumentKey : "",
        activeDocument:
          authState === AUTH_PAGE_STATE.READY ? this.data.activeDocument : null,
      });

      if (authState === AUTH_PAGE_STATE.READY) {
        this.loadStoryDetail();
      }
    } catch (error) {
      console.warn("Failed to resolve story detail authorization state.", error);
      this.setData({
        authState: AUTH_PAGE_STATE.ERROR,
        story: null,
        activeDocumentKey: "",
        activeDocument: null,
        isLoading: false,
        loadError: false,
      });
    }
  },

  async loadStoryDetail() {
    if (this.data.authState !== AUTH_PAGE_STATE.READY) {
      return;
    }

    if (!this.storyId) {
      this.setData({
        story: null,
        activeDocumentKey: "",
        activeDocument: null,
        isLoading: false,
        loadError: true,
      });
      return;
    }

    this.setData({
      isLoading: true,
      loadError: false,
    });

    wx.showNavigationBarLoading();

    try {
      const story = await fetchStoryDetail(this.storyId);
      const navigationTitle = story.title ? story.title.slice(0, 8) : "案例详情";
      const activeDocumentKey = resolveDefaultDocumentKey(story);
      const activeDocument = resolveActiveDocument(story, activeDocumentKey);

      this.setData({
        story,
        activeDocumentKey,
        activeDocument,
        isLoading: false,
      });

      wx.setNavigationBarTitle({
        title: navigationTitle,
      });
    } catch (error) {
      this.setData({
        story: null,
        activeDocumentKey: "",
        activeDocument: null,
        isLoading: false,
        loadError: true,
      });

      wx.showToast({
        title: "内容暂不可用",
        icon: "none",
      });
    } finally {
      wx.hideNavigationBarLoading();
    }
  },

  handleRetry() {
    if (this.data.authState === AUTH_PAGE_STATE.READY) {
      this.loadStoryDetail();
      return;
    }

    this.refreshAuthorizationState(true);
  },

  handleDocumentTabTap(event) {
    const { key } = event.currentTarget.dataset;
    if (!key || key === this.data.activeDocumentKey || !this.data.story) {
      return;
    }

    const activeDocument = resolveActiveDocument(this.data.story, key);
    if (!activeDocument) {
      return;
    }

    this.setData({
      activeDocumentKey: key,
      activeDocument,
    });
  },

  handleCoverImageTap() {
    const coverImage = this.data.story?.coverImage;
    if (typeof coverImage !== "string" || coverImage.trim() === "") {
      return;
    }

    const currentTapTimestamp = Date.now();
    if (
      isWithinDoubleTapWindow(this._coverImageLastTapTimestamp, currentTapTimestamp)
    ) {
      this._coverImageLastTapTimestamp = 0;
      wx.previewImage({
        current: coverImage,
        urls: [coverImage],
      });
      return;
    }

    this._coverImageLastTapTimestamp = currentTapTimestamp;
  },

  async handleAuthorize() {
    if (this.data.isAuthorizing) {
      return;
    }

    this.setData({
      isAuthorizing: true,
    });

    try {
      await authorizeCurrentMiniProgramUserProfile();
      this.setData({
        authState: AUTH_PAGE_STATE.READY,
      });
      wx.showToast({
        title: "授权成功",
        icon: "success",
      });
      this.loadStoryDetail();
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
        console.warn("Failed to authorize from story detail page.", error);
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
});
