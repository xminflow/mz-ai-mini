const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const MINE_TEMPLATE_PATH = require.resolve(
  "../../miniprogram/pages/mine/index.wxml"
);
const SUBSCRIBE_TEMPLATE_PATH = require.resolve(
  "../../miniprogram/pages/subscribe/index.wxml"
);
const STORY_DETAIL_TEMPLATE_PATH = require.resolve(
  "../../miniprogram/pages/story-detail/index.wxml"
);

const readTemplate = (filePath) => fs.readFileSync(filePath, "utf8");

test("auth gate templates use the shared hero and body structure", () => {
  const mineTemplate = readTemplate(MINE_TEMPLATE_PATH);
  const subscribeTemplate = readTemplate(SUBSCRIBE_TEMPLATE_PATH);
  const storyDetailTemplate = readTemplate(STORY_DETAIL_TEMPLATE_PATH);

  for (const template of [mineTemplate, subscribeTemplate, storyDetailTemplate]) {
    assert.equal(template.includes('class="auth-gate__hero"'), true);
    assert.equal(template.includes('class="auth-gate__body"'), true);
    assert.equal(template.includes('class="auth-gate__button"'), true);
    assert.equal(template.includes('class="auth-gate__tips"'), false);
    assert.equal(template.includes('class="auth-gate__tip"'), false);
    assert.equal(template.includes('class="auth-gate__point"'), false);
  }

  assert.equal(
    mineTemplate.includes('open-type="chooseAvatar"'),
    true
  );
  assert.equal(mineTemplate.includes('bindinput="handleNicknameInput"'), true);
  assert.equal(subscribeTemplate.includes('class="auth-gate__surface'), false);
  assert.equal(storyDetailTemplate.includes('class="auth-gate__surface'), false);
});
