const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const MARKDOWN_TABLE_TEMPLATE_PATH = require.resolve(
  "../../miniprogram/components/markdown-table/index.wxml"
);
const MARKDOWN_RENDERER_CONFIG_PATH = require.resolve(
  "../../miniprogram/components/markdown-renderer/index.json"
);

test("markdown table uses horizontal scroll and inline cell rendering", () => {
  const template = fs.readFileSync(MARKDOWN_TABLE_TEMPLATE_PATH, "utf8");
  const markdownRendererConfig = JSON.parse(
    fs.readFileSync(MARKDOWN_RENDERER_CONFIG_PATH, "utf8")
  );

  assert.equal(template.includes('<scroll-view class="markdown-table__viewport" scroll-x="true"'), true);
  assert.equal(
    template.includes('class="markdown-table__surface" style="min-width: {{table.columns * 232}}rpx;"'),
    true
  );
  assert.equal(template.includes('class="markdown-table__hint"'), true);
  assert.equal(template.includes('<template name="markdown-table-inline"><block'), true);
  assert.equal(
    markdownRendererConfig.usingComponents["markdown-table"],
    "/components/markdown-table/index"
  );
});
