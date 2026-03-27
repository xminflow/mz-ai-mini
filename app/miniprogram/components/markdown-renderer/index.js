const { parseMarkdownToBlocks } = require("../../utils/markdown");

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

  observers: {
    markdown(markdown) {
      this.setData({
        blocks: parseMarkdownToBlocks(markdown),
      });
    },
  },

  methods: {
    handleLinkTap(event) {
      const { url } = event.currentTarget.dataset;

      if (!url) {
        return;
      }

      wx.setClipboardData({
        data: url,
      });
    },
  },
});
