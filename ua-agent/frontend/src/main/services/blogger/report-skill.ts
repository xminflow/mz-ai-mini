import { app } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import log from "electron-log/main";

function bundledSkillRoot(): string {
  return path.join(app.getAppPath(), "resources", "skills", "douyin-blogger-report");
}

function installedSkillRoots(): readonly string[] {
  const userData = app.getPath("userData");
  return [
    path.join(userData, ".claude", "skills", "douyin-blogger-report"),
    path.join(userData, ".codex", "skills", "douyin-blogger-report"),
  ] as const;
}

async function readVersion(dir: string): Promise<string> {
  try {
    const raw = await fs.readFile(path.join(dir, "version.txt"), "utf8");
    return raw.trim();
  } catch {
    return "0.0.0";
  }
}

export async function ensureDouyinBloggerReportSkill(): Promise<void> {
  const source = bundledSkillRoot();
  try {
    const shipped = await readVersion(source);
    if (shipped === "0.0.0") {
      log.warn(`[blogger:skill] bundled skill missing at ${source}; skipping copy`);
      return;
    }

    for (const target of installedSkillRoots()) {
      const installed = await readVersion(target);
      if (installed === shipped) continue;
      await fs.mkdir(target, { recursive: true });
      const entries = await fs.readdir(source);
      for (const name of entries) {
        const src = path.join(source, name);
        const dst = path.join(target, name);
        const stat = await fs.stat(src);
        if (stat.isFile()) {
          await fs.copyFile(src, dst);
        }
      }
      log.info(`[blogger:skill] installed douyin-blogger-report skill: ${installed} -> ${shipped} (${target})`);
    }
  } catch (err) {
    log.warn(
      `[blogger:skill] failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
