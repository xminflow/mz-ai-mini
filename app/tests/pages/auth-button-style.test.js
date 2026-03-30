const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const APP_STYLE_PATH = require.resolve("../../miniprogram/app.wxss");

test("auth gate button keeps the shared full-width CTA style", () => {
  const style = fs.readFileSync(APP_STYLE_PATH, "utf8");

  assert.equal(style.includes(".auth-gate__button {"), true);
  assert.equal(style.includes("display: flex;"), true);
  assert.equal(style.includes("align-items: center;"), true);
  assert.equal(style.includes("justify-content: center;"), true);
  assert.equal(style.includes("width: 100%;"), true);
  assert.equal(style.includes("height: 88rpx;"), true);
  assert.equal(style.includes("line-height: 88rpx;"), true);
  assert.equal(style.includes("padding: 0;"), true);
  assert.equal(style.includes("border-radius: 999rpx;"), true);
  assert.equal(style.includes("text-align: center;"), true);
});

test("auth gate and feedback cards keep the same base card language as the home page", () => {
  const style = fs.readFileSync(APP_STYLE_PATH, "utf8");

  assert.equal(style.includes(".auth-gate,"), true);
  assert.equal(style.includes(".feedback-panel {"), true);
  assert.equal(style.includes("border-radius: 10rpx;"), true);
  assert.equal(style.includes("box-shadow: 0 14rpx 30rpx rgba(11, 11, 11, 0.05);"), true);
  assert.equal(style.includes(".auth-gate::before,"), true);
  assert.equal(style.includes("display: none;"), true);
});
