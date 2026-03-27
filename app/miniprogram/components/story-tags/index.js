Component({
  properties: {
    size: {
      type: String,
      value: "md",
    },
    tags: {
      type: Array,
      value: [],
    },
  },

  data: {
    normalizedTags: [],
  },

  observers: {
    tags(tags) {
      const normalizedTags = Array.isArray(tags)
        ? tags
            .filter((tag) => typeof tag === "string" && tag.trim())
            .map((tag) => tag.trim())
        : [];

      this.setData({
        normalizedTags,
      });
    },
  },
});
