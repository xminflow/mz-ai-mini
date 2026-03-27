const test = require("node:test")
const assert = require("node:assert/strict")

const {
  isCloudFileId,
  resolveCloudFileTempUrlMap,
} = require("../../miniprogram/utils/cloudFile")

test.afterEach(() => {
  delete global.wx
})

test("isCloudFileId returns true only for cloud file ids", () => {
  assert.equal(isCloudFileId("cloud://demo-env.bucket/path/image.png"), true)
  assert.equal(isCloudFileId("https://example.com/image.png"), false)
  assert.equal(isCloudFileId(""), false)
})

test("resolveCloudFileTempUrlMap returns empty map when cloud api is unavailable", async () => {
  const result = await resolveCloudFileTempUrlMap([
    "cloud://demo-env.bucket/path/image.png",
  ])

  assert.deepEqual(result, {})
})

test("resolveCloudFileTempUrlMap converts cloud file ids to temp urls", async () => {
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

