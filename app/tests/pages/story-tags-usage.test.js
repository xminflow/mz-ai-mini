const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const STORY_CARD_TEMPLATE_PATH = require.resolve(
  "../../miniprogram/components/story-card/index.wxml"
);
const STORY_CARD_CONFIG_PATH = require.resolve(
  "../../miniprogram/components/story-card/index.json"
);
const STORY_DETAIL_TEMPLATE_PATH = require.resolve(
  "../../miniprogram/pages/story-detail/index.wxml"
);
const STORY_DETAIL_CONFIG_PATH = require.resolve(
  "../../miniprogram/pages/story-detail/index.json"
);

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

test("story card and story detail use the shared story-tags component", () => {
  const storyCardTemplate = fs.readFileSync(STORY_CARD_TEMPLATE_PATH, "utf8");
  const storyDetailTemplate = fs.readFileSync(STORY_DETAIL_TEMPLATE_PATH, "utf8");
  const storyCardConfig = readJson(STORY_CARD_CONFIG_PATH);
  const storyDetailConfig = readJson(STORY_DETAIL_CONFIG_PATH);

  assert.equal(storyCardTemplate.includes("<story-tags"), true);
  assert.equal(storyDetailTemplate.includes("<story-tags"), true);
  assert.equal(storyCardTemplate.includes('class="story-card__tag"'), false);
  assert.equal(storyDetailTemplate.includes('class="detail-article__tag"'), false);
  assert.equal(
    storyCardConfig.usingComponents["story-tags"],
    "/components/story-tags/index"
  );
  assert.equal(
    storyDetailConfig.usingComponents["story-tags"],
    "/components/story-tags/index"
  );
});
