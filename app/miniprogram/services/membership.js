const { request } = require("../core/apiClient");

const MEMBERSHIP_TIER_NORMAL = "normal";
const PAYMENT_SIGN_TYPE_RSA = "RSA";
const POLL_INTERVAL_MS = 1200;
const POLL_MAX_ATTEMPTS = 8;
const PAYMENT_CANCELLED_CODE = "MEMBERSHIP.PAYMENT_CANCELLED";
const PAYMENT_FAILED_CODE = "MEMBERSHIP.PAYMENT_FAILED";
const PAYMENT_RESULT_PENDING_CODE = "MEMBERSHIP.PAYMENT_RESULT_PENDING";

class MembershipPaymentError extends Error {
  constructor(message, { code = "" } = {}) {
    super(message);
    this.name = "MembershipPaymentError";
    this.code = code;
  }
}

const createMembershipOrder = ({ tier }) =>
  request({
    path: "/memberships/wechat-mini-program/orders",
    method: "POST",
    data: {
      tier,
    },
  });

const getMembershipOrder = (orderNo) =>
  request({
    path: `/memberships/wechat-mini-program/orders/${encodeURIComponent(orderNo)}`,
    method: "GET",
  });

const requestWechatPayment = (paymentParams) =>
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
            new MembershipPaymentError("Membership payment was cancelled.", {
              code: PAYMENT_CANCELLED_CODE,
            })
          );
          return;
        }

        reject(
          new MembershipPaymentError("Membership payment failed.", {
            code: PAYMENT_FAILED_CODE,
          })
        );
      },
    });
  });

const pollMembershipOrderUntilResolved = async (orderNo, { intervalMs, maxAttempts }) => {
  let currentAttempt = 0;

  while (currentAttempt < maxAttempts) {
    const order = await getMembershipOrder(orderNo);
    if (order.status === "paid") {
      return order;
    }
    if (order.status === "failed" || order.status === "closed") {
      throw new MembershipPaymentError("Membership payment failed.", {
        code: PAYMENT_FAILED_CODE,
      });
    }

    currentAttempt += 1;
    if (currentAttempt >= maxAttempts) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new MembershipPaymentError("Membership payment result is pending.", {
    code: PAYMENT_RESULT_PENDING_CODE,
  });
};

const purchaseNormalMembership = async () => {
  const order = await createMembershipOrder({
    tier: MEMBERSHIP_TIER_NORMAL,
  });
  await requestWechatPayment(order.payment_params);
  return pollMembershipOrderUntilResolved(order.order_no, {
    intervalMs: POLL_INTERVAL_MS,
    maxAttempts: POLL_MAX_ATTEMPTS,
  });
};

const isMembershipPaymentCancelled = (error) =>
  error instanceof MembershipPaymentError && error.code === PAYMENT_CANCELLED_CODE;

const isMembershipPaymentResultPending = (error) =>
  error instanceof MembershipPaymentError && error.code === PAYMENT_RESULT_PENDING_CODE;

module.exports = {
  MEMBERSHIP_TIER_NORMAL,
  MembershipPaymentError,
  createMembershipOrder,
  getMembershipOrder,
  isMembershipPaymentCancelled,
  isMembershipPaymentResultPending,
  purchaseNormalMembership,
};
