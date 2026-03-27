const test = require("node:test");
const assert = require("node:assert/strict");

const {
  decodeBusinessCaseRouteId,
  encodeBusinessCaseRouteId,
} = require("../../miniprogram/utils/businessCaseId");

test("encodeBusinessCaseRouteId wraps the business id with a route prefix", () => {
  assert.equal(
    encodeBusinessCaseRouteId("162758122237067264"),
    "case_162758122237067264"
  );
});

test("decodeBusinessCaseRouteId removes the route prefix and preserves the full id", () => {
  assert.equal(
    decodeBusinessCaseRouteId("case_162758122237067264"),
    "162758122237067264"
  );
});

test("decodeBusinessCaseRouteId keeps legacy ids unchanged", () => {
  assert.equal(
    decodeBusinessCaseRouteId("162758122237067264"),
    "162758122237067264"
  );
});
