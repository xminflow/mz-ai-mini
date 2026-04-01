const test = require("node:test");
const assert = require("node:assert/strict");

const { parseMarkdownToBlocks } = require("../../miniprogram/utils/markdown");

test("parseMarkdownToBlocks returns empty list for blank content", () => {
  assert.deepEqual(parseMarkdownToBlocks(""), []);
  assert.deepEqual(parseMarkdownToBlocks(" \n\n "), []);
});

test("parseMarkdownToBlocks preserves headings, paragraphs, quotes and lists", () => {
  const blocks = parseMarkdownToBlocks(
    "# 一级标题\n\n正文第一段\n继续同一段\n\n> 引用内容\n\n- 列表一\n- 列表二\n\n1. 步骤一\n2. 步骤二"
  );

  assert.deepEqual(blocks, [
    {
      id: "heading-0",
      type: "heading",
      level: 1,
      inlines: [
        {
          id: "inline-0",
          type: "text",
          text: "一级标题",
        },
      ],
    },
    {
      id: "paragraph-1",
      type: "paragraph",
      inlines: [
        {
          id: "inline-0",
          type: "text",
          text: "正文第一段 继续同一段",
        },
      ],
    },
    {
      id: "quote-2",
      type: "quote",
      inlines: [
        {
          id: "inline-0",
          type: "text",
          text: "引用内容",
        },
      ],
    },
    {
      id: "list-3",
      type: "list",
      items: [
        {
          id: "list-item-0",
          marker: "•",
          inlines: [
            {
              id: "inline-0",
              type: "text",
              text: "列表一",
            },
          ],
        },
        {
          id: "list-item-1",
          marker: "•",
          inlines: [
            {
              id: "inline-0",
              type: "text",
              text: "列表二",
            },
          ],
        },
      ],
    },
    {
      id: "list-4",
      type: "list",
      items: [
        {
          id: "list-item-0",
          marker: "1.",
          inlines: [
            {
              id: "inline-0",
              type: "text",
              text: "步骤一",
            },
          ],
        },
        {
          id: "list-item-1",
          marker: "2.",
          inlines: [
            {
              id: "inline-0",
              type: "text",
              text: "步骤二",
            },
          ],
        },
      ],
    },
  ]);
});

test("parseMarkdownToBlocks parses horizontal rules as independent blocks", () => {
  const blocks = parseMarkdownToBlocks("段落一\n\n---\n\n***\n\n___\n\n- - -");

  assert.deepEqual(blocks, [
    {
      id: "paragraph-0",
      type: "paragraph",
      inlines: [
        {
          id: "inline-0",
          type: "text",
          text: "段落一",
        },
      ],
    },
    {
      id: "horizontal-rule-1",
      type: "horizontal-rule",
    },
    {
      id: "horizontal-rule-2",
      type: "horizontal-rule",
    },
    {
      id: "horizontal-rule-3",
      type: "horizontal-rule",
    },
    {
      id: "horizontal-rule-4",
      type: "horizontal-rule",
    },
  ]);
});

