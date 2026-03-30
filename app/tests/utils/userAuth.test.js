const test = require("node:test");
const assert = require("node:assert/strict");

const {
  AUTH_PAGE_STATE,
  hasAuthenticatedMiniProgramUser,
} = require("../../miniprogram/utils/userAuth");

test("hasAuthenticatedMiniProgramUser returns true when openid is present", () => {
  assert.equal(
    hasAuthenticatedMiniProgramUser({
      openid: "wechat-openid",
      nickname: "",
      avatar_url: "",
    }),
    true
  );
  assert.equal(
    hasAuthenticatedMiniProgramUser({
      openid: "",
      nickname: "妙智学员",
    }),
    false
  );
  assert.equal(
    hasAuthenticatedMiniProgramUser({
      openid: "wechat-openid",
      nickname: "",
      avatar_url: "",
    }),
    true
  );
  assert.equal(
    hasAuthenticatedMiniProgramUser({
      openid: "   ",
    }),
    false
  );
  assert.equal(hasAuthenticatedMiniProgramUser(null), false);
});

test("AUTH_PAGE_STATE exposes stable authorization state labels", () => {
  assert.deepEqual(AUTH_PAGE_STATE, {
    CHECKING: "checking",
    UNAUTHORIZED: "unauthorized",
    READY: "ready",
    ERROR: "error",
  });
});
