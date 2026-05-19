import { app } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import log from "electron-log/main";

import type { AiChatSkill } from "../../../shared/contracts/ai-chat";

const SKILL_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

let cache: AiChatSkill[] | null = null;

function skillsRoot(): string {
  return path.join(app.getAppPath(), "resources", "skills");
}

// 解析 SKILL.md 顶部的 YAML frontmatter：仅支持 `key: value` 单行字段，
// 这与 weelume 现有 8 个 skill 的 frontmatter 形态一致；不引入额外 YAML 依赖。
function parseFrontmatter(text: string): Record<string, string> {
  if (!text.startsWith("---")) return {};
  const closeIdx = text.indexOf("\n---", 3);
  if (closeIdx === -1) return {};
  const body = text.slice(3, closeIdx);
  const out: Record<string, string> = {};
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    const value = line.slice(sep + 1).trim();
    if (key) out[key] = value;
  }
  return out;
}

const TITLE_FALLBACK_MAX = 24;

// 缺 title 时回落：取 description 第一个中文句号 / 分号之前的片段并去掉 markdown **，
// 上限 24 字符。仅作为兜底；真正展示效果靠 SKILL.md 的 title 字段。
function fallbackTitleFrom(description: string): string {
  const cut = description.search(/[。；;]/);
  const head = (cut > 0 ? description.slice(0, cut) : description)
    .replace(/\*\*/g, "")
    .trim();
  return head.length > TITLE_FALLBACK_MAX
    ? `${head.slice(0, TITLE_FALLBACK_MAX)}…`
    : head;
}

async function readSkillEntry(dirName: string): Promise<AiChatSkill | null> {
  const file = path.join(skillsRoot(), dirName, "SKILL.md");
  try {
    const content = await fs.readFile(file, "utf8");
    const fm = parseFrontmatter(content);
    const id = (fm.name ?? "").trim();
    const description = (fm.description ?? "").trim();
    const explicitTitle = (fm.title ?? "").trim();
    if (!SKILL_ID_PATTERN.test(id)) {
      log.warn(`[ai-chat:list-skills] skip ${file}: invalid name "${id}"`);
      return null;
    }
    if (!description) {
      log.warn(`[ai-chat:list-skills] skip ${file}: empty description`);
      return null;
    }
    const title = explicitTitle || fallbackTitleFrom(description);
    return { id, title, description };
  } catch (err) {
    log.warn(
      `[ai-chat:list-skills] failed to read ${file}: ${err instanceof Error ? err.message : String(err)}`,
    );
    return null;
  }
}

export async function listBundledSkills(): Promise<AiChatSkill[]> {
  if (cache !== null) return cache;
  const root = skillsRoot();
  let entries: string[];
  try {
    const dirents = await fs.readdir(root, { withFileTypes: true });
    entries = dirents.filter((d) => d.isDirectory()).map((d) => d.name);
  } catch (err) {
    log.warn(
      `[ai-chat:list-skills] skills root unreadable (${root}): ${err instanceof Error ? err.message : String(err)}`,
    );
    cache = [];
    return cache;
  }
  const skills: AiChatSkill[] = [];
  for (const dirName of entries.sort()) {
    const skill = await readSkillEntry(dirName);
    if (skill !== null) skills.push(skill);
  }
  log.debug(`[ai-chat:list-skills] loaded ${skills.length} skills from ${root}`);
  cache = skills;
  return cache;
}
