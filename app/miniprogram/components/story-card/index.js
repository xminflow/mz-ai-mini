Component({
  properties: {
    story: {
      type: Object,
      value: null,
    },
  },

  methods: {
    handleTap() {
      const { story } = this.data;

      if (!story || !story.id) {
        return;
      }

      this.triggerEvent("select", {
        id: story.id,
      });
    },
  },
});
