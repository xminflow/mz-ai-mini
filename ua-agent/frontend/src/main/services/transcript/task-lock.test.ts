import { describe, expect, it } from "vitest";

import { getActiveTranscriptTask, runWithTranscriptTaskLock } from "./task-lock";

describe("runWithTranscriptTaskLock", () => {
  it("rejects a second concurrent transcription task", async () => {
    let release!: () => void;
    const first = runWithTranscriptTaskLock("owner-1", "任务 1", async () => {
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      return "first";
    });

    expect(getActiveTranscriptTask()?.owner).toBe("owner-1");

    const second = await runWithTranscriptTaskLock("owner-2", "任务 2", async () => "second");
    expect(second.ok).toBe(false);
    if (!second.ok) {
      expect(second.active.owner).toBe("owner-1");
      expect(second.active.label).toBe("任务 1");
    }

    release();
    await expect(first).resolves.toEqual({ ok: true, value: "first" });
    expect(getActiveTranscriptTask()).toBeNull();
  });

  it("releases the lock after failure", async () => {
    await expect(
      runWithTranscriptTaskLock("owner-1", "任务 1", async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    expect(getActiveTranscriptTask()).toBeNull();
  });
});
