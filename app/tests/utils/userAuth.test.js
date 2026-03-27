const test = require("node:test");
const assert = require("node:assert/strict");

const {
  AUTH_PAGE_STATE,
  hasAuthorizedUserProfile,
} = require("../../miniprogram/utils/userAuth");

test("hasAuthorizedUserProfile returns true only when nickname and avatar_url are both present", () => {
  assert.equal(
    hasAuthorizedUserProfile({
      nickname: "妙智学员",
      avatar_url: "https://example.com/avatar.png",
    }),
    true
  );
  assert.equal(
    hasAuthorizedUserProfile({
      nickname: "妙智学员",
      avatar_url: "",
    }),
    false
  );
  assert.equal(
    hasAuthorizedUserProfile({
      nickname: "",
      avatar_url: "https://example.com/avatar.png",
    }),
    false
  );
  assert.equal(hasAuthorizedUserProfile(null), false);
});

test("AUTH_PAGE_STATE exposes stable authorization state labels", () => {
  assert.deepEqual(AUTH_PAGE_STATE, {
    CHECKING: "checking",
    UNAUTHORIZED: "unauthorized",
    READY: "ready",
    ERROR: "error",
  });
});
