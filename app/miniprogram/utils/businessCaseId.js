const ROUTE_ID_PREFIX = "case_";

const normalizeId = (value) => String(value || "").trim();

const encodeBusinessCaseRouteId = (value) => {
  const normalizedId = normalizeId(value);

  if (!normalizedId) {
    return "";
  }

  return `${ROUTE_ID_PREFIX}${normalizedId}`;
};

const decodeBusinessCaseRouteId = (value) => {
  const normalizedId = normalizeId(value);

  if (!normalizedId) {
    return "";
  }

  if (!normalizedId.startsWith(ROUTE_ID_PREFIX)) {
    return normalizedId;
  }

  return normalizedId.slice(ROUTE_ID_PREFIX.length);
};

module.exports = {
  decodeBusinessCaseRouteId,
  encodeBusinessCaseRouteId,
};
