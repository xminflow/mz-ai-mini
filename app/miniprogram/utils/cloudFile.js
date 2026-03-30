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
        console.warn("Failed to resolve CloudBase temp file URLs.", error)
        resolve({})
      },
    })
  })
}

const _resolveUploadApi = () => {
  if (typeof wx === "undefined" || !wx.cloud) {
    return null
  }
  if (typeof wx.cloud.uploadFile !== "function") {
    return null
  }
  return wx.cloud
}

const _extractFileExt = (filePath) => {
  const name = filePath.split("?")[0]
  const parts = name.split(".")
  return parts.length > 1 ? parts.pop().toLowerCase() : "jpg"
}

const uploadFileToCloud = (tempFilePath, cloudPath) =>
  new Promise((resolve, reject) => {
    const cloudApi = _resolveUploadApi()
    if (!cloudApi) {
      reject(new Error("CloudBase upload API is unavailable."))
      return
    }

    cloudApi.uploadFile({
      cloudPath,
      filePath: tempFilePath,
      success(response) {
        resolve(response.fileID)
      },
      fail(error) {
        reject(error)
      },
    })
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

