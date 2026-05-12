import { describe, expect, it } from "vitest";
import { z } from "zod";

import { internalEnvelope, validateEnvelope } from "../infra/envelope";

const okSchema = z
  .object({
    schema_version: z.literal("1"),
    ok: z.literal(true),
    value: z.number(),
  })
  .strict();

describe("envelope", () => {
  it("internalEnvelope returns a properly-shaped error envelope", () => {
    const env = internalEnvelope("boom");
    expect(env.schema_version).toBe("1");
    expect(env.ok).toBe(false);
    expect(env.error.code).toBe("INTERNAL");
    expect(env.error.message).toBe("boom");
  });

  it("validateEnvelope returns the parsed payload on success", () => {
    const out = validateEnvelope(
      okSchema,
      { schema_version: "1", ok: true, value: 42 },
      { method: "test" },
    );
    expect((out as { ok: boolean }).ok).toBe(true);
    expect((out as { value: number }).value).toBe(42);
  });

  it("validateEnvelope returns an INTERNAL envelope on schema mismatch", () => {
    const out = validateEnvelope(
      okSchema,
      { schema_version: "1", ok: true, value: "not-a-number" },
      { method: "test" },
    );
    expect((out as { ok: boolean }).ok).toBe(false);
    expect((out as { error: { code: string } }).error.code).toBe("INTERNAL");
  });
});
