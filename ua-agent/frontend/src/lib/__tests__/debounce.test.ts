import { describe, expect, it } from "vitest";

import { createCooldown } from "../debounce";

describe("createCooldown", () => {
  it("invokes fn on first call and skips while in cooldown", () => {
    let now = 0;
    const cd = createCooldown(1000, () => now);
    expect(cd.tryRun(() => "first")).toBe("first");
    now = 500;
    expect(cd.tryRun(() => "second")).toBe(false);
    expect(cd.inCooldown()).toBe(true);
  });

  it("allows next invocation after cooldown elapses", () => {
    let now = 0;
    const cd = createCooldown(1000, () => now);
    expect(cd.tryRun(() => 1)).toBe(1);
    now = 1100;
    expect(cd.inCooldown()).toBe(false);
    expect(cd.tryRun(() => 2)).toBe(2);
  });

  it("reports remainingMs while in cooldown", () => {
    let now = 0;
    const cd = createCooldown(1000, () => now);
    cd.tryRun(() => undefined);
    now = 250;
    expect(cd.remainingMs()).toBe(750);
  });
});
