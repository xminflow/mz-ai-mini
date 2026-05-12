/**
 * Runtime constants — see specs/004-douyin-keyword-crawl/research.md Decision 13.
 * Each value is referenced by spec FRs; tweaks must update the spec first.
 */

export const KEYWORD_RUN_TARGET_CAP = 50;
export const KEYWORD_RUN_HEALTH_CAP = 200;
export const INTER_CARD_MIN_INTERVAL_MS = 1500;
export const CONSECUTIVE_ERROR_THRESHOLD = 5;
export const LAYOUT_SWITCH_TIMEOUT_MS = 5000;
export const DWELL_TIMEOUT_MS = 3000;
export const BATCH_SESSION_DEAD_THRESHOLD = 2;

// F-key author-card lookup (ratio filter step). The card mounts inside ~1s
// on a warm session but can take longer on first lookup or when the author
// avatar / name still need a roundtrip. Bumped to 5s after observing the
// poll race past the card on slower navigations. ESC closes the card near
// instantly. The settle delay is the gap between sending F and the first
// poll — large enough that the press has time to dispatch but small enough
// that we don't lengthen the per-video iteration time meaningfully.
export const AUTHOR_CARD_OPEN_TIMEOUT_MS = 5000;
export const AUTHOR_CARD_READ_TIMEOUT_MS = 10000;
export const AUTHOR_CARD_CLOSE_TIMEOUT_MS = 1000;
export const AUTHOR_CARD_SETTLE_MS = 400;

// 006 — XHS click-into-card crawl loop timings. Ported from the orphan
// utility/xhs-keyword-crawl/domain/runtime.ts.

/**
 * Time budget for the XHS masonry container + first card to mount after
 * navigation. Bumped from 5s to 15s — XHS frequently runs anti-bot JS
 * challenges and lazy-loads the feed several seconds after DOMContentLoaded
 * (the `goto`'s waitUntil), and a 5s budget timed out before the masonry
 * had a chance to render on slower networks / first-after-cold-start pages.
 */
export const LAYOUT_PROBE_TIMEOUT_MS = 15000;

/** Time budget for the XHS detail overlay root to appear after a card click. */
export const DETAIL_OPEN_TIMEOUT_MS = 4000;

/** Time budget for the XHS detail overlay to disappear after pressing Escape. */
export const DETAIL_CLOSE_TIMEOUT_MS = 3000;

/** Time budget for new XHS cards to appear after scrolling to bottom. */
export const LOAD_MORE_TIMEOUT_MS = 5000;

/** Consecutive scroll-loads with no new cards before declaring `end-of-results`. */
export const NO_GROWTH_SCROLL_THRESHOLD = 3;

/** Polling interval when waiting for XHS overlay open/close or load-more. */
export const POLL_INTERVAL_MS = 200;

// 006-2 — XHS like/follower ratio filter: hover author avatar → wait for
// user-info popup → read 粉丝. The popup mounts within ~300ms on warm
// sessions but the follower count lazy-fills after; budget 4s like the
// detail-open path. Settle is the gap between dispatching hover and the
// first poll, large enough that the pointer event has actually traveled
// to the renderer.
/** Time budget for the XHS user-info hover card to appear with 粉丝 filled. */
export const USER_HOVER_CARD_OPEN_TIMEOUT_MS = 4000;
/** Settle gap between dispatching the hover and the first hover-card poll. */
export const USER_HOVER_CARD_SETTLE_MS = 250;
