const { parseMarkdownToBlocks } = require("../../utils/markdown")
const {
  isCloudFileId,
  resolveCloudFileTempUrlMap,
} = require("../../utils/cloudFile")

const DOUBLE_TAP_INTERVAL_MS = 320

const collectCloudImageFileIds = (blocks = []) =>
  blocks
    .filter((block) => block?.type === "image" && isCloudFileId(block.src))
    .map((block) => block.src)

const collectImagePreviewUrls = (blocks = []) =>
  blocks
    .filter((block) => block?.type === "image" && typeof block.src === "string")
    .map((block) => block.src.trim())
    .filter((src) => src !== "")

const rewriteImageBlockSources = (blocks = [], tempUrlMap = {}) =>
  blocks.map((block) => {
    if (block?.type !== "image" || !isCloudFileId(block.src)) {
      return block
    }

    const resolvedSource = tempUrlMap[block.src]
    if (typeof resolvedSource !== "string" || resolvedSource.trim() === "") {
      return block
    }

    return {
      ...block,
      src: resolvedSource,
    }
  })

const isDoubleTapOnSameImage = (tapState, source, currentTapTimestamp) => {
  if (!tapState || tapState.source !== source) {
    return false
  }

  const delta = currentTapTimestamp - tapState.timestamp
  return delta > 0 && delta <= DOUBLE_TAP_INTERVAL_MS
}

Component({
  properties: {
    markdown: {
      type: String,
      value: "",
    },
  },

  data: {
    blocks: [],
  },

  created() {
    this._markdownRenderToken = 0
    this._imageTapState = {
      source: "",
      timestamp: 0,
    }
  },

  lifetimes: {
    detached() {
      this._markdownRenderToken = (this._markdownRenderToken || 0) + 1
      this._imageTapState = {
        source: "",
        timestamp: 0,
      }
    },
  },

  observers: {
    markdown(markdown) {
      this.updateMarkdownBlocks(markdown)
    },
  },

  methods: {
    async updateMarkdownBlocks(markdown) {
      const token = (this._markdownRenderToken || 0) + 1
      this._markdownRenderToken = token

      const blocks = parseMarkdownToBlocks(markdown)
      const cloudImageFileIds = collectCloudImageFileIds(blocks)

      if (cloudImageFileIds.length === 0) {
        if (this._markdownRenderToken === token) {
          this.setData({ blocks })
        }
        return
      }

      const tempUrlMap = await resolveCloudFileTempUrlMap(cloudImageFileIds)
      if (this._markdownRenderToken !== token) {
        return
      }

      this.setData({
        blocks: rewriteImageBlockSources(blocks, tempUrlMap),
      })
    },

    handleImageTap(event) {
      const { src } = event.currentTarget.dataset
      if (typeof src !== "string" || src.trim() === "") {
        return
      }

      const source = src.trim()
      const currentTapTimestamp = Date.now()
      if (isDoubleTapOnSameImage(this._imageTapState, source, currentTapTimestamp)) {
        this._imageTapState = {
          source: "",
          timestamp: 0,
        }

        const urls = collectImagePreviewUrls(this.data.blocks)
        if (urls.length === 0) {
          return
        }

        wx.previewImage({
          current: source,
          urls,
        })
        return
      }

      this._imageTapState = {
        source,
        timestamp: currentTapTimestamp,
      }
    },

    handleLinkTap(event) {
      const { url } = event.currentTarget.dataset

      if (!url) {
        return
      }

      wx.setClipboardData({
        data: url,
      })
    },
  },
})
