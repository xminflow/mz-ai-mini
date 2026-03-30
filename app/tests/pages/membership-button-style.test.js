const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const MINE_STYLE_PATH = require.resolve("../../miniprogram/pages/mine/index.wxss");
const SUBSCRIBE_STYLE_PATH = require.resolve("../../miniprogram/pages/subscribe/index.wxss");

const readStyle = (filePath) => fs.readFileSync(filePath, "utf8");

test("membership purchase button keeps the shared full-width CTA style", () => {
  const mineStyle = readStyle(MINE_STYLE_PATH);
  const subscribeStyle = readStyle(SUBSCRIBE_STYLE_PATH);

  for (const style of [mineStyle, subscribeStyle]) {
    assert.equal(style.includes(".membership-card__button {"), true);
    assert.equal(style.includes("display: flex;"), true);
    assert.equal(style.includes("align-items: center;"), true);
    assert.equal(style.includes("justify-content: center;"), true);
    assert.equal(style.includes("width: 100%;"), true);
    assert.equal(style.includes("height: 80rpx;"), true);
    assert.equal(style.includes("line-height: 80rpx;"), true);
    assert.equal(style.includes("padding: 0;"), true);
    assert.equal(style.includes("border-radius: 999rpx;"), true);
    assert.equal(style.includes("background: #0B0B0B;"), true);
    assert.equal(style.includes("color: #FFFFFF;"), true);
    assert.equal(style.includes("text-align: center;"), true);
  }
});
