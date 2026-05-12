import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  LibraryListResult,
  type LibraryListResult as LibraryListResultType,
  LibraryListFilters,
} from "../../shared/contracts/library";
import { getSharedStore, type ListFilters } from "../../utility/keyword-crawl/domain/library";

const CHANNEL = "library:list";

type Platform = "douyin" | "xiaohongshu";

interface LibraryListQuery {
  from?: string | null;
  to?: string | null;
  author?: string | null;
  platform?: Platform | null;
  limit?: number;
  offset?: number;
}

function normalizePlatform(p: unknown): Platform | null {
  if (p === "douyin" || p === "xiaohongshu") return p;
  return null;
}

const DEFAULT_LIMIT = 50;
const DEFAULT_OFFSET = 0;

function clampLimit(n: number | undefined): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return DEFAULT_LIMIT;
  if (n < 1) return 1;
  if (n > 200) return 200;
  return Math.floor(n);
}

function clampOffset(n: number | undefined): number {
  if (typeof n !== "number" || !Number.isFinite(n) || n < 0) return DEFAULT_OFFSET;
  return Math.floor(n);
}

export function registerLibraryListHandler(): void {
  ipcMain.handle(
    CHANNEL,
    async (_event, query: LibraryListQuery = {}): Promise<LibraryListResultType> => {
      const start = Date.now();
      const filters: ListFilters = {
        from: query.from ?? null,
        to: query.to ?? null,
        author: query.author ?? null,
        platform: normalizePlatform(query.platform),
        limit: clampLimit(query.limit),
        offset: clampOffset(query.offset),
      };

      if (filters.from !== null && filters.to !== null && filters.from > filters.to) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INVALID_INPUT", message: "from must be ≤ to" },
        };
      }

      try {
        const page = getSharedStore().listMaterials(filters);
        const appliedFilters = LibraryListFilters.parse(filters);
        const payload: LibraryListResultType = {
          schema_version: "1",
          ok: true,
          entries: page.entries,
          total: page.total,
          library_total: page.libraryTotal,
          applied_filters: appliedFilters,
        };
        const validated = LibraryListResult.safeParse(payload);
        const elapsed = Date.now() - start;
        if (!validated.success) {
          log.warn(
            `library:list payload failed Zod parse (${elapsed} ms)`,
            validated.error.issues,
          );
          return {
            schema_version: "1",
            ok: false,
            error: {
              code: "INTERNAL",
              message: "library list payload failed contract validation",
            },
          };
        }
        log.info(`library:list ok=true entries=${page.entries.length} (${elapsed} ms)`);
        return validated.data;
      } catch (err) {
        const elapsed = Date.now() - start;
        const message = err instanceof Error ? err.message : String(err);
        log.error(`library:list failed (${elapsed} ms): ${message}`);
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: message.slice(0, 1024) },
        };
      }
    },
  );
}

export function unregisterLibraryListHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
