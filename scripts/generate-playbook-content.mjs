import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const websiteRoot = path.join(repoRoot, "website");
const playbookRoot = path.join(websiteRoot, "src", "app", "(playbook)", "playbook");
const outputRoot = path.join(repoRoot, "content", "playbook");

const tsModuleUrl = pathToFileURL(
  path.join(websiteRoot, "node_modules", "typescript", "lib", "typescript.js"),
).href;
const ts = await import(tsModuleUrl);

const pageSpecs = [
  {
    slug: "preface",
    source: path.join(playbookRoot, "preface", "page.tsx"),
    directory: "00-序言",
    filename: "01-写在前面.md",
    heading: "序言 · 写在前面",
  },
  {
    slug: "foundations",
    source: path.join(playbookRoot, "foundations", "page.tsx"),
    directory: "01-底层逻辑",
    filename: "01-底层逻辑.md",
    heading: "第一篇 · 底层逻辑",
  },
  {
    slug: "positioning",
    source: path.join(playbookRoot, "positioning", "page.tsx"),
    directory: "02-定位",
    filename: "01-定位.md",
    heading: "第二篇 · 定位",
  },
  {
    slug: "topics",
    source: path.join(playbookRoot, "topics", "page.tsx"),
    directory: "03-选题与素材库",
    filename: "01-选题与素材库.md",
    heading: "第三篇 · 选题与素材库",
  },
  {
    slug: "copywriting",
    source: path.join(playbookRoot, "copywriting", "page.tsx"),
    directory: "04-文案与通用结构",
    filename: "01-文案与通用结构.md",
    heading: "第四篇 · 上 · 文案与通用结构",
  },
  {
    slug: "scripts",
    source: path.join(playbookRoot, "scripts", "page.tsx"),
    directory: "05-四型脚本",
    filename: "01-四型脚本.md",
    heading: "第四篇 · 下 · 四型脚本",
  },
  {
    slug: "craft",
    source: path.join(playbookRoot, "craft", "page.tsx"),
    directory: "06-拍摄剪辑表现力",
    filename: "01-拍摄剪辑表现力.md",
    heading: "第五篇 · 拍摄 · 剪辑 · 表现力",
  },
  {
    slug: "growth",
    source: path.join(playbookRoot, "growth", "page.tsx"),
    directory: "07-增长算法投放",
    filename: "01-增长算法投放.md",
    heading: "第六篇 · 增长 · 算法 · 投放",
  },
  {
    slug: "monetization",
    source: path.join(playbookRoot, "monetization", "page.tsx"),
    directory: "08-变现与商业模式",
    filename: "01-变现与商业模式.md",
    heading: "第七篇 · 变现与商业模式",
  },
];

function decodeEntities(value) {
  return value
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function normalizeText(value) {
  return decodeEntities(value).replace(/\r\n?/g, "\n");
}

function collapseInlineWhitespace(value) {
  return value
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\u00a0/g, " ");
}

function trimBlock(value) {
  return collapseInlineWhitespace(value).replace(/\n{3,}/g, "\n\n").trim();
}

function isWhitespaceOnlyJsxText(node) {
  return node.kind === ts.SyntaxKind.JsxText && node.getText().trim().length === 0;
}

