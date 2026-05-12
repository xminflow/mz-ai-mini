import { app } from "electron";

export function defaultLlmWorkspace(): string {
  return app.getPath("userData");
}
