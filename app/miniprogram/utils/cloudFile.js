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

module.exports = {
  isCloudFileId,
  resolveCloudFileTempUrlMap,
}

