const {
  createPublicCaseResearchRequest,
  purchasePrivateCaseResearch,
  isCaseResearchPaymentCancelled,
  isCaseResearchPaymentResultPending,
} = require("../../services/case-research");
const { syncCurrentMiniProgramUser } = require("../../services/auth");
const {
  AUTH_PAGE_STATE,
  hasAuthenticatedMiniProgramUser,
} = require("../../utils/userAuth");

const REQUEST_TYPE_PUBLIC = "public";
const REQUEST_TYPE_PRIVATE = "private";

const buildInitialFormData = () => ({
  title: "",
  description: "",
  requestType: REQUEST_TYPE_PUBLIC,
});

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const validateForm = (data) => {
  const title = normalizeText(data.title);
  if (title === "") {
    return { errorMessage: "请输入标题" };
  }

  const description = normalizeText(data.description);
  if (description === "") {
    return { errorMessage: "请填写描述" };
  }

  return {
    payload: { title, description },
  };
};

Page({
  data: {
    authPageState: AUTH_PAGE_STATE,
    authState: AUTH_PAGE_STATE.CHECKING,
    currentUser: null,
    isSubmitting: false,
    hasSubmitted: false,
    submittedVisibility: REQUEST_TYPE_PUBLIC,
    ...buildInitialFormData(),
  },

  onShow() {
    this._refreshAuthorizationState();
  },

  async _refreshAuthorizationState() {
    this.setData({ authState: AUTH_PAGE_STATE.CHECKING });
    try {
      const result = await syncCurrentMiniProgramUser({ forceRefresh: true });
      const currentUser = result ? result.user : null;
      this.setData({
        currentUser,
        authState: hasAuthenticatedMiniProgramUser(currentUser)
          ? AUTH_PAGE_STATE.READY
          : AUTH_PAGE_STATE.UNAUTHORIZED,
      });
    } catch (error) {
      console.warn("Failed to resolve apply page authorization state.", error);
      this.setData({
        currentUser: null,
        authState: AUTH_PAGE_STATE.ERROR,
      });
    }
  },

  handleAuthorize() {
    wx.switchTab({ url: "/pages/mine/index" });
  },

  handleRetryAuth() {
    this._refreshAuthorizationState();
  },

  handleTitleInput(event) {
    this.setData({
      title: typeof event?.detail?.value === "string" ? event.detail.value : "",
    });
  },

  handleDescriptionInput(event) {
    this.setData({
      description: typeof event?.detail?.value === "string" ? event.detail.value : "",
    });
  },

  handleSelectPublic() {
    this.setData({ requestType: REQUEST_TYPE_PUBLIC });
  },

  handleSelectPrivate() {
    this.setData({ requestType: REQUEST_TYPE_PRIVATE });
  },

  async handleSubmit() {
    if (this.data.authState !== AUTH_PAGE_STATE.READY || this.data.isSubmitting) {
      return;
    }

    const validationResult = validateForm(this.data);
    if (!validationResult.payload) {
      wx.showToast({ title: validationResult.errorMessage, icon: "none" });
      return;
    }

    this.setData({ isSubmitting: true });

    try {
      if (this.data.requestType === REQUEST_TYPE_PUBLIC) {
        await this._submitPublicRequest(validationResult.payload);
      } else {
        await this._submitPrivateRequest(validationResult.payload);
      }
    } finally {
      this.setData({ isSubmitting: false });
    }
  },

  async _submitPublicRequest(payload) {
    try {
      await createPublicCaseResearchRequest(payload);
      this.setData({
        hasSubmitted: true,
        submittedVisibility: REQUEST_TYPE_PUBLIC,
        ...buildInitialFormData(),
      });
      wx.showToast({ title: "申请已提交", icon: "success" });
    } catch (error) {
      console.warn("Failed to create public case research request.", error);
      wx.showToast({ title: "提交失败，请稍后重试", icon: "none" });
    }
  },

  async _submitPrivateRequest(payload) {
    try {
      await purchasePrivateCaseResearch(payload);
      this.setData({
        hasSubmitted: true,
        submittedVisibility: REQUEST_TYPE_PRIVATE,
        ...buildInitialFormData(),
      });
      wx.showToast({ title: "支付成功，申请已提交", icon: "success" });
    } catch (error) {
      if (isCaseResearchPaymentCancelled(error)) {
        wx.showToast({ title: "你已取消支付", icon: "none" });
        return;
      }
      if (isCaseResearchPaymentResultPending(error)) {
        wx.showToast({ title: "支付处理中，请稍后刷新", icon: "none" });
        return;
      }
      console.warn("Failed to purchase private case research.", error);
      wx.showToast({ title: "支付失败，请稍后重试", icon: "none" });
    }
  },

  handleCreateAnother() {
    this.setData({
      hasSubmitted: false,
      submittedVisibility: REQUEST_TYPE_PUBLIC,
      ...buildInitialFormData(),
    });
  },
});
