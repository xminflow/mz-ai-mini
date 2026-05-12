import { app } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import log from "electron-log/main";

function bundledSkillRoot(): string {
  return path.join(app.getAppPath(), "resources", "skills", "douyin-content-diagnosis-report");
}

function installedSkillRoots(): readonly string[] {
  const userData = app.getPath("userData");
  return [
    path.join(userData, ".claude", "skills", "douyin-content-diagnosis-report"),
    path.join(userData, ".codex", "skills", "douyin-content-diagnosis-report"),
  ] as const;
}

async function readVersion(dir: string): Promise<string> {
  try {
    return (await fs.readFile(path.join(dir, "version.txt"), "utf8")).trim();
  } catch {
    return "0.0.0";
  }
}

export async function ensureDouyinContentDiagnosisReportSkill(): Promise<void> {
  const source = bundledSkillRoot();
  try {
    const shipped = await readVersion(source);
    if (shipped === "0.0.0") {
      log.warn(`[content-diagnosis:skill] bundled skill missing at ${source}; skipping copy`);
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
      log.info(
        `[content-diagnosis:skill] installed douyin-content-diagnosis-report skill: ${installed} -> ${shipped} (${target})`,
      );
    }
  } catch (err) {
    log.warn(
      `[content-diagnosis:skill] failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
