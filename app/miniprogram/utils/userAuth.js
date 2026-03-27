const AUTH_PAGE_STATE = Object.freeze({
  CHECKING: "checking",
  UNAUTHORIZED: "unauthorized",
  READY: "ready",
  ERROR: "error",
});

const isNonEmptyText = (value) =>
  typeof value === "string" && value.trim() !== "";

const hasAuthorizedUserProfile = (user) =>
  Boolean(
    user &&
      typeof user === "object" &&
      isNonEmptyText(user.nickname) &&
      isNonEmptyText(user.avatar_url)
  );

module.exports = {
  AUTH_PAGE_STATE,
  hasAuthorizedUserProfile,
};
