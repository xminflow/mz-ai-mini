const AUTH_PAGE_STATE = Object.freeze({
  CHECKING: "checking",
  UNAUTHORIZED: "unauthorized",
  READY: "ready",
  ERROR: "error",
});

const isNonEmptyText = (value) =>
  typeof value === "string" && value.trim() !== "";

const hasAuthenticatedMiniProgramUser = (user) =>
  Boolean(
    user &&
      typeof user === "object" &&
      isNonEmptyText(user.openid)
  );

module.exports = {
  AUTH_PAGE_STATE,
  hasAuthenticatedMiniProgramUser,
};
