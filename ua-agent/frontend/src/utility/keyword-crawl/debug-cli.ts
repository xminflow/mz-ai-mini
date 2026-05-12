/**
 * Dev-only debug CLI: `pnpm web:debug <method> [json-args]`.
 *
 * Spawns a fresh utility-process instance per invocation, dispatches a single
 * RPC, prints exactly one JSON envelope to stdout, exits 0 on success / 1 on
 * any ErrorEnvelope.
 */

import { handlers } from "./handlers";

async function main(): Promise<void> {
  const [, , method, ...rest] = process.argv;
  if (method === undefined || method.length === 0) {
    process.stderr.write("usage: web:debug <method> [json-args]\n");
    process.exit(2);
  }
  let args: unknown = {};
  if (rest.length > 0) {
    try {
      args = JSON.parse(rest.join(" "));
    } catch (e) {
      process.stderr.write(`invalid JSON args: ${(e as Error).message}\n`);
      process.exit(2);
    }
  }
  const handler = handlers[method];
  if (handler === undefined) {
    process.stdout.write(
      `${JSON.stringify({
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message: `method not implemented: ${method}` },
      })}\n`,
    );
    process.exit(1);
  }
  try {
    const result = await handler(args);
    process.stdout.write(`${JSON.stringify(result)}\n`);
    if (typeof result === "object" && result !== null && (result as { ok?: unknown }).ok === false) {
      process.exit(1);
    }
    process.exit(0);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    process.stdout.write(
      `${JSON.stringify({
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message },
      })}\n`,
    );
    process.exit(1);
  }
}

void main();
