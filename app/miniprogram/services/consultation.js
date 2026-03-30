const { request } = require("../core/apiClient");

const createConsultationRequest = (payload) =>
  request({
    path: "/consultations/wechat-mini-program/requests",
    method: "POST",
    data: payload,
  });

module.exports = {
  createConsultationRequest,
};
