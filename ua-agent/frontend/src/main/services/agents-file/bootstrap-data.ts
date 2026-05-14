import { promises as fs } from "node:fs";
import path from "node:path";

import { app } from "electron";
import log from "electron-log/main";

import { personaJsonPath, personaMarkdownPath } from "../persona/workspace-store";

const GUIDE_ROOT = "D:\\code\\creator-notes\\notes\\book";
const PERSONA_BLOCK_START = "<!-- ua-agent:persona:start -->";
const PERSONA_BLOCK_END = "<!-- ua-agent:persona:end -->";

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function renderDefaultAgentsTemplate(userDataPath: string): string {
  return [
    "# AI运营获客 Workspace AGENTS",
    "",
    "## 工程说明",
    "- 本文件面向运行在工作空间内的 AI Agent，用于说明当前工程的重要数据入口和文件语义。",
    "- 工作空间固定为 Electron `app.getPath(\"userData\")` 对应目录。",
    "- AI 在做深入分析时，应先读取本文件，再按文中列出的相对路径访问真实数据文件。",
    "",
    "## 工作空间根目录",
    `- 根目录：${userDataPath}`,
    `- 运行时固定文件：${userDataPath}/config.json`,
    `- AI 对话状态：${userDataPath}/ai-chat-state.json`,
    "",
    "## 核心数据入口索引",
    "",
    "### library.db",
    "- 用途：素材库主记录数据库，存放采集到的素材索引与基础字段。",
    "- AI 使用建议：先把它视为素材总索引，再结合衍生目录中的 meta/report 文件做深入分析。",
    "",
    "### blogger-frames/",
    "- 用途：博主拆解资料目录。",
    "- 关键文件：`<bloggerId>/profile.json`、`<bloggerId>/analysis.md`、`<bloggerId>/<videoId>/meta.json`、`transcript.txt`、抽帧图片。",
    "- AI 使用建议：优先读 `profile.json` 获取博主元数据，再读 `analysis.md` 和样本视频目录补充上下文。",
    "",
    "### content-diagnosis/",
    "- 用途：内容诊断任务目录。",
    "- 关键文件：`<id>/meta.json`、`transcript.txt`、`frames/`、`diagnosis.md`、`diagnosis.generated.md`、`README.input.md`。",
    "- AI 使用建议：优先读 `meta.json` 和最终 `diagnosis.md`；若报告未生成，再结合 `transcript.txt` 与 `frames/` 分析。",
    "",
    "### hot-material-analysis/",
    "- 用途：爆款素材分析任务目录。",
    "- 关键文件：`<id>/meta.json`、`transcript.txt`、`frames/`、`analysis.md`、`analysis.generated.md`、`README.input.md`。",
    "- AI 使用建议：优先读 `meta.json` 和最终 `analysis.md`；若报告未生成，再结合 `transcript.txt` 与 `frames/` 分析。",
    "",
    "### 自媒体指南 / 流量实战资料",
    "- 用途：外部 Markdown 指南与流量实战资料，为博主拆解、内容诊断、爆款素材分析提供背景知识。",
    `- 当前外部目录约定：${GUIDE_ROOT}`,
    "- AI 使用建议：将其视为外部只读知识源，不假设已打包进工作空间。",
    "",
    "### .claude/skills/ 与 .codex/skills/",
    "- 用途：报告生成技能安装目录。",
    "- AI 使用建议：若要理解报告生成逻辑，可先查看对应 skill 目录中的 `SKILL.md`。",
    "",
    "## 运行期数据目录规范",
    "",
    "- `config.json`：应用设置，包含 provider、network、theme、scheduling。",
    "- `ai-chat-state.json`：AI 对话快照，按 provider + workspace 维度保存历史。",
    "- `content-diagnosis/` 与 `hot-material-analysis/` 通常由用户运行应用后逐步产生，安装包默认不预置实例数据。",
    "- `library.db` 与各分析目录是分离的数据源：前者提供素材主索引，后者提供面向分析的衍生文件。",
    "",
    "## AI 读取建议",
    "",
    "- 先读本文件，再按任务目标进入对应目录。",
    "- 做素材分析时，先从 `library.db` 确认对象，再进入 `blogger-frames/`、`content-diagnosis/` 或 `hot-material-analysis/` 读取细节。",
    "- 优先读取 `meta.json`、最终 Markdown 报告和 `transcript.txt`，图片与中间草稿文件作为补充证据。",
    "",
  ].join("\n");
}

function renderPersonaBlock(userDataPath: string): string {
  return [
    PERSONA_BLOCK_START,
    "## 人设与战略上下文",
    "- 用途：保存用户在“人设设置 / 战略设置”页面维护的当前业务上下文。",
    `- 机器可读文件：${path.basename(personaJsonPath(userDataPath))}`,
    `- 人类可读文件：${path.basename(personaMarkdownPath(userDataPath))}`,
    "- AI 使用建议：处理 AI 对话、选题、诊断、拆解、写作任务前，优先先读取这两份文件，不能假设人设信息存在于 config.json 或聊天历史里。",
    PERSONA_BLOCK_END,
    "",
  ].join("\n");
}

function injectPersonaBlock(content: string, userDataPath: string): string {
  const block = renderPersonaBlock(userDataPath);
  const pattern = new RegExp(
    `${PERSONA_BLOCK_START}[\\s\\S]*?${PERSONA_BLOCK_END}\\s*`,
    "m",
  );
  if (pattern.test(content)) {
    return content.replace(pattern, block);
  }
  const anchor = "## 运行期数据目录规范";
  if (content.includes(anchor)) {
    return content.replace(anchor, `${block}${anchor}`);
  }
  const normalized = content.endsWith("\n") ? content : `${content}\n`;
  return `${normalized}\n${block}`;
}

export async function ensureBundledAgentsFile(): Promise<void> {
  const sourcePath = path.join(process.resourcesPath, "AGENTS.md");
  const userDataPath = app.getPath("userData");
  const targetPath = path.join(userDataPath, "AGENTS.md");

  let content: string;
  if (await exists(targetPath)) {
    content = await fs.readFile(targetPath, "utf8");
  } else if (app.isPackaged && (await exists(sourcePath))) {
    content = await fs.readFile(sourcePath, "utf8");
  } else {
    if (app.isPackaged && !(await exists(sourcePath))) {
      log.warn(`[agents-file:bootstrap] bundled AGENTS.md missing at ${sourcePath}`);
    }
    content = renderDefaultAgentsTemplate(userDataPath);
  }

  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  try {
    await fs.writeFile(targetPath, injectPersonaBlock(content, userDataPath), "utf8");
    log.info(`[agents-file:bootstrap] ensured AGENTS.md at ${targetPath}`);
  } catch (err) {
    log.warn(
      `[agents-file:bootstrap] failed to write ${targetPath}: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
}
