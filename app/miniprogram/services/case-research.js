const { request } = require("../core/apiClient");

const PAYMENT_SIGN_TYPE_RSA = "RSA";
const POLL_INTERVAL_MS = 1200;
const POLL_MAX_ATTEMPTS = 8;
const PAYMENT_CANCELLED_CODE = "CASE_RESEARCH.PAYMENT_CANCELLED";
const PAYMENT_FAILED_CODE = "CASE_RESEARCH.PAYMENT_FAILED";
const PAYMENT_RESULT_PENDING_CODE = "CASE_RESEARCH.PAYMENT_RESULT_PENDING";

class CaseResearchPaymentError extends Error {
  constructor(message, { code = "" } = {}) {
    super(message);
    this.name = "CaseResearchPaymentError";
    this.code = code;
  }
}

const createPublicCaseResearchRequest = (payload) =>
  request({
    path: "/case-research/wechat-mini-program/requests",
    method: "POST",
    data: payload,
  });

const createCaseResearchOrder = (payload) =>
  request({
    path: "/case-research/wechat-mini-program/orders",
    method: "POST",
    data: payload,
  });

const getCaseResearchOrder = (orderNo) =>
  request({
    path: `/case-research/wechat-mini-program/orders/${encodeURIComponent(orderNo)}`,
    method: "GET",
  });

const fetchUserCaseResearchRequests = () =>
  request({
    path: "/case-research/wechat-mini-program/requests",
    method: "GET",
  });

const _requestWechatPayment = (paymentParams) =>
  new Promise((resolve, reject) => {
    wx.requestPayment({
      timeStamp: paymentParams.time_stamp,
      nonceStr: paymentParams.nonce_str,
      package: paymentParams.package,
      signType: paymentParams.sign_type || PAYMENT_SIGN_TYPE_RSA,
      paySign: paymentParams.pay_sign,
      success() {
        resolve();
      },
      fail(error) {
        const errorMessage = typeof error?.errMsg === "string" ? error.errMsg : "";
        if (errorMessage.includes("cancel")) {
          reject(
            new CaseResearchPaymentError("Case research payment was cancelled.", {
              code: PAYMENT_CANCELLED_CODE,
            })
          );
          return;
        }
        reject(
          new CaseResearchPaymentError("Case research payment failed.", {
            code: PAYMENT_FAILED_CODE,
          })
        );
      },
    });
  });

const _pollOrderUntilResolved = async (orderNo) => {
  let currentAttempt = 0;

  while (currentAttempt < POLL_MAX_ATTEMPTS) {
    const order = await getCaseResearchOrder(orderNo);
    if (order.status === "paid") {
      return order;
    }
    if (order.status === "failed" || order.status === "closed") {
      throw new CaseResearchPaymentError("Case research payment failed.", {
        code: PAYMENT_FAILED_CODE,
      });
    }

    currentAttempt += 1;
    if (currentAttempt >= POLL_MAX_ATTEMPTS) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new CaseResearchPaymentError("Case research payment result is pending.", {
    code: PAYMENT_RESULT_PENDING_CODE,
  });
};

const purchasePrivateCaseResearch = async (casePayload) => {
  const order = await createCaseResearchOrder(casePayload);
  await _requestWechatPayment(order.payment_params);
  return _pollOrderUntilResolved(order.order_no);
};

const isCaseResearchPaymentCancelled = (error) =>
  error instanceof CaseResearchPaymentError && error.code === PAYMENT_CANCELLED_CODE;

const isCaseResearchPaymentResultPending = (error) =>
  error instanceof CaseResearchPaymentError && error.code === PAYMENT_RESULT_PENDING_CODE;

module.exports = {
  CaseResearchPaymentError,
  createPublicCaseResearchRequest,
  createCaseResearchOrder,
  getCaseResearchOrder,
  fetchUserCaseResearchRequests,
  isCaseResearchPaymentCancelled,
  isCaseResearchPaymentResultPending,
  purchasePrivateCaseResearch,
};
