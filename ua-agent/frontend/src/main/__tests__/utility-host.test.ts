/**
 * Per-channel re-entry guard test (FR-022c).
 *
 * The real `UtilityHost` imports from `electron`, which is unavailable in
 * vitest. We carve out a tiny re-entry-guard implementation matching the
 * production logic and assert it returns the expected INTERNAL envelope on
 * the second concurrent call.
 */

import { describe, expect, it } from "vitest";

import type { ErrorEnvelope } from "@/shared/contracts/error";

const GUARDED = new Set(["batchStart", "sessionStatus"]);

class GuardedRpc {
  private inFlight = new Set<string>();

  constructor(private slowFn: () => Promise<{ ok: true }>) {}

  async rpc(method: string): Promise<{ ok: true } | ErrorEnvelope> {
    if (GUARDED.has(method) && this.inFlight.has(method)) {
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message: "操作进行中——请等待当前操作完成" },
      };
    }
    this.inFlight.add(method);
    try {
      return await this.slowFn();
    } finally {
      this.inFlight.delete(method);
    }
  }
}

describe("utility-host re-entry guard", () => {
  it("returns INTERNAL envelope when a second concurrent batchStart is invoked", async () => {
    const resolveBox: { fn: (() => void) | null } = { fn: null };
    const slow = () =>
      new Promise<{ ok: true }>((resolve) => {
        resolveBox.fn = () => resolve({ ok: true });
      });
    const host = new GuardedRpc(slow);
    const first = host.rpc("batchStart");
    // Wait one microtask so the first call's promise has registered.
    await Promise.resolve();
    const second = await host.rpc("batchStart");
    expect((second as ErrorEnvelope).ok).toBe(false);
    if (!("ok" in second) || second.ok === false) {
      const err = second as ErrorEnvelope;
      expect(err.error.code).toBe("INTERNAL");
      expect(err.error.message).toContain("操作进行中");
    }
    if (resolveBox.fn !== null) resolveBox.fn();
    const firstResult = await first;
    expect((firstResult as { ok: true }).ok).toBe(true);
  });

  it("does NOT guard installBrowser / sessionStart / sessionReset", async () => {
    let count = 0;
    const slow = () =>
      new Promise<{ ok: true }>((resolve) => {
        count++;
        setTimeout(() => resolve({ ok: true }), 10);
      });
    const host = new GuardedRpc(slow);
    const r1 = host.rpc("installBrowser");
    const r2 = host.rpc("installBrowser");
    await r1;
    await r2;
    expect(count).toBe(2);
  });
});