test("parseMarkdownToBlocks parses markdown tables with alignments and rows", () => {
  const blocks = parseMarkdownToBlocks(
    "| 指标 | 2024 | 2025 |\n| :--- | ---: | :---: |\n| 营收 | 1200 万 | 1800 万 |\n| 毛利率 | 35% | **42%** |"
  );

  assert.deepEqual(blocks, [
    {
      id: "table-0",
      type: "table",
      columns: 3,
      header: [
        {
          id: "table-header-cell-0",
          align: "left",
          inlines: [
            {
              id: "inline-0",
              type: "text",
              text: "指标",
            },
          ],
        },
        {
          id: "table-header-cell-1",
          align: "right",
          inlines: [
            {
              id: "inline-0",
              type: "text",
              text: "2024",
            },
          ],
        },
        {
          id: "table-header-cell-2",
          align: "center",
          inlines: [
            {
              id: "inline-0",
              type: "text",
              text: "2025",
            },
          ],
        },
      ],
      rows: [
        {
          id: "table-row-0",
          cells: [
            {
              id: "table-row-0-cell-0",
              align: "left",
              inlines: [
                {
                  id: "inline-0",
                  type: "text",
                  text: "营收",
                },
              ],
            },
            {
              id: "table-row-0-cell-1",
              align: "right",
              inlines: [
                {
                  id: "inline-0",
                  type: "text",
                  text: "1200 万",
                },
              ],
            },
            {
              id: "table-row-0-cell-2",
              align: "center",
              inlines: [
                {
                  id: "inline-0",
                  type: "text",
                  text: "1800 万",
                },
              ],
            },
          ],
        },
        {
          id: "table-row-1",
          cells: [
            {
              id: "table-row-1-cell-0",
              align: "left",
              inlines: [
                {
                  id: "inline-0",
                  type: "text",
                  text: "毛利率",
                },
              ],
            },
            {
              id: "table-row-1-cell-1",
              align: "right",
              inlines: [
                {
                  id: "inline-0",
                  type: "text",
                  text: "35%",
                },
              ],
            },
            {
              id: "table-row-1-cell-2",
              align: "center",
              inlines: [
                {
                  id: "inline-0",
                  type: "strong",
                  text: "42%",
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
});

test("parseMarkdownToBlocks parses inline strong emphasis code and links", () => {
  const blocks = parseMarkdownToBlocks(
    "包含 **加粗**、*强调*、`行内代码` 和 [外部链接](https://example.com)"
  );

  assert.deepEqual(blocks, [
    {
      id: "paragraph-0",
      type: "paragraph",
      inlines: [
        {
          id: "inline-0",
          type: "text",
          text: "包含 ",
        },
        {
          id: "inline-1",
          type: "strong",
          text: "加粗",
        },
        {
          id: "inline-2",
          type: "text",
          text: "、",
        },
        {
          id: "inline-3",
          type: "emphasis",
          text: "强调",
        },
        {
          id: "inline-4",
          type: "text",
          text: "、",
        },
        {
          id: "inline-5",
          type: "inline-code",
          text: "行内代码",
        },
        {
          id: "inline-6",
          type: "text",
          text: " 和 ",
        },
        {
          id: "inline-7",
          type: "link",
          text: "外部链接",
          url: "https://example.com",
        },
      ],
    },
  ]);
});

test("parseMarkdownToBlocks parses standalone image blocks", () => {
  const blocks = parseMarkdownToBlocks("![案例配图](https://example.com/case.png)");

  assert.deepEqual(blocks, [
    {
      id: "image-0",
      type: "image",
      alt: "案例配图",
      src: "https://example.com/case.png",
    },
  ]);
});

test("parseMarkdownToBlocks keeps fenced code syntax as plain paragraph text", () => {
  const blocks = parseMarkdownToBlocks("```\nconst value = 1;\n```");

  assert.deepEqual(blocks, [
    {
      id: "paragraph-0",
      type: "paragraph",
      inlines: [
        {
          id: "inline-0",
          type: "text",
          text: "``` const value = 1; ```",
        },
      ],
    },
  ]);
});

test("parseMarkdownToBlocks hides inline footnote markers and appends footnotes in first reference order", () => {
  const blocks = parseMarkdownToBlocks(
    "## 标题[^h]\n\n正文[^1]继续。\n\n- 列表项[^2]\n\n> 引用[^3]\n\n| 列[^4] | 值 |\n| --- | --- |\n| 数据[^1] | [链接](https://example.com) |\n\n[^4]: 第四条\n[^1]: 第一条**脚注**\n[^h]: 标题脚注\n[^3]: 第三条\n[^2]: 第二条"
  );

  assert.deepEqual(
    blocks.map((block) => block.type),
    ["heading", "paragraph", "list", "quote", "table", "footnotes"]
  );
  assert.deepEqual(blocks[0].inlines, [
    {
      id: "inline-0",
      type: "text",
      text: "标题",
    },
  ]);
  assert.deepEqual(blocks[1].inlines, [
    {
      id: "inline-0",
      type: "text",
      text: "正文继续。",
    },
  ]);
  assert.deepEqual(blocks[2].items[0].inlines, [
    {
      id: "inline-0",
      type: "text",
      text: "列表项",
    },
  ]);
  assert.deepEqual(blocks[3].inlines, [
    {
      id: "inline-0",
      type: "text",
      text: "引用",
    },
  ]);
  assert.deepEqual(blocks[4].header[0].inlines, [
    {
      id: "inline-0",
      type: "text",
      text: "列",
    },
  ]);
  assert.deepEqual(blocks[4].rows[0].cells[0].inlines, [
    {
      id: "inline-0",
      type: "text",
      text: "数据",
    },
  ]);
  assert.deepEqual(blocks[5], {
    id: "footnotes-5",
    type: "footnotes",
    items: [
      {
        id: "footnote-item-0",
        label: "h",
        marker: "h.",
        inlines: [
          {
            id: "inline-0",
            type: "text",
            text: "标题脚注",
          },
        ],
      },
      {
        id: "footnote-item-1",
        label: "1",
        marker: "1.",
        inlines: [
          {
            id: "inline-0",
            type: "text",
            text: "第一条",
          },
          {
            id: "inline-1",
            type: "strong",
            text: "脚注",
          },
        ],
      },
      {
        id: "footnote-item-2",
        label: "2",
        marker: "2.",
        inlines: [
          {
            id: "inline-0",
            type: "text",
            text: "第二条",
          },
        ],
      },
      {
        id: "footnote-item-3",
        label: "3",
        marker: "3.",
        inlines: [
          {
            id: "inline-0",
            type: "text",
            text: "第三条",
          },
        ],
      },
      {
        id: "footnote-item-4",
        label: "4",
        marker: "4.",
        inlines: [
          {
            id: "inline-0",
            type: "text",
            text: "第四条",
          },
        ],
      },
    ],
  });
});

test("parseMarkdownToBlocks throws when a footnote reference is missing", () => {
  assert.throws(
    () => parseMarkdownToBlocks("正文[^9]"),
    /Markdown footnote reference "9" is not defined\./
  );
});

test("parseMarkdownToBlocks throws when a footnote definition is duplicated", () => {
  assert.throws(
    () => parseMarkdownToBlocks("[^1]: 第一条\n[^1]: 第二条"),
    /Markdown footnote definition "1" is duplicated\./
  );
});
