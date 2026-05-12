/**
 * Profile-page DOM contract for 博主分析 (Douyin blogger analysis).
 *
 * Mirrors the design of `douyinSearchDom.ts` — every selector is encapsulated
 * here as a candidate list (`first-match wins`) so a future Douyin DOM revamp
 * is a one-file change. Entry points:
 *
 *   - `readDouyinProfile(page)`     — header info: avatar, name, douyin_id,
 *                                     follow / fans / liked counts, signature
 *   - `scrollWorksToBottom(page,…)` — repeated scroll until the works grid
 *                                     stops growing
 *   - `extractAllWorks(page)`       — read every video card href + title
 *
 * REVISIT ON DOM REVAMP: every constant under `LOCATORS` and every selector
 * embedded in a `page.evaluate(() => …)` lambda must be re-validated.
 */

import { canonicalizeDouyinUrl } from "./url";

import { parseFollowerStat, parseStat, type DomEvaluator } from "./douyinSearchDom";

const LOCATORS = {
  // The big avatar image inside the profile header.
  avatarCandidates: [
    '[data-e2e="user-avatar"] img',
    '[class*="avatar"] img',
    "header img",
  ],
  // Container of the works grid (the user's posted videos).
  worksGridContainerCandidates: [
    '[data-e2e="user-post-list"]',
    '[data-e2e="user-tab-content"]',
    'ul[class*="user-post"]',
    'div[class*="user-post"]',
    'div[class*="user-tab"]',
  ],
  // Each card inside the works grid; we look for anchors that link to a video.
  workCardAnchorCandidates: [
    '[data-e2e="user-post-item"] a[href*="/video/"]',
    'li a[href*="/video/"]',
    'a[href*="/video/"]',
  ],
} as const;

// ─── readDouyinProfile ────────────────────────────────────────────────────

export interface DouyinProfileFields {
  display_name: string | null;
  avatar_url: string | null;
  /** Public 抖音号 (e.g. "abc123") if shown next to the name. */
  douyin_id: string | null;
  follow_count: number | null;
  fans_count: number | null;
  liked_count: number | null;
  signature: string | null;
  /** Extracted from `location.pathname` (`/user/<sec_uid>`). */
  sec_uid: string | null;
  /** Best-effort dump of every label/value pair we recognised, for debugging. */
  raw: Record<string, string>;
}

interface RawProfileExtract {
  display_name: string | null;
  avatar_url: string | null;
  douyin_id: string | null;
  signature: string | null;
  sec_uid: string | null;
  follow_text: string | null;
  fans_text: string | null;
  liked_text: string | null;
  raw: Record<string, string>;
}

