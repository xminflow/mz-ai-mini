import type { z, ZodTypeAny } from "zod";

import type { ErrorEnvelope } from "@/shared/contracts/error";

import { getLogger } from "./logger";

export interface EnvelopeOk<T> {
  ok: true;
  data: T;
}

export interface EnvelopeErr {
  ok: false;
  error: ErrorEnvelope;
}

export type Envelope<T> = EnvelopeOk<T> | EnvelopeErr;

export function internalEnvelope(message: string): ErrorEnvelope {
  return {
    schema_version: "1",
    ok: false,
    error: { code: "INTERNAL", message },
  };
}

/**
 * Zod-validate an outgoing payload before posting it back to main.
 *
 * If the payload doesn't match its declared schema, log the failure (with
 * redaction) and return an `INTERNAL` error envelope instead. This is the
 * "belt-and-suspenders" guard described in plan.md Decision 11 — three
 * checkpoints across renderer / main / utility, all sharing one TypeScript
 * module graph.
 */
export function validateEnvelope<S extends ZodTypeAny>(
  schema: S,
  payload: unknown,
  context: { method: string },
): z.infer<S> | ErrorEnvelope {
  const parsed = schema.safeParse(payload);
  if (parsed.success) {
    return parsed.data;
  }
  getLogger().error("envelope.contract_violation", {
    method: context.method,
    issues: parsed.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    })),
  });
  return internalEnvelope("internal contract violation");
}
