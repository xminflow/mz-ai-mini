import { app } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import log from "electron-log/main";

function bundledSkillRoot(): string {
  return path.join(app.getAppPath(), "resources", "skills", "douyin-hot-material-report");
}

function installedSkillRoots(): readonly string[] {
  const userData = app.getPath("userData");
  return [
    path.join(userData, ".claude", "skills", "douyin-hot-material-report"),
    path.join(userData, ".codex", "skills", "douyin-hot-material-report"),
  ] as const;
}

async function readVersion(dir: string): Promise<string> {
  try {
    return (await fs.readFile(path.join(dir, "version.txt"), "utf8")).trim();
  } catch {
    return "0.0.0";
  }
}

export async function ensureDouyinHotMaterialReportSkill(): Promise<void> {
  const source = bundledSkillRoot();
  try {
    const shipped = await readVersion(source);
    if (shipped === "0.0.0") {
      log.warn(`[hot-material:skill] bundled skill missing at ${source}; skipping copy`);
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
        if (stat.isFile()) await fs.copyFile(src, dst);
      }
      log.info(`[hot-material:skill] installed douyin-hot-material-report skill: ${installed} -> ${shipped} (${target})`);
    }
  } catch (err) {
    log.warn(
      `[hot-material:skill] failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
