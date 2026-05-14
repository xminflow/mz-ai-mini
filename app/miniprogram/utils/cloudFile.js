const { request } = require("../core/apiClient")

const isCloudFileId = (value) =>
  typeof value === "string" && value.trim().startsWith("cloud://")

const normalizeCloudFileId = (value) =>
  typeof value === "string" ? value.trim() : ""

const resolveCloudApi = () => {
  if (typeof wx === "undefined" || !wx.cloud) {
    return null
  }

  if (typeof wx.cloud.getTempFileURL !== "function") {
    return null
  }

  return wx.cloud
}

const buildFileIdList = (fileIds = []) => {
  const uniqueFileIds = new Set()
  fileIds.forEach((fileId) => {
    const normalizedFileId = normalizeCloudFileId(fileId)
    if (!isCloudFileId(normalizedFileId)) {
      return
    }
    uniqueFileIds.add(normalizedFileId)
  })
  return Array.from(uniqueFileIds)
}

const buildTempUrlMap = (fileList = []) =>
  fileList.reduce((tempUrlMap, fileItem) => {
    const fileId = normalizeCloudFileId(fileItem.fileID || fileItem.fileId || "")
    const tempFileURL =
      typeof fileItem.tempFileURL === "string"
        ? fileItem.tempFileURL.trim()
        : typeof fileItem.tempFileUrl === "string"
          ? fileItem.tempFileUrl.trim()
          : ""
    const status =
      typeof fileItem.status === "number"
        ? fileItem.status
        : Number(fileItem.status || 0)

    if (!isCloudFileId(fileId) || tempFileURL === "" || status !== 0) {
      return tempUrlMap
    }

    return {
      ...tempUrlMap,
      [fileId]: tempFileURL,
    }
  }, {})

const resolveCloudFileTempUrlMap = async (fileIds = []) => {
  const normalizedFileIds = buildFileIdList(fileIds)
  if (normalizedFileIds.length === 0) {
    return {}
  }

  const cloudApi = resolveCloudApi()
  if (!cloudApi) {
    return {}
  }

  return new Promise((resolve) => {
    cloudApi.getTempFileURL({
      fileList: normalizedFileIds,
      success(response) {
        const fileList = Array.isArray(response?.fileList) ? response.fileList : []
        resolve(buildTempUrlMap(fileList))
      },
      fail(error) {
        console.warn("Failed to resolve cloud file temp URLs.", error)
        resolve({})
      },
    })
  })
}

const _extractFileExt = (filePath) => {
  const name = filePath.split("?")[0]
  const parts = name.split(".")
  return parts.length > 1 ? parts.pop().toLowerCase() : "jpg"
}

const _resolveContentType = (filePath) => {
  const ext = _extractFileExt(filePath)
  if (ext === "png") {
    return "image/png"
  }
  if (ext === "webp") {
    return "image/webp"
  }
  return "image/jpeg"
}

const _readFileAsBase64 = (filePath) =>
  new Promise((resolve, reject) => {
    if (typeof wx === "undefined" || typeof wx.getFileSystemManager !== "function") {
      reject(new Error("File system API is unavailable."))
      return
    }

    wx.getFileSystemManager().readFile({
      filePath,
      encoding: "base64",
      success(response) {
        resolve(typeof response?.data === "string" ? response.data : "")
      },
      fail(error) {
        reject(error)
      },
    })
  })

const uploadFileToCloud = (tempFilePath, cloudPath) =>
  _readFileAsBase64(tempFilePath).then(async (contentBase64) => {
    const result = await request({
      path: "/auth/wechat-mini-program/users/current/avatar",
      method: "POST",
      data: {
        object_key: cloudPath,
        content_type: _resolveContentType(tempFilePath),
        content_base64: contentBase64,
      },
    })
    return result.avatar_url
  })

const generateAvatarCloudPath = (tempFilePath) => {
  const ext = _extractFileExt(tempFilePath)
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  return `avatars/${id}.${ext}`
}

module.exports = {
  isCloudFileId,
  resolveCloudFileTempUrlMap,
  uploadFileToCloud,
  generateAvatarCloudPath,
}
