/**
 * Stratified random sampling.
 *
 * Splits `items` into `k` evenly-sized buckets and picks one random element
 * from each. The result is `k` items in source order, evenly covering the
 * full range while still being non-deterministic within each bucket.
 *
 * Edge cases:
 *   - empty input  → []
 *   - len <= k     → original array (clone) — no sampling needed
 *   - k = 1        → one random pick from the whole array
 *
 * Throws when `k <= 0`.
 *
 * `rng` defaults to `Math.random`; tests inject a seeded LCG for determinism.
 */
export function stratifiedSample<T>(
  items: readonly T[],
  k: number,
  rng: () => number = Math.random,
): T[] {
  if (!Number.isInteger(k) || k <= 0) {
    throw new Error(`stratifiedSample: k must be a positive integer (got ${k})`);
  }
  const n = items.length;
  if (n === 0) return [];
  if (n <= k) return items.slice();

  const out: T[] = [];
  for (let i = 0; i < k; i++) {
    const lo = Math.floor((i * n) / k);
    const hi = Math.floor(((i + 1) * n) / k);
    // bucket size ≥ 1 because n > k ⇒ hi > lo for every i
    const idx = lo + Math.floor(rng() * (hi - lo));
    out.push(items[idx] as T);
  }
  return out;
}
