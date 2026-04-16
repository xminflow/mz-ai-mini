const { createStoryFeedPage } = require("../story-feed/createPage");

Page(
  createStoryFeedPage({
    contentLabel: "案例",
    emptyDefaultText: "发布第一篇创业案例后，这里会自动形成案例阅读流。",
  })
);
