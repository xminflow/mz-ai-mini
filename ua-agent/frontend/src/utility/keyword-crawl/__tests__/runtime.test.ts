import { describe, expect, it } from "vitest";

import {
  BATCH_SESSION_DEAD_THRESHOLD,
  CONSECUTIVE_ERROR_THRESHOLD,
  DWELL_TIMEOUT_MS,
  INTER_CARD_MIN_INTERVAL_MS,
  KEYWORD_RUN_HEALTH_CAP,
  KEYWORD_RUN_TARGET_CAP,
  LAYOUT_SWITCH_TIMEOUT_MS,
} from "../domain/runtime";

describe("runtime constants — Decision 13", () => {
  it("KEYWORD_RUN_TARGET_CAP is 50", () => {
    expect(KEYWORD_RUN_TARGET_CAP).toBe(50);
  });

  it("KEYWORD_RUN_HEALTH_CAP is 200", () => {
    expect(KEYWORD_RUN_HEALTH_CAP).toBe(200);
  });

  it("INTER_CARD_MIN_INTERVAL_MS is 1500", () => {
    expect(INTER_CARD_MIN_INTERVAL_MS).toBe(1500);
  });

  it("CONSECUTIVE_ERROR_THRESHOLD is 5", () => {
    expect(CONSECUTIVE_ERROR_THRESHOLD).toBe(5);
  });

  it("LAYOUT_SWITCH_TIMEOUT_MS is 5000", () => {
    expect(LAYOUT_SWITCH_TIMEOUT_MS).toBe(5000);
  });

  it("DWELL_TIMEOUT_MS is 3000", () => {
    expect(DWELL_TIMEOUT_MS).toBe(3000);
  });

  it("BATCH_SESSION_DEAD_THRESHOLD is 2", () => {
    expect(BATCH_SESSION_DEAD_THRESHOLD).toBe(2);
  });

  it("HEALTH_CAP is strictly greater than TARGET_CAP", () => {
    expect(KEYWORD_RUN_HEALTH_CAP).toBeGreaterThan(KEYWORD_RUN_TARGET_CAP);
  });
});
