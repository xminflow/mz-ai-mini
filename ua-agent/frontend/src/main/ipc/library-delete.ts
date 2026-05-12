import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  LibraryDeleteResult,
  type LibraryDeleteResult as LibraryDeleteResultType,
} from "../../shared/contracts/library";
import { getSharedStore } from "../../utility/keyword-crawl/domain/library";

const CHANNEL = "library:delete";

export function registerLibraryDeleteHandler(): void {
  ipcMain.handle(
    CHANNEL,
    async (_event, postId: string): Promise<LibraryDeleteResultType> => {
      const start = Date.now();
      if (typeof postId !== "string" || postId.length === 0 || postId.length > 128) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INVALID_INPUT", message: "post_id is required (1..128 chars)" },
        };
      }
      try {
        const removed = getSharedStore().deleteMaterial(postId);
        if (!removed) {
          log.info(`library:delete miss post_id=${postId} (${Date.now() - start} ms)`);
          return {
            schema_version: "1",
            ok: false,
            error: {
              code: "LIBRARY_NOT_FOUND",
              message: `post_id ${postId} does not exist`,
            },
          };
        }
        const payload: LibraryDeleteResultType = {
          schema_version: "1",
          ok: true,
          deleted_post_id: postId,
          restored: false,
        };
        const validated = LibraryDeleteResult.safeParse(payload);
        const elapsed = Date.now() - start;
        if (!validated.success) {
          log.warn(
            `library:delete payload failed Zod parse (${elapsed} ms)`,
            validated.error.issues,
          );
          return {
            schema_version: "1",
            ok: false,
            error: {
              code: "INTERNAL",
              message: "library delete payload failed contract validation",
            },
          };
        }
        log.info(`library:delete ok post_id=${postId} (${elapsed} ms)`);
        return validated.data;
      } catch (err) {
        const elapsed = Date.now() - start;
        const message = err instanceof Error ? err.message : String(err);
        log.error(`library:delete failed (${elapsed} ms): ${message}`);
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: message.slice(0, 1024) },
        };
      }
    },
  );
}

export function unregisterLibraryDeleteHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