function findVariableDeclaration(sourceFile, name) {
  let found = null;
  function visit(node) {
    if (found !== null) return;
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name
    ) {
      found = node;
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return found;
}

function extractReturnedJsx(initializer) {
  if (ts.isArrowFunction(initializer)) {
    if (ts.isParenthesizedExpression(initializer.body)) {
      return initializer.body.expression;
    }
    if (ts.isJsxElement(initializer.body) || ts.isJsxSelfClosingElement(initializer.body)) {
      return initializer.body;
    }
    if (ts.isBlock(initializer.body)) {
      for (const statement of initializer.body.statements) {
        if (ts.isReturnStatement(statement) && statement.expression) {
          if (ts.isParenthesizedExpression(statement.expression)) {
            return statement.expression.expression;
          }
          return statement.expression;
        }
      }
    }
  }
  return null;
}

function getOpeningElement(node) {
  if (ts.isJsxElement(node)) return node.openingElement;
  if (ts.isJsxSelfClosingElement(node)) return node;
  return null;
}

function getTagName(node) {
  const opening = getOpeningElement(node);
  if (opening === null) return null;
  return opening.tagName.getText();
}

function getJsxChildren(node) {
  if (ts.isJsxElement(node)) return [...node.children];
  if (ts.isJsxFragment(node)) return [...node.children];
  return [];
}

function getAttribute(node, name) {
  const opening = getOpeningElement(node);
  if (opening === null) return undefined;
  for (const prop of opening.attributes.properties) {
    if (
      ts.isJsxAttribute(prop) &&
      prop.name.getText() === name &&
      prop.initializer !== undefined
    ) {
      return prop.initializer;
    }
  }
  return undefined;
}

function evaluateExpression(expression, context) {
  if (expression === undefined || expression === null) return "";
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return expression.text;
  }
  if (ts.isNumericLiteral(expression)) {
    return Number(expression.text);
  }
  if (expression.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (expression.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (expression.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isArrayLiteralExpression(expression)) {
    return expression.elements.map((element) => evaluateExpression(element, context));
  }
  if (ts.isObjectLiteralExpression(expression)) {
    const value = {};
    for (const property of expression.properties) {
      if (
        ts.isPropertyAssignment(property) &&
        (ts.isIdentifier(property.name) ||
          ts.isStringLiteral(property.name) ||
          ts.isNumericLiteral(property.name))
      ) {
        value[property.name.text] = evaluateExpression(property.initializer, context);
      }
    }
    return value;
  }
  if (ts.isParenthesizedExpression(expression)) {
    return evaluateExpression(expression.expression, context);
  }
  if (ts.isPrefixUnaryExpression(expression) && ts.isNumericLiteral(expression.operand)) {
    return expression.operator === ts.SyntaxKind.MinusToken
      ? -Number(expression.operand.text)
      : Number(expression.operand.text);
  }
  if (ts.isJsxExpression(expression)) {
    return evaluateExpression(expression.expression, context);
  }
  if (ts.isJsxFragment(expression) || ts.isJsxElement(expression)) {
    return renderInline(getJsxChildren(expression), context);
  }
  if (ts.isJsxSelfClosingElement(expression)) {
    return renderInline([expression], context);
  }
  return normalizeText(expression.getText(context.sourceFile));
}

function attributeValueToString(attribute, context) {
  if (attribute === undefined) return "";
  if (ts.isStringLiteral(attribute)) return attribute.text;
  if (ts.isJsxExpression(attribute)) {
    const value = evaluateExpression(attribute.expression, context);
    return typeof value === "string" ? value : String(value ?? "");
  }
  return normalizeText(attribute.getText(context.sourceFile));
}

function collectTextFromGenericNode(node, context) {
  if (ts.isJsxText(node)) return normalizeText(node.getText(context.sourceFile));
  if (ts.isJsxExpression(node)) {
    const value = evaluateExpression(node.expression, context);
    return typeof value === "string" ? value : String(value ?? "");
  }
  if (ts.isJsxFragment(node)) return renderInline(getJsxChildren(node), context);
  if (ts.isJsxSelfClosingElement(node)) {
    const tagName = getTagName(node);
    if (tagName === "br") return "\n";
    if (tagName === "Ornament") return "";
    const componentBody = context.componentBodies.get(tagName ?? "");
    if (componentBody !== undefined) {
      return renderInline(getJsxChildren(componentBody), context);
    }
    return "";
  }
  if (ts.isJsxElement(node)) {
    const tagName = getTagName(node);
    if (tagName === "br") return "\n";
    if (tagName === "Ornament") return "";
    const componentBody = context.componentBodies.get(tagName ?? "");
    if (componentBody !== undefined) {
      return renderInline(getJsxChildren(componentBody), context);
    }
    return renderInline(getJsxChildren(node), context);
  }
  return "";
}

function renderInline(nodes, context) {
  const text = nodes
    .filter((node) => !isWhitespaceOnlyJsxText(node))
    .map((node) => {
      if (ts.isJsxElement(node)) {
        const tagName = getTagName(node);
        const children = getJsxChildren(node);
        if (tagName === "Strong" || tagName === "strong") {
          return `**${trimBlock(renderInline(children, context))}**`;
        }
        if (tagName === "Link" || tagName === "a" || tagName === "span") {
          return renderInline(children, context);
        }
        return collectTextFromGenericNode(node, context);
      }
      if (ts.isJsxSelfClosingElement(node) && getTagName(node) === "br") {
        return "\n";
      }
      return collectTextFromGenericNode(node, context);
    })
    .join("");
  return collapseInlineWhitespace(text).trim();
}

function renderBlockquote(title, content) {
  const lines = trimBlock(content).split("\n");
  const prefixed = lines.map((line) => `> ${line}`).join("\n");
  return title.trim().length > 0 ? `> **${title}**\n>\n${prefixed}` : prefixed;
}

function renderTableFromProps(node, context) {
  const headAttr = getAttribute(node, "head");
  const rowsAttr = getAttribute(node, "rows");
  const fillRowsAttr = getAttribute(node, "fillRows");
  const head = evaluateExpression(headAttr.expression, context);
  const rows = evaluateExpression(rowsAttr.expression, context);
  const fillRows =
    fillRowsAttr && ts.isJsxExpression(fillRowsAttr)
      ? evaluateExpression(fillRowsAttr.expression, context)
      : [];
  const allRows = [...rows, ...fillRows];
  const lines = [];
  lines.push(`| ${head.join(" | ")} |`);
  lines.push(`| ${head.map(() => "---").join(" | ")} |`);
  for (const row of allRows) {
    lines.push(
      `| ${row
        .map((cell) => String(cell).replace(/\n+/g, "<br />").trim())
        .join(" | ")} |`,
    );
  }
  return lines.join("\n");
}

function renderNumberedList(node, context) {
  const itemsAttr = getAttribute(node, "items");
  const items = evaluateExpression(itemsAttr.expression, context);
  return items
    .map((item, index) => `${index + 1}. ${trimBlock(String(item)).replace(/\n+/g, " ")}`)
    .join("\n");
}

function renderChecklist(node, context) {
  const itemsAttr = getAttribute(node, "items");
  const items = evaluateExpression(itemsAttr.expression, context);
  return items.map((item) => `- ${trimBlock(String(item)).replace(/\n+/g, " ")}`).join("\n");
}

function renderTripleGrid(node, context) {
  const colsAttr = getAttribute(node, "cols");
  const cols = evaluateExpression(colsAttr.expression, context);
  return cols
    .map((col) => `- **${trimBlock(String(col.title))}**：${trimBlock(String(col.body))}`)
    .join("\n");
}

function renderPlatformsTable(node, context) {
  const rowsAttr = getAttribute(node, "rows");
  const rows = evaluateExpression(rowsAttr.expression, context);
  const lines = [];
  lines.push("| 平台 | 流量 | 变现 | 制度 | 趋势 | 合计 | 适合谁 |");
  lines.push("| --- | --- | --- | --- | --- | --- | --- |");
  for (const row of rows) {
    const scores = Array.isArray(row.s) ? row.s : [];
    lines.push(
      `| ${row.name} | ${scores[0] ?? ""} | ${scores[1] ?? ""} | ${scores[2] ?? ""} | ${scores[3] ?? ""} | ${row.total ?? ""} | ${trimBlock(String(row.fit ?? ""))} |`,
    );
  }
  return lines.join("\n");
}

function renderNumberedFalseList(node, context) {
  const itemsAttr = getAttribute(node, "items");
  const items = evaluateExpression(itemsAttr.expression, context);
  return items
    .map(
      (item, index) =>
        `${index + 1}. **${trimBlock(String(item.title))}**——${trimBlock(String(item.verdict))} ${trimBlock(String(item.body))}`,
    )
    .join("\n");
}

function renderKnownComponent(node, context) {
  const tagName = getTagName(node);
  if (tagName === null) return "";
  const children = getJsxChildren(node);

  if (tagName === "Chapter") {
    const no = attributeValueToString(getAttribute(node, "no"), context);
    const title = attributeValueToString(getAttribute(node, "title"), context);
    const lead = attributeValueToString(getAttribute(node, "lead"), context);
    const body = renderBlocks(children, context);
    return [`## ${no} ${title}`, lead.trim().length > 0 ? `> ${lead}` : "", body]
      .filter((part) => part.trim().length > 0)
      .join("\n\n");
  }

  if (tagName === "SubHead") {
    return `### ${renderInline(children, context)}`;
  }

  if (tagName === "Insight") {
    const label = attributeValueToString(getAttribute(node, "label"), context);
    return renderBlockquote(label, renderBlocks(children, context));
  }

  if (tagName === "PullQuote") {
    return renderBlockquote("", renderInline(children, context));
  }

  if (tagName === "CaseBlock") {
    const title = attributeValueToString(getAttribute(node, "title"), context);
    return [`### ${title}`, renderBlocks(children, context)].join("\n\n");
  }

  if (tagName === "ToolCard") {
    const tag = attributeValueToString(getAttribute(node, "tag"), context);
    const title = attributeValueToString(getAttribute(node, "title"), context);
    const desc = attributeValueToString(getAttribute(node, "desc"), context);
    return [
      `### ${title}`,
      tag.trim().length > 0 ? `> ${tag}` : "",
      desc.trim().length > 0 ? desc : "",
      renderBlocks(children, context),
    ]
      .filter((part) => part.trim().length > 0)
      .join("\n\n");
  }

  if (tagName === "Table") {
    return renderTableFromProps(node, context);
  }

  if (tagName === "NumberedList") {
    return renderNumberedList(node, context);
  }

  if (tagName === "Checklist") {
    return renderChecklist(node, context);
  }

  if (tagName === "TripleGrid") {
    return renderTripleGrid(node, context);
  }

  if (tagName === "PlatformsTable") {
    return renderPlatformsTable(node, context);
  }

  if (tagName === "NumberedFalseList") {
    return renderNumberedFalseList(node, context);
  }

  if (tagName === "PartCover") {
    const componentBody = context.componentBodies.get("PartCover");
    return componentBody ? renderBlocks(getJsxChildren(componentBody), context) : "";
  }

  if (tagName === "PartEnd" || tagName === "ChapterEndNav" || tagName === "Ornament") {
    return "";
  }

  return "";
}

function renderGenericBlock(node, context) {
  if (ts.isJsxText(node)) {
    const text = trimBlock(normalizeText(node.getText(context.sourceFile)));
    return text.length > 0 ? text : "";
  }
  if (ts.isJsxExpression(node)) {
    const value = evaluateExpression(node.expression, context);
    return trimBlock(String(value ?? ""));
  }
  if (ts.isJsxFragment(node)) {
    return renderBlocks(getJsxChildren(node), context);
  }
  if (ts.isJsxSelfClosingElement(node) || ts.isJsxElement(node)) {
    const known = renderKnownComponent(node, context);
    if (known.length > 0) return known;

    const tagName = getTagName(node);
    const children = getJsxChildren(node);
    if (tagName === "p") return renderInline(children, context);
    if (tagName === "h1") return `# ${renderInline(children, context)}`;
    if (tagName === "h2") return `## ${renderInline(children, context)}`;
    if (tagName === "h3") return `### ${renderInline(children, context)}`;
    if (tagName === "h4") return `#### ${renderInline(children, context)}`;
    if (tagName === "li") return `- ${renderInline(children, context)}`;
    if (tagName === "ul" || tagName === "ol" || tagName === "div" || tagName === "section" || tagName === "article") {
      return renderBlocks(children, context);
    }
    if (tagName === "Link" || tagName === "a" || tagName === "span") {
      return renderInline(children, context);
    }

    const componentBody = context.componentBodies.get(tagName ?? "");
    if (componentBody !== undefined) {
      return renderBlocks(getJsxChildren(componentBody), context);
    }
  }
  return "";
}

function renderBlocks(nodes, context) {
  return nodes
    .filter((node) => !isWhitespaceOnlyJsxText(node))
    .map((node) => renderGenericBlock(node, context))
    .filter((block) => block.trim().length > 0)
    .join("\n\n");
}

function buildComponentBodyMap(sourceFile) {
  const names = ["Manuscript", "PartCover"];
  const map = new Map();
  for (const name of names) {
    const declaration = findVariableDeclaration(sourceFile, name);
    if (declaration?.initializer) {
      const jsx = extractReturnedJsx(declaration.initializer);
      if (jsx) map.set(name, jsx);
    }
  }
  return map;
}

function renderPageMarkdown(spec, sourceText) {
  const sourceFile = ts.createSourceFile(
    spec.source,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const componentBodies = buildComponentBodyMap(sourceFile);
  const manuscript = componentBodies.get("Manuscript");
  if (manuscript === undefined) {
    throw new Error(`${spec.slug}: 未找到 Manuscript 组件`);
  }

  const context = { sourceFile, componentBodies };
  const manuscriptChildren = getJsxChildren(manuscript).filter((node) => !isWhitespaceOnlyJsxText(node));
  const contentWrapper =
    manuscriptChildren.find(
      (node) =>
        ts.isJsxElement(node) &&
        attributeValueToString(getAttribute(node, "className"), context).includes("mx-auto"),
    ) ?? manuscript;
  const content = renderBlocks(getJsxChildren(contentWrapper), context);
  return trimBlock([`# ${spec.heading}`, content].join("\n\n")) + "\n";
}

async function main() {
  await fs.rm(outputRoot, { recursive: true, force: true });

  for (const spec of pageSpecs) {
    const sourceText = await fs.readFile(spec.source, "utf8");
    const markdown = renderPageMarkdown(spec, sourceText);
    const targetDir = path.join(outputRoot, spec.directory);
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(path.join(targetDir, spec.filename), markdown, "utf8");
  }

  console.log(`Generated ${pageSpecs.length} playbook markdown files into ${outputRoot}`);
}

await main();
