#!/usr/bin/env node

const fs = require("node:fs/promises");
const path = require("node:path");

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listBundledBloggerSummaries(bloggerRoot) {
  if (!(await exists(bloggerRoot))) return [];

  const entries = await fs.readdir(bloggerRoot, { withFileTypes: true });
  const summaries = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const absDir = path.join(bloggerRoot, entry.name);
    if (!(await exists(path.join(absDir, "profile.json")))) continue;
    const nested = await fs.readdir(absDir, { withFileTypes: true });
    summaries.push({
      id: entry.name,
      hasAnalysis: await exists(path.join(absDir, "analysis.md")),
      sampleCount: nested.filter((item) => item.isDirectory() && item.name !== "frames").length,
    });
  }
  summaries.sort((a, b) => a.id.localeCompare(b.id, "zh-CN", { sensitivity: "base" }));
  return summaries;
}

function renderBloggerSection(summaries) {
  const lines = [
    "## 已打包数据摘要",
    "",
    "### blogger-frames/",
    "- 用途：博主拆解资料目录。",
  ];
  if (summaries.length === 0) {
    lines.push("- 构建时未发现可预置的博主拆解实例数据。");
    lines.push("- 运行期如目录存在，优先读取 `<bloggerId>/profile.json`、`analysis.md` 与各视频目录下的 `meta.json`。");
    lines.push("");
    return lines;
  }

  lines.push(`- 构建时已预置 ${summaries.length} 个博主目录。`);
  for (const summary of summaries) {
    lines.push(
      `- ${summary.id}: profile.json=present, analysis.md=${summary.hasAnalysis ? "present" : "missing"}, sample_dirs=${summary.sampleCount}`,
    );
  }
  lines.push("");
  return lines;
}

function replaceAllLiteral(input, search, replacement) {
  return input.split(search).join(replacement);
}

async function buildAgentsMarkdown(input) {
  const template = await fs.readFile(input.templatePath, "utf8");
  return [
    ["{{productName}}", input.productName],
    ["{{workspaceRootLabel}}", input.workspaceRootLabel],
    ["{{guideRoot}}", input.guideRoot],
    ["{{bundledBloggerSummary}}", renderBloggerSection(input.bundledBloggerSummaries).join("\n")],
  ].reduce(
    (content, [token, replacement]) => replaceAllLiteral(content, token, replacement),
    template,
  );
}

async function main() {
  const [targetPath, bloggerRoot, guideRoot, templatePathArg] = process.argv.slice(2);
  if (!targetPath || !bloggerRoot || !guideRoot) {
    throw new Error("Usage: node generate-build-agents.cjs <targetPath> <bloggerRoot> <guideRoot> [templatePath]");
  }
  const templatePath =
    templatePathArg ?? path.resolve(__dirname, "..", "frontend", "resources", "AGENTS.template.md");

  const markdown = await buildAgentsMarkdown({
    productName: "AI运营获客",
    workspaceRootLabel: '<app.getPath("userData")>',
    guideRoot,
    templatePath,
    bundledBloggerSummaries: await listBundledBloggerSummaries(bloggerRoot),
  });
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, markdown, "utf8");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack ?? err.message : String(err));
  process.exit(1);
});
