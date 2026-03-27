Component({
  properties: {
    table: {
      type: Object,
      value: null,
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