export async function readDouyinProfile<E extends DomEvaluator<RawProfileExtract>>(
  page: E,
): Promise<DouyinProfileFields> {
  const raw = await page.evaluate(() => {
    function txt(el: Element | null): string | null {
      if (el === null) return null;
      const t = (el.textContent ?? "").replace(/\s+/g, " ").trim();
      return t.length === 0 ? null : t;
    }
    function firstNonEmpty(...vals: Array<string | null | undefined>): string | null {
      for (const v of vals) {
        if (typeof v === "string") {
          const t = v.trim();
          if (t.length > 0) return t;
        }
      }
      return null;
    }

    // Avatar — Douyin renders MANY `[data-e2e="live-avatar"]` instances on a
    // profile page (the page header has the logged-in user's own avatar, the
    // recommended-creators sidebar has more). The blogger's profile avatar is
    // always the *largest visible* one, so collect every candidate and pick
    // the one with the biggest rendered area. Candidates:
    //   - <span data-e2e="live-avatar"><img …></span>
    //   - <… data-e2e="user-avatar"> nested img
    //   - any <img alt="…头像"> (alt text always ends in "头像" for avatars)
    let avatar_url: string | null = null;
    {
      const candidateSet = new Set<HTMLImageElement>();
      for (const sel of [
        '[data-e2e="live-avatar"] img',
        '[data-e2e="user-avatar"] img',
        'img[alt$="头像"]',
      ]) {
        for (const el of document.querySelectorAll<HTMLImageElement>(sel)) {
          candidateSet.add(el);
        }
      }
      let bestArea = 0;
      let bestSrc: string | null = null;
      for (const img of candidateSet) {
        const r = img.getBoundingClientRect();
        const area = r.width * r.height;
        if (area <= bestArea) continue;
        const src = img.currentSrc || img.src || img.getAttribute("src");
        if (typeof src !== "string" || src.length === 0) continue;
        bestArea = area;
        bestSrc = src;
      }
      if (bestSrc !== null) avatar_url = bestSrc;
    }

    // Display name
    const nameSelectors = [
      '[data-e2e="user-name"]',
      '[data-e2e="user-info"] h1',
      'h1[class*="nickname"]',
      'h1[class*="name"]',
      'div[class*="nickname"]',
      "header h1",
      "h1",
    ];
    let display_name: string | null = null;
    for (const sel of nameSelectors) {
      const t = txt(document.querySelector(sel));
      if (t !== null) {
        display_name = t;
        break;
      }
    }

    // 抖音号 — look for a node whose text starts with "抖音号" or "Douyin ID".
    let douyin_id: string | null = null;
    {
      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>(
          'div, span, p, [class*="account"], [data-e2e*="account"]',
        ),
      );
      for (const el of candidates) {
        const t = (el.textContent ?? "").replace(/\s+/g, " ").trim();
        if (t.length === 0 || t.length > 200) continue;
        // Match: "抖音号: xxx", "抖音号：xxx", "Douyin ID: xxx", "ID: xxx"
        const m = t.match(/(?:抖音号|Douyin\s*ID|ID)\s*[:：]\s*([\w.-]+)/i);
        if (m !== null && m[1] !== undefined) {
          douyin_id = m[1];
          break;
        }
      }
    }

    // Signature — Douyin truncates long bios with a 「更多」 affordance. The
    // handler hovers it BEFORE calling this fn (see expandBioIfTruncated)
    // and tags the affordance with `data-bio-more-marker="1"`. After the
    // hover, the full bio appears as a <p> near that marker — usually a
    // sibling of the marker's parent <div>. We walk up to 4 ancestors from
    // the marker and pick the first <p> with substantial visible text.
    let signature: string | null = null;
    {
      const marker = document.querySelector<HTMLElement>('[data-bio-more-marker="1"]');
      if (marker !== null) {
        let ancestor: HTMLElement | null = marker.parentElement;
        for (let i = 0; i < 4 && ancestor !== null; i++) {
          for (const p of Array.from(ancestor.querySelectorAll<HTMLElement>("p"))) {
            const text = (p.textContent ?? "").replace(/\s+/g, " ").trim();
            if (text.length < 2 || text.length > 2000) continue;
            if (text === "更多" || text === "展开" || text === "收起") continue;
            const r = p.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            signature = text;
            break;
          }
          if (signature !== null) break;
          ancestor = ancestor.parentElement;
        }
      }
    }

    // Fallback selector list — if no marker was tagged (no 「更多」 button) or
    // the marker walk found nothing, try common bio container selectors.
    if (signature === null) {
      const signatureSelectors = [
        '[data-e2e="user-info-desc"]',
        '[data-e2e="user-bio"]',
        '[data-e2e="user-info-bio"]',
        '[data-e2e="user-introduction"]',
        '[data-e2e="profile-introduction"]',
        '[class*="signature"]',
        '[class*="user-desc"]',
        '[class*="bio"]',
        '[class*="introduction"]',
        'p[class*="desc"]',
      ];
      for (const sel of signatureSelectors) {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          const t = txt(el);
          if (t === null) continue;
          if (t === "更多" || t === "展开" || t === "收起") continue;
          if (t.length < 2 || t.length > 2000) continue;
          signature = t;
          break;
        }
        if (signature !== null) break;
      }
    }

    // sec_uid from URL
    let sec_uid: string | null = null;
    {
      const m = window.location.pathname.match(/^\/user\/([^/?#]+)/);
      if (m !== null && m[1] !== undefined) sec_uid = m[1];
    }

    // Stats — prefer exact `data-e2e` stat blocks when available. The earlier
    // implementation flattened every leaf text in document order and paired
    // adjacent number/label tokens globally, which mis-read:
    //   关注 44 粉丝 427.3万 ...
    // as `粉丝 = 44` because "44" sat next to the next block's label. Keep
    // pairing scoped to a single stat container so sibling blocks cannot
    // cross-contaminate one another.
    let follow_text: string | null = null;
    let fans_text: string | null = null;
    let liked_text: string | null = null;
    {
      const numRe = /^[\d.,]+\s*(?:万|亿|w|k|千)?$/i;
      const statLabels = new Set(["关注", "粉丝", "获赞"]);

      function leafTexts(root: ParentNode): string[] {
        const out: string[] = [];
        for (const el of Array.from(root.querySelectorAll<HTMLElement>("*"))) {
          if (el.children.length !== 0) continue;
          const t = (el.textContent ?? "").replace(/\s+/g, " ").trim();
          if (t.length > 0) out.push(t);
        }
        return out;
      }

      function readStatNumber(root: Element | null): string | null {
        if (root === null) return null;
        const directChildren = Array.from(root.children);
        for (const el of directChildren) {
          const t = txt(el);
          if (t !== null && numRe.test(t)) return t;
        }
        for (const t of leafTexts(root)) {
          if (numRe.test(t)) return t;
        }
        return null;
      }

      function assignStat(label: string, value: string | null): void {
        if (value === null) return;
        if (label === "关注" && follow_text === null) follow_text = value;
        else if (label === "粉丝" && fans_text === null) fans_text = value;
        else if (label === "获赞" && liked_text === null) liked_text = value;
      }

      const exactStatSelectors: Array<[string, string]> = [
        ['[data-e2e="user-info-follow"]', "关注"],
        ['[data-e2e="user-info-fans"]', "粉丝"],
        ['[data-e2e="user-info-like"]', "获赞"],
      ];
      for (const [selector, label] of exactStatSelectors) {
        assignStat(label, readStatNumber(document.querySelector(selector)));
      }

      if (follow_text === null || fans_text === null || liked_text === null) {
        const labelEls = Array.from(document.querySelectorAll<HTMLElement>("body *")).filter((el) => {
          const t = txt(el);
          return t !== null && statLabels.has(t);
        });
        for (const labelEl of labelEls) {
          const label = txt(labelEl);
          if (label === null) continue;
          let scope: HTMLElement | null = labelEl.parentElement;
          for (let depth = 0; depth < 4 && scope !== null; depth++) {
            const labelsInScope = leafTexts(scope).filter((t) => statLabels.has(t));
            if (labelsInScope.length === 1 && labelsInScope[0] === label) {
              assignStat(label, readStatNumber(scope));
              break;
            }
            scope = scope.parentElement;
          }
        }
      }
    }

    const raw: Record<string, string> = {};
    if (display_name !== null) raw["display_name"] = display_name;
    if (avatar_url !== null) raw["avatar_url"] = avatar_url;
    if (douyin_id !== null) raw["douyin_id"] = douyin_id;
    if (signature !== null) raw["signature"] = signature;
    if (sec_uid !== null) raw["sec_uid"] = sec_uid;
    if (follow_text !== null) raw["follow_text"] = follow_text;
    if (fans_text !== null) raw["fans_text"] = fans_text;
    if (liked_text !== null) raw["liked_text"] = liked_text;

    return {
      display_name: firstNonEmpty(display_name),
      avatar_url: firstNonEmpty(avatar_url),
      douyin_id: firstNonEmpty(douyin_id),
      signature: firstNonEmpty(signature),
      sec_uid: firstNonEmpty(sec_uid),
      follow_text: firstNonEmpty(follow_text),
      fans_text: firstNonEmpty(fans_text),
      liked_text: firstNonEmpty(liked_text),
      raw,
    };
  });

  // Convert -1 (parseStat's "unparseable") to null so the DB / UI treat it as
  // "unknown" rather than as a literal -1 count.
  const parseOrNull = (s: string | null, isFollower: boolean): number | null => {
    if (s === null) return null;
    const v = isFollower ? parseFollowerStat(s) : parseStat(s);
    return v < 0 ? null : v;
  };

  return {
    display_name: raw.display_name,
    avatar_url: raw.avatar_url,
    douyin_id: raw.douyin_id,
    signature: raw.signature,
    sec_uid: raw.sec_uid,
    follow_count: parseOrNull(raw.follow_text, false),
    fans_count: parseOrNull(raw.fans_text, true),
    liked_count: parseOrNull(raw.liked_text, false),
    raw: raw.raw,
  };
}

// ─── scrollWorksToBottom ──────────────────────────────────────────────────

export interface ScrollWorksOptions {
  /** Hard cap on total scrolls (defence against infinite loops). Default 500. */
  hardCap?: number;
  /** Fired after each scroll. */
  onProgress?: (p: { scrolls: number; cards: number }) => void;
  /** Wait between scrolls (ms). Default 700. */
  scrollDelayMs?: number;
  /**
   * Optional real-keyboard scroll kicker. When provided, called after each
   * `performScroll` so a trusted `End` key press supplements the
   * programmatic scroll. Required on Douyin profile pages: the works grid
   * lazy-loads via IntersectionObserver bound to a virtualised scroll
   * container that programmatic `window.scrollTo` does not always reach,
   * so the JS-only path can leave card-count flat indefinitely. Wire as
   * `pressEnd: () => port.pressKey('End')` from the handler.
   */
  pressEnd?: () => Promise<void>;
}

export interface ScrollWorksResult {
  totalScrolls: number;
  finalCardCount: number;
  reachedBottom: boolean;
}

interface ScrollProbe {
  cards: number;
  height: number;
}

/**
 * Inlined into every `page.evaluate(...)` call below. Each evaluate is its
 * own JS context so we can't share code by reference — concatenating this
 * string preamble is the cleanest way to share a single source of truth for
 * the works-grid detection heuristic.
 *
 * Logic: Douyin profile pages render BOTH the user's works grid (the area we
 * want) AND a recommendations sidebar that contains other `/video/` links.
 * If we naively `querySelectorAll('a[href*="/video/"]')` on `document`, the
 * sidebar's links get mixed into the sample. To scope correctly we look for
 * the element whose *direct children* include the most descendants matching
 * `a[href*="/video/"]` — that's the actual grid wrapper, since each child is
 * one card. The sidebar wrapper has a different structure and loses.
 *
 * Falls back to `null` if no clear winner — caller should treat that as
 * "scope to document with a warning" rather than silently sweeping the page.
 */
const FIND_WORKS_GRID_FN = `
function __findWorksGrid() {
  // Strong selector tier — known data-e2e attrs.
  for (const sel of ['[data-e2e="user-post-list"]', '[data-e2e="user-tab-content"]']) {
    const el = document.querySelector(sel);
    if (el !== null) return el;
  }
  // Heuristic tier — element with most card-shaped direct children.
  const candidates = document.querySelectorAll('div, ul, section, main');
  let best = null;
  let bestCount = 0;
  for (const el of candidates) {
    let count = 0;
    for (const child of el.children) {
      if (child.querySelector('a[href*="/video/"]') !== null) count++;
    }
    if (count > bestCount) {
      bestCount = count;
      best = el;
    }
  }
  // Demand at least 4 card-children to call it a grid; otherwise the page
  // probably hasn't loaded works yet (or this user has no posts).
  return bestCount >= 4 ? best : null;
}
`;

/**
 * Body of the probe function evaluated in the page context.
 *
 * Reads:
 *   - `cards`: count of `<a href*="/video/">` inside the works grid.
 *   - `height`: documentElement.scrollHeight, for diagnostic logging.
 *   - `reachedEnd`: true iff the end-of-feed sentinel ("暂时没有更多了" /
 *     variants) is rendered as a *visible* text node inside the works-grid
 *     subtree. The earlier naive walk over `document.body` false-positived
 *     on i18n string literals embedded in `<script>` bundles (Douyin ships
 *     '没有更多了' inside its renderer chunks) and on phrases inside the
 *     recommendations sidebar — both made the very first probe return
 *     `reachedEnd=true`, so `scrollWorksToBottom` would skip every scroll.
 *
 * Suppression rules:
 *   1. If `grid === null` → cards=0, reachedEnd=false. Pre-load DOMs always
 *      fall through so the loop performs at least one scroll.
 *   2. Walker scope is `grid.parentElement` (covers sentinels rendered as a
 *      sibling-of-grid footer), never `document.body`.
 *   3. Skip text nodes whose ancestor chain contains `<script>`, `<style>`,
 *      `<noscript>`, or `<template>` — those are never visible UI.
 *   4. Require `display !== 'none' && visibility !== 'hidden'` on every
 *      ancestor of the matched text node.
 *
 * Exported (alongside `FIND_WORKS_GRID_FN`) so a jsdom unit test can rebuild
 * the same function via `new Function(...)` and exercise the suppression
 * rules without spinning up patchright.
 */
export const SCROLL_PROBE_FN_BODY = `${FIND_WORKS_GRID_FN}
const grid = __findWorksGrid();
const cards = grid !== null
  ? grid.querySelectorAll('a[href*="/video/"]').length
  : 0;
let reachedEnd = false;
if (grid !== null && cards > 0) {
  const endPhrases = ['暂时没有更多了', '没有更多了', '已经到底了', '已加载全部'];
  const scope = grid.parentElement || grid;
  function __isVisible(el) {
    let cur = el;
    while (cur && cur.nodeType === 1) {
      const tag = cur.tagName.toLowerCase();
      if (tag === 'script' || tag === 'style' || tag === 'noscript' || tag === 'template') return false;
      const cs = window.getComputedStyle(cur);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      cur = cur.parentElement;
    }
    return true;
  }
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode()) !== null) {
    const t = (node.textContent || '').replace(/\\s+/g, '').trim();
    if (t.length === 0 || t.length > 50) continue;
    let matched = false;
    for (const p of endPhrases) {
      if (t.indexOf(p) !== -1) { matched = true; break; }
    }
    if (!matched) continue;
    if (!__isVisible(node.parentElement)) continue;
    reachedEnd = true;
    break;
  }
}
return { cards, height: document.documentElement.scrollHeight, reachedEnd };
`;

/**
 * Plateau threshold — exit after this many consecutive non-growing scrolls.
 *
 * The user-facing requirement is "scroll until '暂时没有更多了' is visible".
 * Plateau is the safety net for cases where the sentinel phrase has been
 * rebranded by Douyin and our `endPhrases` no longer match — without it the
 * loop would run for `hardCap × scrollDelayMs` (default ≈ 5.8 min) before
 * giving up. Earlier value of 5 fired too aggressively when network was
 * slow (a single sluggish lazy-load batch already burns 3-4 scrolls);
 * 15 ≈ 10s of no card-count growth is well past that envelope while still
 * bailing out reasonably fast on a fundamentally-broken scroll path.
 */
const PLATEAU_LIMIT = 15;

export async function scrollWorksToBottom<
  E extends DomEvaluator<ScrollProbe> & DomEvaluator<void>,
>(page: E, opts: ScrollWorksOptions = {}): Promise<ScrollWorksResult> {
  const hardCap = opts.hardCap ?? 500;
  const delay = opts.scrollDelayMs ?? 700;

  const probe = async (): Promise<ScrollProbe & { reachedEnd: boolean }> =>
    (page as unknown as DomEvaluator<ScrollProbe & { reachedEnd: boolean }>).evaluate(
      // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
      new Function(SCROLL_PROBE_FN_BODY) as () => ScrollProbe & { reachedEnd: boolean },
    );

  // performScroll drives the works grid toward its end. The earlier version
  // relied on `window.scrollTo({top: scrollHeight})` plus a few hand-picked
  // inner-container selectors; on the Douyin profile that combination was a
  // visible no-op (the real scroll container does not match
  // `[class*="scroll-list"]` and the `<body>` itself is not scrollable when
  // an internal panel handles overflow). Switch to `scrollIntoView` on the
  // last card — the browser walks up to the nearest scrollable ancestor and
  // moves it natively, so we don't need to know which element scrolls. The
  // `window.scrollBy` is kept as a minor kick for layouts that DO scroll the
  // body, and the handler additionally presses `End` (real isTrusted key
  // event) via `opts.pressEnd` to nudge IO observers that gate on
  // user-driven scroll deltas.
  const performScroll = async (): Promise<void> => {
    await (page as DomEvaluator<void>).evaluate(
      // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
      new Function(`${FIND_WORKS_GRID_FN}
        const grid = __findWorksGrid();
        if (grid !== null) {
          const cards = grid.querySelectorAll('a[href*="/video/"]');
          if (cards.length > 0) {
            cards[cards.length - 1].scrollIntoView({ block: 'end', behavior: 'instant' });
          }
        }
        window.scrollBy(0, Math.max(800, window.innerHeight * 0.9));
      `) as () => void,
    );
    if (opts.pressEnd !== undefined) {
      try {
        await opts.pressEnd();
      } catch {
        // Best-effort. Some patchright builds don't expose keyboard on the
        // wrapper; the JS-only scroll above is still in effect.
      }
    }
  };

  // Check before scrolling — short profiles may already show the sentinel.
  // Note: probe suppresses reachedEnd when cards===0, so a fresh navigation
  // (grid not yet loaded) will always fall through to the scroll loop.
  const initial = await probe();
  let lastCards = initial.cards;
  if (initial.reachedEnd) {
    return { totalScrolls: 0, finalCardCount: lastCards, reachedBottom: true };
  }

  let scrolls = 0;
  let reachedBottom = false;
  let plateau = 0;
  while (scrolls < hardCap) {
    await performScroll();
    await new Promise((r) => setTimeout(r, delay));
    scrolls++;
    const probed = await probe();
    if (opts.onProgress !== undefined) {
      opts.onProgress({ scrolls, cards: probed.cards });
    }
    if (probed.reachedEnd) {
      lastCards = probed.cards;
      reachedBottom = true;
      break;
    }
    // Plateau exit — fallback when sentinel never appears (DOM revamp,
    // empty profiles, build using an unfamiliar end-marker). After
    // PLATEAU_LIMIT scrolls without card growth we trust card-count
    // stability and stop. lastCards uses the pre-update value so the
    // first non-growing scroll counts as plateau=1.
    if (probed.cards <= lastCards) {
      plateau++;
      if (plateau >= PLATEAU_LIMIT) {
        lastCards = probed.cards;
        reachedBottom = true;
        break;
      }
    } else {
      plateau = 0;
    }
    lastCards = probed.cards;
  }
  return {
    totalScrolls: scrolls,
    finalCardCount: lastCards,
    reachedBottom,
  };
}

// Exported for the extract path so both probe + extract agree on the grid.
export { FIND_WORKS_GRID_FN };

// ─── extractAllWorks ──────────────────────────────────────────────────────

export interface ExtractedWork {
  /** Canonical video URL (`https://www.douyin.com/video/<aweme_id>`). */
  url: string;
  /** Best-effort title; null if no readable text/alt was present. */
  title: string | null;
  /** Original index in the works grid order, before dedup. */
  index: number;
}

interface RawWorkExtract {
  href: string;
  title: string | null;
  index: number;
}

export async function extractAllWorks<E extends DomEvaluator<RawWorkExtract[]>>(
  page: E,
): Promise<ExtractedWork[]> {
  const raw = await page.evaluate(
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    new Function(`${FIND_WORKS_GRID_FN}
      const grid = __findWorksGrid();
      // Strict: when the grid wasn't found, return [] rather than scoping to
      // \`document\` (which would mix in sidebar recommendations).
      if (grid === null) return [];
      const anchors = Array.from(grid.querySelectorAll('a[href*="/video/"]'));
      const out = [];
      let idx = 0;
      for (const a of anchors) {
        const href = a.href || a.getAttribute('href') || '';
        if (typeof href !== 'string' || href.length === 0) continue;
        let title = null;
        const aria = a.getAttribute('aria-label');
        if (aria !== null && aria.trim().length > 0) title = aria.trim();
        if (title === null) {
          const t = a.getAttribute('title');
          if (t !== null && t.trim().length > 0) title = t.trim();
        }
        if (title === null) {
          const img = a.querySelector('img');
          if (img !== null) {
            const alt = img.getAttribute('alt');
            if (alt !== null && alt.trim().length > 0) title = alt.trim();
          }
        }
        if (title === null) {
          const t = (a.textContent || '').replace(/\\s+/g, ' ').trim();
          if (t.length > 0) title = t;
        }
        out.push({ href, title, index: idx });
        idx++;
      }
      return out;
    `) as () => RawWorkExtract[],
  );

  // Canonicalise + dedup by canonical URL, preserving first-seen order.
  const seen = new Set<string>();
  const out: ExtractedWork[] = [];
  for (const r of raw) {
    const canon = canonicalizeDouyinUrl(r.href);
    if (canon === null) continue;
    if (seen.has(canon.url)) continue;
    seen.add(canon.url);
    out.push({ url: canon.url, title: r.title, index: out.length });
  }
  return out;
}

// Re-export so handlers can import everything from one module.
export { LOCATORS };

// ─── expandBioIfTruncated ────────────────────────────────────────────────

/** Pieces of the patchright session we need to drive a real, isTrusted hover
 *  with multi-step mouse motion (matches the pattern the XHS keyword crawl
 *  uses for hover-gated popups in `runtimeContext.ts`). */
export interface BioHoverOps {
  evaluate<T>(fn: () => T | Promise<T>): Promise<T>;
  hover(sel: string, options?: { timeout?: number }): Promise<void>;
  mouseMove(x: number, y: number, options?: { steps?: number }): Promise<void>;
  bringToFront(): Promise<void>;
  sleep(ms: number): Promise<void>;
}

interface MoreTagResult {
  found: boolean;
  rect: { x: number; y: number; w: number; h: number } | null;
  matchedText: string | null;
}

/**
 * If the profile bio is truncated with a 「更多」 affordance, hover that
 * affordance so the popover containing the full text mounts. Subsequent
 * `readDouyinProfile()` will then prefer the popover text over the inline
 * truncated text.
 *
 * Three things this gets right that a naive `page.hover(selector)` does not:
 *  1. **Tag-then-hover** — patchright needs a stable CSS selector, so we tag
 *     the element with `data-bio-more-marker="1"` via `evaluate()` first.
 *  2. **bringToFront** — Douyin popovers gate on `document.hasFocus()`; if
 *     the user is on terminal/IDE the popup silently never mounts.
 *  3. **mouseMove with steps** — single-jump hover is dropped by listeners
 *     that watch for continuous movement. We follow up the trusted hover
 *     with an 8-step mouseMove to the element centre.
 *
 * Best-effort; returns `{found, hovered}` so the caller can log diagnostics.
 */
export async function expandBioIfTruncated(
  ops: BioHoverOps,
): Promise<{ found: boolean; hovered: boolean; matchedText: string | null }> {
  const tag: MoreTagResult = await ops.evaluate(() => {
    // Loose match: text equals or ends with one of these labels.
    const exact = ["更多", "展开", "More", "查看更多"];
    const endsWith = ["更多", "展开"];
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>("span, a, button, div, p"),
    );
    for (const el of candidates) {
      const t = (el.textContent ?? "").replace(/\s+/g, "").trim();
      if (t.length === 0 || t.length > 10) continue;
      const matches =
        exact.includes(t) || endsWith.some((suffix) => t.endsWith(suffix));
      if (!matches) continue;
      // Skip wrappers — only leaf-ish elements.
      if (el.children.length > 2) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      el.setAttribute("data-bio-more-marker", "1");
      el.scrollIntoView({ block: "center" });
      const r2 = el.getBoundingClientRect();
      return {
        found: true,
        rect: { x: r2.left, y: r2.top, w: r2.width, h: r2.height },
        matchedText: t,
      };
    }
    return { found: false, rect: null, matchedText: null };
  });
  if (!tag.found) return { found: false, hovered: false, matchedText: null };

  try {
    await ops.bringToFront();
    await ops.hover('[data-bio-more-marker="1"]', { timeout: 2000 });
    if (tag.rect !== null) {
      const cx = tag.rect.x + tag.rect.w / 2;
      const cy = tag.rect.y + tag.rect.h / 2;
      // Multi-step movement — see comment above; popovers debounce
      // single-jump mouseenter events.
      await ops.mouseMove(cx, cy, { steps: 8 });
    }
    // Popover mount / animation settle. 1500ms is generous; some Douyin
    // builds animate the popover in over ~600ms.
    await ops.sleep(1500);
    return { found: true, hovered: true, matchedText: tag.matchedText };
  } catch {
    return { found: true, hovered: false, matchedText: tag.matchedText };
  }
}
