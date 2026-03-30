const { createConsultationRequest } = require("../../services/consultation");
const { syncCurrentMiniProgramUser } = require("../../services/auth");
const {
  AUTH_PAGE_STATE,
  hasAuthenticatedMiniProgramUser,
} = require("../../utils/userAuth");

const BUSINESS_TYPE_OTHER = "other";
const PHONE_PATTERN = /^1\d{10}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BUSINESS_TYPE_OPTIONS = Object.freeze([
  { label: "营销获客", value: "marketing_growth" },
  { label: "销售转化", value: "sales_conversion" },
  { label: "客户服务", value: "customer_service" },
  { label: "运营提效", value: "operation_efficiency" },
  { label: "知识库/培训", value: "knowledge_training" },
  { label: "数据分析", value: "data_analysis" },
  { label: "系统集成", value: "system_integration" },
  { label: "其他", value: BUSINESS_TYPE_OTHER },
]);

const buildInitialFormData = () => ({
  phone: "",
  email: "",
  businessType: BUSINESS_TYPE_OPTIONS[0].value,
  businessTypeIndex: 0,
  businessTypeOther: "",
  businessDescription: "",
});

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const validateSubmissionPayload = (data) => {
  const phone = normalizeText(data.phone);
  if (!PHONE_PATTERN.test(phone)) {
    return {
      errorMessage: "请输入正确的手机号",
    };
  }

  const email = normalizeText(data.email);
  if (!EMAIL_PATTERN.test(email)) {
    return {
      errorMessage: "请输入正确的邮箱地址",
    };
  }

  const businessType = normalizeText(data.businessType);
  if (businessType === "") {
    return {
      errorMessage: "请选择咨询的业务类型",
    };
  }

  const businessDescription = normalizeText(data.businessDescription);
  if (businessDescription === "") {
    return {
      errorMessage: "请填写具体业务描述",
    };
  }

  const businessTypeOther = normalizeText(data.businessTypeOther);
  if (businessType === BUSINESS_TYPE_OTHER && businessTypeOther === "") {
    return {
      errorMessage: "请补充其他业务类型说明",
    };
  }

  return {
    payload: {
      phone,
      email,
      business_type: businessType,
      business_type_other:
        businessType === BUSINESS_TYPE_OTHER ? businessTypeOther : undefined,
      business_description: businessDescription,
    },
  };
};

Page({
  data: {
    authPageState: AUTH_PAGE_STATE,
    authState: AUTH_PAGE_STATE.CHECKING,
    currentUser: null,
    businessTypeOptions: BUSINESS_TYPE_OPTIONS,
    isSubmitting: false,
    hasSubmitted: false,
    ...buildInitialFormData(),
  },

  onShow() {
    this.refreshAuthorizationState();
  },

  async refreshAuthorizationState() {
    this.setData({
      authState: AUTH_PAGE_STATE.CHECKING,
    });

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
      console.warn("Failed to resolve consult page authorization state.", error);
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
    this.refreshAuthorizationState();
  },

  handlePhoneInput(event) {
    this.setData({
      phone: typeof event?.detail?.value === "string" ? event.detail.value : "",
    });
  },

  handleEmailInput(event) {
    this.setData({
      email: typeof event?.detail?.value === "string" ? event.detail.value : "",
    });
  },

  handleBusinessTypeChange(event) {
    const nextIndex = Number(event?.detail?.value);
    const safeIndex = Number.isInteger(nextIndex) ? nextIndex : 0;
    const selectedOption = BUSINESS_TYPE_OPTIONS[safeIndex] || BUSINESS_TYPE_OPTIONS[0];

    this.setData({
      businessTypeIndex: safeIndex,
      businessType: selectedOption.value,
      businessTypeOther:
        selectedOption.value === BUSINESS_TYPE_OTHER ? this.data.businessTypeOther : "",
    });
  },

  handleBusinessTypeOtherInput(event) {
    this.setData({
      businessTypeOther:
        typeof event?.detail?.value === "string" ? event.detail.value : "",
    });
  },

  handleBusinessDescriptionInput(event) {
    this.setData({
      businessDescription:
        typeof event?.detail?.value === "string" ? event.detail.value : "",
    });
  },

  async handleSubmit() {
    if (this.data.authState !== AUTH_PAGE_STATE.READY || this.data.isSubmitting) {
      return;
    }

    const validationResult = validateSubmissionPayload(this.data);
    if (!validationResult.payload) {
      wx.showToast({
        title: validationResult.errorMessage,
        icon: "none",
      });
      return;
    }

    this.setData({
      isSubmitting: true,
    });

    try {
      await createConsultationRequest(validationResult.payload);
      this.setData({
        hasSubmitted: true,
        ...buildInitialFormData(),
      });
      wx.showToast({
        title: "提交成功",
        icon: "success",
      });
    } catch (error) {
      console.warn("Failed to create consultation request.", error);
      wx.showToast({
        title: "提交失败，请稍后重试",
        icon: "none",
      });
    } finally {
      this.setData({
        isSubmitting: false,
      });
    }
  },

  handleCreateAnother() {
    this.setData({
      hasSubmitted: false,
      ...buildInitialFormData(),
    });
  },
});
