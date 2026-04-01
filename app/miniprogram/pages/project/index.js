const { createStoryFeedPage } = require("../story-feed/createPage");

Page(
  createStoryFeedPage({
    storyType: "project",
    contentLabel: "项目",
    emptyDefaultText: "发布第一个项目后，这里会自动形成项目展示流。",
  })
);
