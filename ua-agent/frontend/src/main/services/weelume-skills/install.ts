import { app } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import log from "electron-log/main";

function bundledSkillRoot(skillName: string): string {
  return path.join(app.getAppPath(), "resources", "skills", skillName);
}

function installedSkillRoots(skillName: string): readonly string[] {
  const userData = app.getPath("userData");
  return [
    path.join(userData, ".claude", "skills", skillName),
    path.join(userData, ".codex", "skills", skillName),
  ] as const;
}

async function readVersion(dir: string): Promise<string> {
  try {
    return (await fs.readFile(path.join(dir, "version.txt"), "utf8")).trim();
  } catch {
    return "0.0.0";
  }
}

// 递归复制目录树。源目录已存在；目标目录会按需创建。
// 仅复制文件与子目录；忽略符号链接等特殊文件，避免越权。
async function copyTree(src: string, dst: string): Promise<void> {
  await fs.mkdir(dst, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      await copyTree(srcPath, dstPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, dstPath);
    }
  }
}

async function installSkill(skillName: string, logTag: string): Promise<void> {
  const source = bundledSkillRoot(skillName);
  try {
    const shipped = await readVersion(source);
    if (shipped === "0.0.0") {
      log.warn(`[${logTag}] bundled skill missing at ${source}; skipping copy`);
      return;
    }

    for (const target of installedSkillRoots(skillName)) {
      const installed = await readVersion(target);
      if (installed === shipped) continue;
      await copyTree(source, target);
      log.info(
        `[${logTag}] installed ${skillName} skill: ${installed} -> ${shipped} (${target})`,
      );
    }
  } catch (err) {
    log.warn(
      `[${logTag}] failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export async function ensureWeelumeContentCreationSkill(): Promise<void> {
  await installSkill("weelume-content-creation", "weelume:content-creation");
}

export async function ensureWeelumeAccountDiagnosisSkill(): Promise<void> {
  await installSkill("weelume-account-diagnosis", "weelume:account-diagnosis");
}

export async function ensureWeelumePlaybookAdvisorSkill(): Promise<void> {
  await installSkill("weelume-playbook-advisor", "weelume:playbook-advisor");
}

export async function ensureWeelumeIndustryPlaybookSkill(): Promise<void> {
  await installSkill("weelume-industry-playbook", "weelume:industry-playbook");
}
