import { promises as fs } from "node:fs";
import path from "node:path";

import { app } from "electron";
import log from "electron-log/main";

type BootstrapResult = {
  copied: number;
  skipped: number;
};

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function hasBloggerProfile(dir: string): Promise<boolean> {
  return exists(path.join(dir, "profile.json"));
}

export async function copyBundledBloggerData(input: {
  sourceRoot: string;
  targetRoot: string;
}): Promise<BootstrapResult> {
  const { sourceRoot, targetRoot } = input;
  if (!(await exists(sourceRoot))) {
    return { copied: 0, skipped: 0 };
  }

  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(sourceRoot, { withFileTypes: true });
  } catch (err) {
    log.warn(
      `[blogger:bootstrap] failed to read bundled data at ${sourceRoot}: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
    return { copied: 0, skipped: 0 };
  }

  await fs.mkdir(targetRoot, { recursive: true });

  let copied = 0;
  let skipped = 0;
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const sourceDir = path.join(sourceRoot, entry.name);
    if (!(await hasBloggerProfile(sourceDir))) continue;

    const targetDir = path.join(targetRoot, entry.name);
    if (await exists(targetDir)) {
      skipped += 1;
      continue;
    }

    try {
      await fs.cp(sourceDir, targetDir, {
        recursive: true,
        errorOnExist: true,
        force: false,
      });
      copied += 1;
    } catch (err) {
      skipped += 1;
      log.warn(
        `[blogger:bootstrap] failed to copy ${sourceDir} -> ${targetDir}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  return { copied, skipped };
}

export async function ensureBundledBloggerData(): Promise<void> {
  if (!app.isPackaged) return;

  const result = await copyBundledBloggerData({
    sourceRoot: path.join(process.resourcesPath, "blogger-frames"),
    targetRoot: path.join(app.getPath("userData"), "blogger-frames"),
  });

  if (result.copied > 0 || result.skipped > 0) {
    log.info(
      `[blogger:bootstrap] copied=${result.copied} skipped=${result.skipped}`,
    );
  }
}
