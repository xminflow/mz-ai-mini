const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const MARKDOWN_RENDERER_TEMPLATE_PATH = require.resolve(
  "../../miniprogram/components/markdown-renderer/index.wxml"
);

test("markdown renderer wraps inline segments in a shared text flow container", () => {
  const template = fs.readFileSync(MARKDOWN_RENDERER_TEMPLATE_PATH, "utf8");

  assert.equal(template.includes('class="markdown-renderer__text-flow"'), true);
  assert.equal(template.includes('<template name="markdown-inline"><block'), true);
  assert.equal(template.includes('<text class="markdown-renderer__text-flow"><template is="markdown-inline"'), true);
  assert.equal(template.includes('<text class="markdown-renderer__text-flow">\n'), false);
  assert.equal(template.includes('<text class="markdown-renderer__text-flow">\r\n'), false);
});

test("markdown renderer renders list marker and content inside one text flow", () => {
  const template = fs.readFileSync(MARKDOWN_RENDERER_TEMPLATE_PATH, "utf8");

  assert.equal(template.includes('class="markdown-renderer__list-text"'), true);
  assert.equal(template.includes('<text class="markdown-renderer__list-text"><text class="markdown-renderer__list-marker">'), true);
  assert.equal(template.includes('class="markdown-renderer__list-marker">{{listItem.marker}} </text>'), true);
  assert.equal(template.includes('<text class="markdown-renderer__list-text">\n'), false);
  assert.equal(template.includes('<text class="markdown-renderer__list-text">\r\n'), false);
  assert.equal(template.includes('class="markdown-renderer__list-content"'), false);
});

test("markdown renderer supports horizontal rule blocks", () => {
  const template = fs.readFileSync(MARKDOWN_RENDERER_TEMPLATE_PATH, "utf8");

  assert.equal(template.includes("block.type === 'horizontal-rule'"), true);
  assert.equal(template.includes('class="markdown-renderer__horizontal-rule"'), true);
});

test("markdown renderer delegates table blocks to markdown table component", () => {
  const template = fs.readFileSync(MARKDOWN_RENDERER_TEMPLATE_PATH, "utf8");

  assert.equal(template.includes("block.type === 'table'"), true);
  assert.equal(template.includes("<markdown-table"), true);
});

test("markdown renderer renders footnotes in a dedicated footer section", () => {
  const template = fs.readFileSync(MARKDOWN_RENDERER_TEMPLATE_PATH, "utf8");

  assert.equal(template.includes("block.type === 'footnotes'"), true);
  assert.equal(template.includes('class="markdown-renderer__footnotes-title"'), false);
  assert.equal(template.includes('class="markdown-renderer__footnote-marker">{{footnote.marker}} </text>'), true);
  assert.equal(
    template.includes('<template is="markdown-inline" data="{{inlines: footnote.inlines}}" />'),
    true
  );
});
