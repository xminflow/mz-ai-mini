const test = require("node:test");
const assert = require("node:assert/strict");

const AUTH_SERVICE_PATH = require.resolve("../../miniprogram/services/auth");
const API_CLIENT_PATH = require.resolve("../../miniprogram/core/apiClient");
const RUNTIME_CONFIG_PATH = require.resolve("../../miniprogram/core/runtime-config");
const LOCAL_RUNTIME_CONFIG_PATH = require.resolve(
  "../../miniprogram/core/runtime-config.local"
);
const RUNTIME_MODE_PATH = require.resolve("../../miniprogram/core/runtime-mode");

const clearAuthModules = () => {
  delete require.cache[AUTH_SERVICE_PATH];
  delete require.cache[API_CLIENT_PATH];
  delete require.cache[RUNTIME_CONFIG_PATH];
  delete require.cache[LOCAL_RUNTIME_CONFIG_PATH];
  delete require.cache[RUNTIME_MODE_PATH];
};

const loadAuthService = ({ localRuntimeConfig = {} } = {}) => {
  clearAuthModules();
  require.cache[LOCAL_RUNTIME_CONFIG_PATH] = {
    id: LOCAL_RUNTIME_CONFIG_PATH,
    filename: LOCAL_RUNTIME_CONFIG_PATH,
    loaded: true,
    exports: localRuntimeConfig,
  };
  return require("../../miniprogram/services/auth");
};

test.afterEach(() => {
  clearAuthModules();
  delete global.wx;
  delete global.getApp;
});

test("syncCurrentMiniProgramUser uses remote backend in develop without local identity headers", async () => {
  const app = {
    globalData: {},
  };
  global.getApp = () => app;
  global.wx = {
    getAccountInfoSync() {
      return {
        miniProgram: {
          envVersion: "develop",
        },
      };
    },
    cloud: {
      async callContainer(options) {
        assert.deepEqual(options.config, {
          env: "rlink-5g3hqx773b8980a1",
        });
        assert.equal(options.path, "/api/v1/auth/wechat-mini-program/users/current");
        assert.equal(options.method, "PUT");
        assert.equal(options.header["X-WX-SERVICE"], "mz-ai");
        assert.equal(options.header["X-WX-OPENID"], undefined);
        assert.equal(options.header["X-WX-APPID"], undefined);

        return {
          statusCode: 200,
          data: {
            code: "COMMON.SUCCESS",
            message: "success",
            data: {
              is_new_user: false,
              user: {
                user_id: "20001",
                openid: "remote-openid",
                union_id: null,
                nickname: "远程用户",
                avatar_url: "https://example.com/remote-avatar.png",
                status: "active",
              },
            },
          },
        };
      },
    },
  };

  const { syncCurrentMiniProgramUser } = loadAuthService({
    localRuntimeConfig: {
      target: "remote",
    },
  });
  const result = await syncCurrentMiniProgramUser();

  assert.equal(result.user.user_id, "20001");
  assert.equal(app.globalData.currentUser.openid, "remote-openid");
});

test("syncCurrentMiniProgramUser uses backend auth endpoint and stores current user", async () => {
  const app = {
    globalData: {},
  };
  global.getApp = () => app;
  global.wx = {
    getAccountInfoSync() {
      return {
        miniProgram: {
          envVersion: "develop",
        },
      };
    },
    request(options) {
      assert.equal(
        options.url,
        "http://127.0.0.1:8000/api/v1/auth/wechat-mini-program/users/current"
      );
      assert.equal(options.method, "PUT");
      assert.equal(options.header["X-WX-APPID"], "wx-local-dev");

      options.success({
        statusCode: 200,
        data: {
          code: "COMMON.SUCCESS",
          message: "success",
          data: {
            is_new_user: true,
            user: {
              user_id: "10001",
              openid: "local-dev-openid",
              union_id: null,
              nickname: null,
              avatar_url: null,
              status: "active",
            },
          },
        },
      });
    },
  };

  const { syncCurrentMiniProgramUser } = loadAuthService();
  const result = await syncCurrentMiniProgramUser();

  assert.equal(result.is_new_user, true);
  assert.equal(result.user.user_id, "10001");
  assert.equal(app.globalData.currentUser.openid, "local-dev-openid");
  assert.equal(app.globalData.currentUserSyncError, null);
});

