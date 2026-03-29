const {
  buildRequestIdentityHeaders,
  REQUEST_TRANSPORT_CONTAINER,
  REQUEST_TRANSPORT_HTTP,
  resolveRequestTransport,
  REQUEST_TIMEOUT_MS,
} = require("./runtime-config");

const SUCCESS_CODE = "COMMON.SUCCESS";

class ApiClientError extends Error {
  constructor(message, { code = "", statusCode = 0, cause = null, details = null } = {}) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.statusCode = statusCode;
    this.cause = cause;
    this.details = details;
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
  `${resolveRequestTransport().apiBaseUrl}${path}${buildQueryString(query)}`;

const buildContainerPath = (requestTransport, path, query) =>
  `${requestTransport.pathPrefix}${path}${buildQueryString(query)}`;

const buildHeaders = (headers = {}) => ({
  "content-type": "application/json",
  ...buildRequestIdentityHeaders(),
  ...headers,
});

const buildContainerHeaders = (requestTransport, headers = {}) => ({
  ...buildHeaders(headers),
  "X-WX-SERVICE": requestTransport.serviceName,
});

const resolveErrorMessage = (error, fallbackMessage) => {
  if (typeof error?.errMsg === "string" && error.errMsg.trim() !== "") {
    return error.errMsg.trim();
  }

  if (typeof error?.message === "string" && error.message.trim() !== "") {
    return error.message.trim();
  }

  return fallbackMessage;
};

const resolveErrorCode = (error, fallbackCode) => {
  if (typeof error?.code === "string" && error.code.trim() !== "") {
    return error.code.trim();
  }

  if (
    typeof error?.errCode === "string" ||
    typeof error?.errCode === "number"
  ) {
    return String(error.errCode);
  }

  return fallbackCode;
};

const resolveErrorStatusCode = (error) =>
  typeof error?.statusCode === "number" ? error.statusCode : 0;

const handleResponse = (response, reject, resolve) => {
  const body = response?.data || {};
  const statusCode =
    typeof response?.statusCode === "number" ? response.statusCode : 0;
  const message = body.message || `Request failed with status ${statusCode}.`;

  if (statusCode < 200 || statusCode >= 300) {
    reject(
      new ApiClientError(message, {
        code: body.code || "",
        statusCode,
      })
    );
    return;
  }

  if (body.code !== SUCCESS_CODE) {
    reject(
      new ApiClientError(message, {
        code: body.code || "",
        statusCode,
      })
    );
    return;
  }

  resolve(body.data);
};

const requestThroughHttp = ({ path, method, data, query, headers } = {}) =>
  new Promise((resolve, reject) => {
    wx.request({
      url: buildUrl(path, query),
      method,
      data,
      timeout: REQUEST_TIMEOUT_MS,
      header: buildHeaders(headers),
      success(response) {
        handleResponse(response, reject, resolve);
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

const requestThroughContainer = async ({
  requestTransport,
  path,
  method,
  data,
  query,
  headers,
} = {}) => {
  if (
    typeof wx === "undefined" ||
    !wx.cloud ||
    typeof wx.cloud.callContainer !== "function"
  ) {
    throw new ApiClientError("wx.cloud.callContainer is unavailable.", {
      code: "CONTAINER_API_UNAVAILABLE",
      statusCode: 0,
    });
  }

  const requestPath = buildContainerPath(requestTransport, path, query);

  try {
    const response = await wx.cloud.callContainer({
      config: {
        env: requestTransport.envId,
      },
      path: requestPath,
      method,
      header: buildContainerHeaders(requestTransport, headers),
      data,
    });

    return await new Promise((resolve, reject) => {
      handleResponse(response, reject, resolve);
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    const requestDetails = {
      envId: requestTransport.envId,
      serviceName: requestTransport.serviceName,
      path: requestPath,
      method,
    };

    console.warn("Container request failed.", {
      ...requestDetails,
      error,
    });

    throw new ApiClientError(
      resolveErrorMessage(error, "Container request failed."),
      {
        code: resolveErrorCode(error, "CONTAINER_NETWORK_ERROR"),
        statusCode: resolveErrorStatusCode(error),
        cause: error,
        details: requestDetails,
      }
    );
  }
};

const request = async ({ path, method = "GET", data, query, headers } = {}) => {
  const requestTransport = resolveRequestTransport();

  if (requestTransport.type === REQUEST_TRANSPORT_HTTP) {
    return requestThroughHttp({
      path,
      method,
      data,
      query,
      headers,
    });
  }

  if (requestTransport.type === REQUEST_TRANSPORT_CONTAINER) {
    return requestThroughContainer({
      requestTransport,
      path,
      method,
      data,
      query,
      headers,
    });
  }

  throw new ApiClientError("Unsupported request transport.", {
    code: "UNSUPPORTED_TRANSPORT",
    statusCode: 0,
  });
};

module.exports = {
  ApiClientError,
  request,
};
