const {
  buildRequestIdentityHeaders,
  resolveApiBaseUrl,
  REQUEST_TIMEOUT_MS,
} = require("./runtime-config");

const SUCCESS_CODE = "COMMON.SUCCESS";

class ApiClientError extends Error {
  constructor(message, { code = "", statusCode = 0 } = {}) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

const buildQueryString = (query = {}) => {
  const segments = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    );

  if (!segments.length) {
    return "";
  }

  return `?${segments.join("&")}`;
};

const buildUrl = (path, query) =>
  `${resolveApiBaseUrl()}${path}${buildQueryString(query)}`;

const buildHeaders = (headers = {}) => ({
  "content-type": "application/json",
  ...buildRequestIdentityHeaders(),
  ...headers,
});

const request = ({ path, method = "GET", data, query, headers } = {}) =>
  new Promise((resolve, reject) => {
    wx.request({
      url: buildUrl(path, query),
      method,
      data,
      timeout: REQUEST_TIMEOUT_MS,
      header: buildHeaders(headers),
      success(response) {
        const body = response.data || {};
        const message = body.message || `Request failed with status ${response.statusCode}.`;

        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(
            new ApiClientError(message, {
              code: body.code || "",
              statusCode: response.statusCode,
            })
          );
          return;
        }

        if (body.code !== SUCCESS_CODE) {
          reject(
            new ApiClientError(message, {
              code: body.code || "",
              statusCode: response.statusCode,
            })
          );
          return;
        }

        resolve(body.data);
      },
      fail() {
        reject(
          new ApiClientError("Network request failed.", {
            code: "NETWORK_ERROR",
            statusCode: 0,
          })
        );
      },
    });
  });

module.exports = {
  ApiClientError,
  request,
};