test("syncCurrentMiniProgramUser keeps app launch currentUserReady promise intact", async () => {
  const currentUserReady = Promise.resolve({
    user: {
      user_id: "launch-user",
    },
  });
  const app = {
    globalData: {
      currentUserReady,
    },
  };
  global.getApp = () => app;
  global.wx = {
    getAccountInfoSync() {
      return {
        miniProgram: {
          envVersion: "develop",
        },
      };
    },
    request(options) {
      options.success({
        statusCode: 200,
        data: {
          code: "COMMON.SUCCESS",
          message: "success",
          data: {
            is_new_user: false,
            user: {
              user_id: "10001",
              openid: "local-dev-openid",
              union_id: null,
              nickname: null,
              avatar_url: null,
              status: "active",
            },
          },
        },
      });
    },
  };

  const { syncCurrentMiniProgramUser } = loadAuthService();
  await syncCurrentMiniProgramUser();

  assert.equal(app.globalData.currentUserReady, currentUserReady);
});

test("updateCurrentMiniProgramUserProfile sends profile to backend and returns updated user", async () => {
  const app = { globalData: {} };
  global.getApp = () => app;
  global.wx = {
    getAccountInfoSync() {
      return { miniProgram: { envVersion: "develop" } };
    },
    request(options) {
      assert.equal(
        options.url,
        "http://127.0.0.1:8000/api/v1/auth/wechat-mini-program/users/current/profile"
      );
      assert.equal(options.method, "PUT");
      assert.deepEqual(options.data, {
        nickname: "妙智学员",
        avatar_url: "cloud://env-id.xxx/avatars/123.jpg",
      });

      options.success({
        statusCode: 200,
        data: {
          code: "COMMON.SUCCESS",
          message: "success",
          data: {
            user: {
              user_id: "10001",
              openid: "local-dev-openid",
              union_id: null,
              nickname: "妙智学员",
              avatar_url: "cloud://env-id.xxx/avatars/123.jpg",
              status: "active",
            },
          },
        },
      });
    },
  };

  const {
    updateCurrentMiniProgramUserProfile,
    hasAuthenticatedMiniProgramUser,
  } = loadAuthService();
  const result = await updateCurrentMiniProgramUserProfile({
    nickname: "妙智学员",
    avatar_url: "cloud://env-id.xxx/avatars/123.jpg",
  });

  assert.equal(result.user.nickname, "妙智学员");
  assert.equal(hasAuthenticatedMiniProgramUser(result.user), true);
});

test("authorizeCurrentMiniProgramUserProfile submits a partial profile patch and stores updated user", async () => {
  const app = { globalData: {} };
  global.getApp = () => app;

  global.wx = {
    getAccountInfoSync() {
      return { miniProgram: { envVersion: "develop" } };
    },
    request(options) {
      assert.equal(
        options.url,
        "http://127.0.0.1:8000/api/v1/auth/wechat-mini-program/users/current/profile"
      );
      assert.deepEqual(options.data, {
        avatar_url: "cloud://env-id.xxx/avatars/authorized.jpg",
      });

      options.success({
        statusCode: 200,
        data: {
          code: "COMMON.SUCCESS",
          message: "success",
          data: {
            user: {
              user_id: "10001",
              openid: "local-dev-openid",
              union_id: null,
              nickname: "妙智学员",
              avatar_url: "cloud://env-id.xxx/avatars/authorized.jpg",
              status: "active",
            },
          },
        },
      });
    },
  };

  const { authorizeCurrentMiniProgramUserProfile } = loadAuthService();
  const result = await authorizeCurrentMiniProgramUserProfile({
    avatar_url: " cloud://env-id.xxx/avatars/authorized.jpg ",
  });

  assert.equal(result.user.nickname, "妙智学员");
  assert.equal(app.globalData.currentUser.nickname, "妙智学员");
  assert.equal(
    app.globalData.currentUser.avatar_url,
    "cloud://env-id.xxx/avatars/authorized.jpg"
  );
});

test("authorizeCurrentMiniProgramUserProfile rejects an empty profile patch", async () => {
  const { authorizeCurrentMiniProgramUserProfile } = loadAuthService();

  await assert.rejects(
    authorizeCurrentMiniProgramUserProfile({}),
    (error) => error.code === "USER_PROFILE_DATA_INVALID"
  );
});

test("isUserProfileAuthorizationDenied identifies auth deny errors", () => {
  const { isUserProfileAuthorizationDenied } = loadAuthService();

  assert.equal(
    isUserProfileAuthorizationDenied({
      errMsg: "getUserProfile:fail auth deny",
    }),
    true
  );
  assert.equal(isUserProfileAuthorizationDenied(new Error("nope")), false);
});
