/**
 * Cooldown helper used by FR-022b (the wizard's "重新检测" button) and any
 * future renderer-side throttle. Pure JS — no React.
 *
 * The returned controller exposes:
 *   - `tryRun(fn)`: invoke `fn()` if not in cooldown; otherwise no-op + return false.
 *   - `inCooldown()`: synchronous boolean for UI hints ("1 秒后可重试").
 *   - `reset()`: clear cooldown immediately (test/debug only).
 */

export interface CooldownController {
  tryRun: <T>(fn: () => T) => T | false;
  inCooldown: () => boolean;
  reset: () => void;
  remainingMs: () => number;
}

export function createCooldown(cooldownMs: number, now: () => number = Date.now): CooldownController {
  let lastRunAt: number | null = null;
  return {
    tryRun: <T>(fn: () => T): T | false => {
      if (lastRunAt !== null && now() - lastRunAt < cooldownMs) return false;
      lastRunAt = now();
      return fn();
    },
    inCooldown: () => lastRunAt !== null && now() - lastRunAt < cooldownMs,
    reset: () => {
      lastRunAt = null;
    },
    remainingMs: () => (lastRunAt === null ? 0 : Math.max(0, cooldownMs - (now() - lastRunAt))),
  };
}
