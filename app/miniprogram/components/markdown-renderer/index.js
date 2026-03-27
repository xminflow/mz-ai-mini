const { parseMarkdownToBlocks } = require("../../utils/markdown")
const {
  isCloudFileId,
  resolveCloudFileTempUrlMap,
} = require("../../utils/cloudFile")

const collectCloudImageFileIds = (blocks = []) =>
  blocks
    .filter((block) => block?.type === "image" && isCloudFileId(block.src))
    .map((block) => block.src)

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

  lifetimes: {
    attached() {
      this._markdownRenderToken = 0
    },
    detached() {
      this._markdownRenderToken = (this._markdownRenderToken || 0) + 1
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

