import { z } from "zod";

import { ErrorDetail, ErrorEnvelope, SCHEMA_VERSION } from "./error";

export { SCHEMA_VERSION };

// Re-exported aliases preserve the 001 import surface while sharing one envelope.
export const PingErrorDetail = ErrorDetail;
export type PingErrorDetail = z.infer<typeof PingErrorDetail>;

export const PingError = ErrorEnvelope;
export type PingError = z.infer<typeof PingError>;

export const BackendIdentity = z.object({
  name: z.literal("ua-agent"),
  version: z.string().regex(/^\d+\.\d+\.\d+(?:[-+].+)?$/, {
    message: "version must be semver",
  }),
  python: z.string().regex(/^3\.(?:11|12)\..+$/, {
    message: "python version must satisfy 3.11.* or 3.12.*",
  }),
});
export type BackendIdentity = z.infer<typeof BackendIdentity>;

export const PingSuccess = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  ok: z.literal(true),
  message: z.string().min(1).max(1024),
  echo: z.union([z.string().max(256), z.null()]),
  timestamp: z.string().datetime({ offset: false }),
  backend: BackendIdentity,
});
export type PingSuccess = z.infer<typeof PingSuccess>;

export const PingResult = z.discriminatedUnion("ok", [PingSuccess, PingError]);
export type PingResult = z.infer<typeof PingResult>;
