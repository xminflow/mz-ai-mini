import fs from "node:fs/promises";
import path from "node:path";
import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  SelfMediaGuideListResult,
  type SelfMediaGuideFile,
  type SelfMediaGuideListResult as SelfMediaGuideListResultType,
} from "../../shared/contracts/self-media-guide";

const CHANNEL = "self-media-guide:list";
const GUIDE_ROOT = "D:\\code\\creator-notes\\notes\\book";

async function listMarkdownFiles(root: string, dir = root): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) return listMarkdownFiles(root, abs);
      if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) return [abs];
      return [];
    }),
  );
  return nested.flat();
}

function titleFromMarkdown(markdown: string, fallback: string): string {
  const heading = /^#\s+(.+)$/m.exec(markdown);
  return heading?.[1]?.trim() || fallback.replace(/\.md$/i, "");
}

function normalizeRelativePath(abs: string): string {
  return path.relative(GUIDE_ROOT, abs).split(path.sep).join("/");
}

export function registerSelfMediaGuideListHandler(): void {
  ipcMain.handle(CHANNEL, async (): Promise<SelfMediaGuideListResultType> => {
    const start = Date.now();
    try {
      const stat = await fs.stat(GUIDE_ROOT);
      if (!stat.isDirectory()) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INVALID_INPUT", message: `${GUIDE_ROOT} is not a directory` },
        };
      }

      const paths = (await listMarkdownFiles(GUIDE_ROOT)).sort((a, b) =>
        normalizeRelativePath(a).localeCompare(normalizeRelativePath(b), "zh-CN", {
          numeric: true,
          sensitivity: "base",
        }),
      );

      const files: SelfMediaGuideFile[] = await Promise.all(
        paths.map(async (filePath) => {
          const [markdown, fileStat] = await Promise.all([
            fs.readFile(filePath, "utf8"),
            fs.stat(filePath),
          ]);
          const relativePath = normalizeRelativePath(filePath);
          return {
            id: relativePath,
            relative_path: relativePath,
            title: titleFromMarkdown(markdown, path.basename(filePath)),
            directory: path.dirname(relativePath) === "." ? "" : path.dirname(relativePath).split(path.sep).join("/"),
            markdown,
            updated_at: fileStat.mtime.toISOString(),
          };
        }),
      );

      const payload = {
        schema_version: "1",
        ok: true,
        root: GUIDE_ROOT,
        files,
        loaded_at: new Date().toISOString(),
      } as const;
      const validated = SelfMediaGuideListResult.safeParse(payload);
      if (!validated.success) {
        log.warn(`${CHANNEL} payload failed Zod parse`, validated.error.issues);
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: "self-media guide payload failed contract validation" },
        };
      }
      log.info(`${CHANNEL} ok=true files=${files.length} (${Date.now() - start} ms)`);
      return validated.data;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "ENOENT") {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INVALID_INPUT", message: `${GUIDE_ROOT} does not exist` },
        };
      }
      const message = err instanceof Error ? err.message : String(err);
      log.error(`${CHANNEL} failed: ${message}`);
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message: message.slice(0, 1024) },
      };
    }
  });
}

export function unregisterSelfMediaGuideListHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
