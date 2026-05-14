const test = require("node:test")
const assert = require("node:assert/strict")

const API_CLIENT_PATH = require.resolve("../../miniprogram/core/apiClient")
const CLOUD_FILE_PATH = require.resolve("../../miniprogram/utils/cloudFile")

const loadCloudFile = ({ request } = {}) => {
  delete require.cache[API_CLIENT_PATH]
  delete require.cache[CLOUD_FILE_PATH]
  require.cache[API_CLIENT_PATH] = {
    exports: {
      request: request || (async () => ({})),
    },
  }
  return require("../../miniprogram/utils/cloudFile")
}

test.afterEach(() => {
  delete global.wx
  delete require.cache[API_CLIENT_PATH]
  delete require.cache[CLOUD_FILE_PATH]
})

test("isCloudFileId returns true only for cloud file ids", () => {
  const { isCloudFileId } = loadCloudFile()

  assert.equal(isCloudFileId("cloud://demo-env.bucket/path/image.png"), true)
  assert.equal(isCloudFileId("https://example.com/image.png"), false)
  assert.equal(isCloudFileId(""), false)
})

test("resolveCloudFileTempUrlMap returns empty map when cloud api is unavailable", async () => {
  const { resolveCloudFileTempUrlMap } = loadCloudFile()

  const result = await resolveCloudFileTempUrlMap([
    "cloud://demo-env.bucket/path/image.png",
  ])

  assert.deepEqual(result, {})
})

test("resolveCloudFileTempUrlMap converts cloud file ids to temp urls", async () => {
  const { resolveCloudFileTempUrlMap } = loadCloudFile()

  global.wx = {
    cloud: {
      getTempFileURL(options) {
        assert.deepEqual(options.fileList, [
          "cloud://demo-env.bucket/path/image-a.png",
          "cloud://demo-env.bucket/path/image-b.png",
        ])
        options.success({
          fileList: [
            {
              fileID: "cloud://demo-env.bucket/path/image-a.png",
              status: 0,
              tempFileURL: "https://temp.example.com/image-a.png",
            },
            {
              fileId: "cloud://demo-env.bucket/path/image-b.png",
              status: 0,
              tempFileUrl: "https://temp.example.com/image-b.png",
            },
          ],
        })
      },
    },
  }

  const result = await resolveCloudFileTempUrlMap([
    "cloud://demo-env.bucket/path/image-a.png",
    "cloud://demo-env.bucket/path/image-a.png",
    "cloud://demo-env.bucket/path/image-b.png",
  ])

  assert.deepEqual(result, {
    "cloud://demo-env.bucket/path/image-a.png":
      "https://temp.example.com/image-a.png",
    "cloud://demo-env.bucket/path/image-b.png":
      "https://temp.example.com/image-b.png",
  })
})

test("resolveCloudFileTempUrlMap ignores failed cloud file entries", async () => {
  const { resolveCloudFileTempUrlMap } = loadCloudFile()

  global.wx = {
    cloud: {
      getTempFileURL(options) {
        options.success({
          fileList: [
            {
              fileID: "cloud://demo-env.bucket/path/image-a.png",
              status: -1,
              tempFileURL: "",
            },
            {
              fileID: "cloud://demo-env.bucket/path/image-b.png",
              status: 0,
              tempFileURL: "https://temp.example.com/image-b.png",
            },
          ],
        })
      },
    },
  }

  const result = await resolveCloudFileTempUrlMap([
    "cloud://demo-env.bucket/path/image-a.png",
    "cloud://demo-env.bucket/path/image-b.png",
  ])

  assert.deepEqual(result, {
    "cloud://demo-env.bucket/path/image-b.png":
      "https://temp.example.com/image-b.png",
  })
})

test("uploadFileToCloud uploads temp file through backend COS endpoint", async () => {
  const requests = []
  const { uploadFileToCloud } = loadCloudFile({
    async request(options) {
      requests.push(options)
      return {
        avatar_url: "https://weelume-pro.example.com/avatars/demo-avatar.png",
      }
    },
  })

  global.wx = {
    getFileSystemManager() {
      return {
        readFile(options) {
          assert.equal(options.filePath, "http://tmp/demo-avatar.png")
          assert.equal(options.encoding, "base64")
          options.success({ data: "cG5n" })
        },
      }
    },
  }

  const result = await uploadFileToCloud(
    "http://tmp/demo-avatar.png",
    "avatars/demo-avatar.png"
  )

  assert.equal(result, "https://weelume-pro.example.com/avatars/demo-avatar.png")
  assert.deepEqual(requests, [
    {
      path: "/auth/wechat-mini-program/users/current/avatar",
      method: "POST",
      data: {
        object_key: "avatars/demo-avatar.png",
        content_type: "image/png",
        content_base64: "cG5n",
      },
    },
  ])
})

test("generateAvatarCloudPath preserves file extension", () => {
  const { generateAvatarCloudPath } = loadCloudFile()
  const cloudPath = generateAvatarCloudPath("http://tmp/demo-avatar.png?foo=1")

  assert.match(cloudPath, /^avatars\/[0-9]+_[a-z0-9]{7}\.png$/)
})
