/**
 * XHS-specific DOM helpers, all running inside the patchright page context
 * via `evaluate(fn)`. Selectors are tightly scoped at the top of the file
 * (`REVISIT-ON-DOM-REVAMP` constants) — when the XHS site re-skins, this
 * file is the only thing that should need to change.
 *
 * The crawl loop pattern: enumerate cards in the masonry → classify them
 * by type → open the matching ones via DOM click → extract full metadata
 * from the detail overlay → close the overlay → advance to the next
 * un-visited card → scroll to load more when at the end.
 */

interface DomEvaluator {
  evaluate<T>(fn: () => T | Promise<T>): Promise<T>;
}

// ─── REVISIT-ON-DOM-REVAMP — selectors and shape constants ────────────────

const SEL_MASONRY_CONTAINER = ".feeds-container, .feeds-page, [class*='feeds-container']";
const SEL_CARD = "section.note-item, [class*='note-item']";
const SEL_CARD_LINK = "a.cover, a[href*='/explore/'], a[href*='/discovery/item/']";
const SEL_CARD_VIDEO_BADGE = "[class*='play-icon'], [class*='video-icon'], svg[class*='play']";
const SEL_CARD_LIVESTREAM_BADGE = "[class*='live-card'], [class*='live-icon']";
const SEL_CARD_AD_MARKER = "[class*='ads-card'], [class*='advertise']";

const SEL_DETAIL_OVERLAY = ".note-detail-mask, [class*='note-detail-mask']";
const SEL_DETAIL_CONTAINER = "#noteContainer, .note-container, [class*='note-container']";
const SEL_DETAIL_VIDEO = "video[src], xg-video-container video, [class*='video-container'] video";
const SEL_DETAIL_IMAGE_GRID = ".swiper-wrapper img, [class*='note-slider'] img";
const SEL_DETAIL_CAPTION = "#detail-desc, .note-content .desc, [class*='note-content'] .desc";
const SEL_DETAIL_TITLE = "#detail-title, .title, [class*='note-content'] .title";
const SEL_DETAIL_AUTHOR_LINK = ".author-wrapper a.name, a.user-link, [class*='author'] .name";
const SEL_DETAIL_HASHTAG = ".note-content a[href*='/search_result?keyword=#'], [class*='hash-tag']";
const SEL_DETAIL_LIKE_BTN =
  ".buttons .like-wrapper, .interact-bar .like, [class*='like-wrapper']";
const SEL_DETAIL_COLLECT_BTN =
  ".buttons .collect-wrapper, .interact-bar .collect, [class*='collect-wrapper']";
const SEL_DETAIL_COMMENT_BTN =
  ".buttons .chat-wrapper, .interact-bar .comment, [class*='chat-wrapper']";
const SEL_DETAIL_CLOSE_BTN = ".close, .close-btn, [class*='close-circle'], svg.close";

// 006-2 — like/follower ratio filter for XHS. The modal's avatar block is
// rendered as `.avatar-click > .avatar-container > a > img.avatar-item`
// (older skins wrapped this in `.author-container`, which has been dropped).
// Hovering the 40×40 avatar IMG triggers XHS to mount a user-info popup at
// `body > .tooltip-container > .tooltip-content > .user-content > .container >
// .header-area`, which contains an `<a class="interaction">` whose
// `<span class="interaction-name">粉丝</span>` is followed by the count text
// (e.g. "8.8万", "1234").
//
// IMPORTANT: target the IMG specifically — earlier we hovered `.avatar-click`,
// but on the current skin that wrapper spans the whole author row (~399×80,
// avatar + name + follow button). patchright's hover() then aimed for the
// geometric center, which landed on the name/follow button instead of the
// avatar, and XHS's listener (bound to the avatar IMG only) never fired.
//
// We scope to `#noteContainer` / `.note-container` so masonry-card avatars
// don't get matched. Hover MUST be a real-pointer event (patchright's native
// page.hover) — synthetic mouseenter/pointerenter from `evaluate(...)` don't
// open the popup because XHS gates the listener behind `isTrusted`.
const SEL_DETAIL_AUTHOR_HOVER =
  "#noteContainer img.avatar-item, " +
  ".note-container img.avatar-item, " +
  "[class*='note-container'] img.avatar-item";

// ─── helpers shared between exports ──────────────────────────────────────

function parseStat(raw: string): number {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return 0;
  const lowered = trimmed.toLowerCase();
  // Common XHS shapes: "1.2万", "1.2w", "1234", "1.2万+", "k+ / w+ / 万+"
  const match = lowered.match(/^([0-9]+(?:\.[0-9]+)?)([万wk亿]?)\+?$/u);
  if (match === null) {
    const fallback = lowered.replace(/,/g, "");
    const n = Number(fallback);
    if (Number.isFinite(n)) return Math.round(n);
    return 0;
  }
  const num = parseFloat(match[1] ?? "0");
  const unit = match[2] ?? "";
  if (unit === "万" || unit === "w") return Math.round(num * 10_000);
  if (unit === "亿") return Math.round(num * 100_000_000);
  if (unit === "k") return Math.round(num * 1_000);
  return Math.round(num);
}

export async function applyPublishTimeFilter(
  evaluator: DomEvaluator,
  range: "all" | "day" | "week" | "half_year",
): Promise<boolean> {
  if (range === "all") return true;

  const desiredTimeLabel =
    range === "day" ? "一天内" : range === "week" ? "一周内" : "半年内";
  const desiredSortLabel = "最新";

  const injectFilterContext = new Function(
    `
    (window).__uaXhsFilterDesiredTimeLabel = ${JSON.stringify(desiredTimeLabel)};
    (window).__uaXhsFilterDesiredSortLabel = ${JSON.stringify(desiredSortLabel)};
  `,
  ) as () => void;
  await evaluator.evaluate<void>(injectFilterContext);

  return evaluator.evaluate<boolean>(async () => {
    const desiredTimeLabel =
      (
        window as Window & {
          __uaXhsFilterDesiredTimeLabel?: unknown;
        }
      ).__uaXhsFilterDesiredTimeLabel;
    const desiredSortLabel =
      (
        window as Window & {
          __uaXhsFilterDesiredSortLabel?: unknown;
        }
      ).__uaXhsFilterDesiredSortLabel;
    if (typeof desiredTimeLabel !== "string" || desiredTimeLabel.length === 0) {
      return false;
    }
    if (typeof desiredSortLabel !== "string" || desiredSortLabel.length === 0) {
      return false;
    }

    function textOf(el: Element | null): string {
      if (el === null) return "";
      return (el.textContent ?? "").replace(/\s+/g, "").trim();
    }

    function isVisible(el: HTMLElement | null): boolean {
      if (el === null) return false;
      if (el.getAttribute("aria-hidden") === "true") return false;
      const cs = window.getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") return false;
      if (Number.parseFloat(cs.opacity || "1") <= 0.02) return false;
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return true;
      return /jsdom/i.test(navigator.userAgent);
    }

    function clickLikeUser(el: HTMLElement): void {
      try {
        el.scrollIntoView({ block: "center", inline: "center" });
      } catch {
        /* jsdom / stale skins may not implement it */
      }
      el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
      el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
      el.click();
    }

    function setDiag(step: string, extra: Record<string, unknown> = {}): void {
      try {
        (window as unknown as { __uaXhsPublishTimeFilterDiag?: unknown }).__uaXhsPublishTimeFilterDiag =
          {
            step,
            desiredTimeLabel,
            desiredSortLabel,
            ...extra,
          };
      } catch {
        /* best effort */
      }
    }

    function isTagSelected(el: HTMLElement | null): boolean {
      if (el === null) return false;
      if (el.classList.contains("active")) return true;
      const markers = [
        el.getAttribute("aria-selected"),
        el.getAttribute("data-selected"),
        el.getAttribute("data-state"),
        el.getAttribute("data-status"),
        el.getAttribute("data-active"),
      ]
        .filter((value): value is string => value !== null)
        .map((value) => value.toLowerCase());
      return markers.some((value) =>
        value === "true" ||
        value === "1" ||
        value === "selected" ||
        value === "active" ||
        value === "on" ||
        value === "checked" ||
        value === "open",
      );
    }

    function readTagState(el: HTMLElement | null):
      | {
          className: string;
          ariaSelected: string | null;
          dataSelected: string | null;
          dataState: string | null;
          dataStatus: string | null;
          dataActive: string | null;
          styleKey: string;
        }
      | null {
      if (el === null) return null;
      const cs = window.getComputedStyle(el);
      return {
        className: el.className,
        ariaSelected: el.getAttribute("aria-selected"),
        dataSelected: el.getAttribute("data-selected"),
        dataState: el.getAttribute("data-state"),
        dataStatus: el.getAttribute("data-status"),
        dataActive: el.getAttribute("data-active"),
        styleKey: [cs.color, cs.backgroundColor, cs.fontWeight, cs.borderColor, cs.opacity].join(
          "|",
        ),
      };
    }

    function tagStateChanged(
      current: ReturnType<typeof readTagState>,
      before: ReturnType<typeof readTagState>,
    ): boolean {
      if (current === null) return true;
      if (before === null) return false;
      return (
        current.className !== before.className ||
        current.ariaSelected !== before.ariaSelected ||
        current.dataSelected !== before.dataSelected ||
        current.dataState !== before.dataState ||
        current.dataStatus !== before.dataStatus ||
        current.dataActive !== before.dataActive ||
        current.styleKey !== before.styleKey
      );
    }

    function rankInteractiveCandidate(el: HTMLElement): number {
      const cs = window.getComputedStyle(el);
      let score = 0;
      if (el.hasAttribute("data-hp-bound")) score += 200;
      if (!el.hasAttribute("button-hp-installed")) score += 80;
      if (isVisible(el)) score += 40;
      if (el.getAttribute("aria-hidden") === "true") score -= 200;
      if (el.tabIndex < 0) score -= 50;
      if (Number.parseFloat(cs.opacity || "1") <= 0.02) score -= 100;
      if (Number.parseInt(cs.zIndex || "0", 10) < 0) score -= 30;
      return score;
    }

    function findFilterButton(): HTMLElement | null {
      const candidates = Array.from(document.querySelectorAll<HTMLElement>(".filter"));
      const matches = candidates.filter((el) => textOf(el).includes("筛选"));
      matches.sort((a, b) => rankInteractiveCandidate(b) - rankInteractiveCandidate(a));
      return matches[0] ?? null;
    }

    function findFilterPanel(): HTMLElement | null {
      const panels = Array.from(document.querySelectorAll<HTMLElement>(".filter-panel"));
      const visiblePanels = panels.filter((el) => isVisible(el));
      if (visiblePanels.length > 0) return visiblePanels[0] ?? null;
      return panels[0] ?? null;
    }

    function panelIsVisible(): boolean {
      const panel = findFilterPanel();
      return panel !== null && isVisible(panel);
    }

    function findFilterGroup(headingText: string): HTMLElement | null {
      const panel = findFilterPanel();
      if (panel === null) return null;
      const groups = Array.from(panel.querySelectorAll<HTMLElement>(".filters"));
      for (const group of groups) {
        const title =
          group.querySelector<HTMLElement>(":scope > span") ??
          group.querySelector<HTMLElement>("span");
        if (textOf(title) === headingText) return group;
      }
      return null;
    }

    function findTagOption(group: HTMLElement | null, label: string): HTMLElement | null {
      if (group === null) return null;
      const candidates = Array.from(
        group.querySelectorAll<HTMLElement>(".tag-container .tags, .tags"),
      ).filter((el) => textOf(el) === label);
      if (candidates.length === 0) return null;
      candidates.sort((a, b) => rankInteractiveCandidate(b) - rankInteractiveCandidate(a));
      return candidates[0] ?? null;
    }

    function findOperation(label: string): HTMLElement | null {
      const panel = findFilterPanel();
      if (panel === null) return null;
      const ops = Array.from(panel.querySelectorAll<HTMLElement>(".operation"));
      const matches = ops.filter((el) => textOf(el) === label);
      matches.sort((a, b) => rankInteractiveCandidate(b) - rankInteractiveCandidate(a));
      return matches[0] ?? null;
    }

    async function waitForPanelVisible(): Promise<boolean> {
      const deadline = Date.now() + 3000;
      do {
        if (panelIsVisible()) return true;
        await new Promise<void>((resolve) => setTimeout(resolve, 80));
      } while (Date.now() < deadline);
      return false;
    }

    async function waitUntilClosed(): Promise<boolean> {
      const deadline = Date.now() + 2000;
      do {
        if (!panelIsVisible()) return true;
        await new Promise<void>((resolve) => setTimeout(resolve, 80));
      } while (Date.now() < deadline);
      return false;
    }

    async function waitUntilTagSelected(
      headingText: string,
      label: string,
      beforeState: ReturnType<typeof readTagState>,
    ): Promise<boolean> {
      const deadline = Date.now() + 2000;
      do {
        if (!panelIsVisible()) return true;
        const current = findTagOption(findFilterGroup(headingText), label);
        if (isTagSelected(current)) return true;
        if (tagStateChanged(readTagState(current), beforeState)) return true;
        await new Promise<void>((resolve) => setTimeout(resolve, 80));
      } while (Date.now() < deadline);
      return false;
    }

    async function ensurePanelOpen(): Promise<boolean> {
      if (panelIsVisible()) return true;
      const button = findFilterButton();
      if (button === null) {
        setDiag("filter-button-not-found");
        return false;
      }
      clickLikeUser(button);
      if (!(await waitForPanelVisible())) {
        setDiag("filter-panel-not-opened");
        return false;
      }
      return true;
    }

    async function ensureTagSelected(headingText: string, label: string): Promise<boolean> {
      const group = findFilterGroup(headingText);
      if (group === null) {
        setDiag("group-not-found", { headingText });
        return false;
      }
      const option = findTagOption(group, label);
      if (option === null) {
        setDiag("option-not-found", {
          headingText,
          label,
          groupText: textOf(group).slice(0, 500),
        });
        return false;
      }
      if (isTagSelected(option)) return true;
      const beforeState = readTagState(option);
      clickLikeUser(option);
      if (!(await waitUntilTagSelected(headingText, label, beforeState))) {
        setDiag("option-not-selected", {
          headingText,
          label,
          optionClass: option.className,
          optionStateBeforeClick: beforeState,
          optionStateAfterClick: readTagState(
            findTagOption(findFilterGroup(headingText), label) ?? option,
          ),
        });
        return false;
      }
      return true;
    }

    if (!(await ensurePanelOpen())) return false;
    // Sorting by "最新" keeps XHS results aligned with the user's time-based
    // crawl intent; if this option doesn't exist on a future skin we keep
    // going and only require the publish-time bucket to succeed.
    if (findTagOption(findFilterGroup("排序依据"), desiredSortLabel) !== null) {
      if (!(await ensureTagSelected("排序依据", desiredSortLabel))) return false;
    }
    if (!(await ensureTagSelected("发布时间", desiredTimeLabel))) return false;
    if (panelIsVisible()) {
      const closeOp = findOperation("收起");
      const filterButton = findFilterButton();
      if (closeOp !== null) {
        clickLikeUser(closeOp);
      } else if (filterButton !== null) {
        clickLikeUser(filterButton);
      }
      if (!(await waitUntilClosed())) {
        setDiag("filter-panel-not-closed");
        return false;
      }
    }
    setDiag("ok");
    return true;
  });
}

// ─── exported DOM helpers ────────────────────────────────────────────────

export type CardKind =
  | "video"
  | "image_text"
  | "livestream"
  | "ad"
  | "profile"
  | "other";

export interface CardSummary {
  /** stable note id parsed out of the card's anchor href, or null if absent. */
  noteId: string | null;
  /** raw href of the card anchor (with xsec_token if present). */
  href: string | null;
  kind: CardKind;
}

interface CardSummaryBag {
  cards: CardSummary[];
  total: number;
}

/**
 * Wait up to `timeoutMs` for the masonry container to render at least one
 * card. Returns true if the layout is observed before timeout.
 */
export async function waitForMasonryReady(
  evaluator: DomEvaluator,
  timeoutMs: number,
  pollIntervalMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ready = await evaluator.evaluate<boolean>(() => {
      const container = document.querySelector(
        ".feeds-container, .feeds-page, [class*='feeds-container']",
      );
      if (container === null) return false;
      const card = container.querySelector("section.note-item, [class*='note-item']");
      return card !== null;
    });
    if (ready) return true;
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
  return false;
}

/**
 * Returns metadata for every visible card in the masonry plus the total
 * count. Each card is classified by visible badge cues (without opening
 * its detail overlay).
 */
export async function listVisibleCards(evaluator: DomEvaluator): Promise<CardSummaryBag> {
  return evaluator.evaluate<CardSummaryBag>(() => {
    function extractNoteIdFromHref(href: string): string | null {
      try {
        const u = new URL(href, location.origin);
        // 006 — Accept all three URL shapes XHS uses for note links:
        //   /explore/<id>                — hidden canonical/SEO anchor
        //   /discovery/item/<id>         — legacy
        //   /search_result/<id>?xsec_... — current visible cover anchor
        // Older code only matched the first two; cards that lazy-loaded
        // without the hidden /explore/ sibling fell through to the visible
        // cover with `/search_result/<id>` and the regex returned null,
        // which the executor then counted as `filtered`.
        const m = u.pathname.match(
          /^\/(?:explore|discovery\/item|search_result)\/([0-9A-Za-z]{8,32})\/?$/,
        );
        if (m === null || m[1] === undefined) return null;
        if (!/^[0-9A-Za-z]{8,32}$/.test(m[1])) return null;
        return m[1];
      } catch {
        return null;
      }
    }
    const container = document.querySelector(
      ".feeds-container, .feeds-page, [class*='feeds-container']",
    );
    if (container === null) {
      return { cards: [], total: 0 };
    }
    const cardEls = Array.from(
      container.querySelectorAll<HTMLElement>("section.note-item, [class*='note-item']"),
    );
    const cards = cardEls.map((card): {
      noteId: string | null;
      href: string | null;
      kind:
        | "video"
        | "image_text"
        | "livestream"
        | "ad"
        | "profile"
        | "other";
    } => {
      const adEl = card.querySelector("[class*='ads-card'], [class*='advertise']");
      if (adEl !== null) {
        return { noteId: null, href: null, kind: "ad" };
      }
      const liveEl = card.querySelector("[class*='live-card'], [class*='live-icon']");
      if (liveEl !== null) {
        return { noteId: null, href: null, kind: "livestream" };
      }
      // 006 — Prefer the VISIBLE cover anchor (a.cover) so we get the
      // canonical /search_result/<id>?xsec_token=... URL the user would
      // actually click. Fall back to the hidden /explore/ sibling and
      // legacy paths. Mixing them in a single comma list relied on
      // document order which put the hidden sibling first — fine for
      // identification but it lost the xsec_token from the visible href.
      const link =
        card.querySelector<HTMLAnchorElement>("a.cover, a[class*='cover']") ??
        card.querySelector<HTMLAnchorElement>("a[href*='/search_result/']") ??
        card.querySelector<HTMLAnchorElement>("a[href*='/explore/']") ??
        card.querySelector<HTMLAnchorElement>("a[href*='/discovery/item/']");
      if (link === null) {
        return { noteId: null, href: null, kind: "other" };
      }
      const href = link.getAttribute("href");
      const fullHref = href === null ? null : href.startsWith("http") ? href : `${location.origin}${href}`;
      const noteId = fullHref === null ? null : extractNoteIdFromHref(fullHref);
      // Profile-page cards (rare in 笔记 tab but possible in mixed search):
      // their link path is /user/profile/<id> rather than /explore/.
      if (noteId === null && href !== null && /\/user\/profile\//.test(href)) {
        return { noteId: null, href: fullHref, kind: "profile" };
      }
      const isVideo =
        card.querySelector(
          "[class*='play-icon'], [class*='video-icon'], svg[class*='play']",
        ) !== null;
      return {
        noteId,
        href: fullHref,
        kind: isVideo ? "video" : "image_text",
      };
    });
    return { cards, total: cardEls.length };
  });
}

/**
 * Click a card identified by its noteId. The card is re-queried at click
 * time because the masonry can re-flow after a previous overlay close.
 *
 * **Why this is more than `a.click()`**: XHS opens the note in an in-page
 * modal via a React onClick handler that calls `e.preventDefault()` to
 * suppress the anchor's navigation. A synthetic `HTMLElement.click()`
 * call dispatches a click that React's delegated listener does receive,
 * but on some skins clicking the raw `<a>` triggers a hard navigation to
 * `/explore/<id>?xsec_token=…` whose `xsec_token` may already have rotated
 * out — that's the "当前笔记无法浏览" page the user reported. The reliable
 * path is to dispatch a full pointerdown → mousedown → mouseup → click
 * sequence on the **cover image** inside the card (the element XHS binds
 * its real React handler to), with bubbling + `view: window` so React's
 * delegated listener picks it up just like a real user click. We also
 * `preventDefault()` the click ourselves before falling through to the
 * anchor as a last resort.
 *
 * Patchright's `evaluate(fn)` runs the function in the page context with
 * no closure over the host, so the noteId is inlined into a synthesized
 * function string after a defensive regex check (canonical id shape).
 * Returns `true` if a matching card was found and a click sequence was
 * dispatched.
 */
export async function clickNote(
  evaluator: DomEvaluator,
  noteId: string,
): Promise<boolean> {
  // The id is a hex/alnum string ≤ 32 chars; safe to inline as a literal in
  // a synthesized function string, but we still defensively reject any
  // non-canonical id rather than passing it through. (`noteId` already
  // matches /^[0-9A-Za-z]{8,32}$/ at the executor level.)
  if (!/^[0-9A-Za-z]{8,32}$/.test(noteId)) return false;
  const target = noteId;
  const fn = new Function(
    `
    var target = ${JSON.stringify(target)};
    var container = document.querySelector(".feeds-container, .feeds-page, [class*='feeds-container']");
    if (container === null) return false;

    // Find the card whose hidden /explore/<id> anchor or visible cover
    // anchor (now /search_result/<id>?xsec_token=...) carries the noteId.
    // We then prefer the VISIBLE cover anchor as click target — XHS binds
    // its real Vue @click handler there. Picking the hidden /explore/
    // sibling (which is rendered display:none for SEO/canonical use) and
    // dispatching click on its descendant IMG never triggers the modal,
    // because the hidden anchor has no children to receive the dispatch.
    var cards = container.querySelectorAll("section.note-item, [class*='note-item']");
    var card = null;
    for (var ci = 0; ci < cards.length; ci++) {
      var c = cards[ci];
      // Any anchor inside the card whose href contains the noteId is OK
      // for identification — covers /explore/, /discovery/item/, and the
      // current /search_result/<id>?xsec_token=... shape.
      var idAnchors = c.querySelectorAll("a[href*='" + target + "']");
      if (idAnchors.length > 0) {
        card = c;
        break;
      }
    }
    if (card === null) return false;

    // Prefer the VISIBLE clickable cover anchor for the dispatch.
    var coverAnchor = card.querySelector("a.cover, a.cover.mask, a[class*='cover']");
    var clickAnchor = coverAnchor;
    if (clickAnchor === null) {
      // Fallback: any anchor inside the card that is not display:none.
      var allAnchors = card.querySelectorAll("a");
      for (var ai = 0; ai < allAnchors.length; ai++) {
        var maybeStyle = window.getComputedStyle(allAnchors[ai]);
        if (maybeStyle && maybeStyle.display !== "none" && maybeStyle.visibility !== "hidden") {
          clickAnchor = allAnchors[ai];
          break;
        }
      }
    }
    if (clickAnchor === null) return false;

    // Dispatch on the inner IMG when present (most reliable target —
    // XHS attaches @click to the cover anchor, but dispatching on the
    // descendant IMG bubbles up and lets Vue's handler fire). If no IMG
    // exists, fall back to the cover anchor itself.
    var clickEl = clickAnchor.querySelector("img") || clickAnchor;

    try { clickEl.scrollIntoView({ behavior: "instant", block: "center" }); } catch (e) {}

    // Capture-phase preventDefault interceptor — fires BEFORE React's
    // delegated listener, but the click event still bubbles up so React
    // sees it and opens the in-page modal. Without this, my earlier
    // post-dispatch preventDefault() was too late (the event had already
    // finished propagation and the anchor's default navigation had been
    // queued). One-shot: removes itself after the first click event.
    var capListener = function (e) {
      try { e.preventDefault(); } catch (err) {}
      document.removeEventListener("click", capListener, true);
      window.removeEventListener("click", capListener, true);
    };
    document.addEventListener("click", capListener, true);
    window.addEventListener("click", capListener, true);

    function fire(target, type) {
      var ev;
      try {
        ev = new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          view: window,
          button: 0,
          buttons: type === "mousedown" ? 1 : 0,
          composed: true,
        });
      } catch (e) {
        ev = document.createEvent("MouseEvents");
        ev.initEvent(type, true, true);
      }
      target.dispatchEvent(ev);
      return ev;
    }

    try { fire(clickEl, "pointerdown"); } catch (e) {}
    try { fire(clickEl, "mousedown"); } catch (e) {}
    try { fire(clickEl, "mouseup"); } catch (e) {}
    try { fire(clickEl, "pointerup"); } catch (e) {}
    fire(clickEl, "click");

    // Belt-and-suspenders: if no click event ever reached the listener
    // (e.g. dispatch was eaten by a stopPropagation upstream), remove it
    // so it doesn't linger and preventDefault a future user click. The
    // listener already self-removes on first hit; this is the safety net
    // for the "never fired" case.
    setTimeout(function () {
      document.removeEventListener("click", capListener, true);
      window.removeEventListener("click", capListener, true);
    }, 1000);

    return true;
  `,
  ) as () => boolean;
  return evaluator.evaluate<boolean>(fn);
}

/**
 * Wait up to `timeoutMs` for the detail overlay root to be present + visible.
 * Returns true on success, false on timeout.
 */
export async function waitForDetailOverlay(
  evaluator: DomEvaluator,
  timeoutMs: number,
  pollIntervalMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const open = await evaluator.evaluate<boolean>(() => {
      const overlay = document.querySelector(
        ".note-detail-mask, [class*='note-detail-mask']",
      );
      if (overlay === null) return false;
      const container = document.querySelector(
        "#noteContainer, .note-container, [class*='note-container']",
      );
      if (container === null) return false;
      const r = (container as HTMLElement).getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    if (open) return true;
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
  return false;
}

export async function isDetailOverlayOpen(evaluator: DomEvaluator): Promise<boolean> {
  return evaluator.evaluate<boolean>(() => {
    const overlay = document.querySelector(
      ".note-detail-mask, [class*='note-detail-mask']",
    );
    return overlay !== null;
  });
}

/**
 * 006 — XHS now hard-navigates from search to a per-note URL like
 * `/search_result/<noteId>?xsec_token=...`. There is no modal mask on the
 * standalone detail page; we only need #noteContainer (or .note-container)
 * to be present and visible before reading metadata. Use this helper when
 * arriving via navigation rather than click-opens-modal.
 */
export async function waitForDetailContent(
  evaluator: DomEvaluator,
  timeoutMs: number,
  pollIntervalMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ready = await evaluator.evaluate<boolean>(() => {
      const container = document.querySelector(
        "#noteContainer, .note-container, [class*='note-container']",
      );
      if (container === null) return false;
      const r = (container as HTMLElement).getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    if (ready) return true;
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
  return false;
}

/**
 * 006 — Inverse of waitForDetailContent: wait for #noteContainer to
 * disappear (or become 0×0). Used after sending a real Escape keypress
 * to confirm the detail actually closed — much more reliable than the
 * legacy waitForDetailOverlayClosed which polls for `.note-detail-mask`
 * (a wrapper the current XHS layout no longer renders, so it would
 * false-positive instantly).
 */
export async function waitForDetailContentClosed(
  evaluator: DomEvaluator,
  timeoutMs: number,
  pollIntervalMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const closed = await evaluator.evaluate<boolean>(() => {
      const container = document.querySelector(
        "#noteContainer, .note-container, [class*='note-container']",
      );
      if (container === null) return true;
      const r = (container as HTMLElement).getBoundingClientRect();
      return r.width === 0 || r.height === 0;
    });
    if (closed) return true;
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
  return false;
}

/**
 * Wait up to `timeoutMs` for the detail overlay root to disappear. Returns
 * true on successful close, false on timeout.
 */
export async function waitForDetailOverlayClosed(
  evaluator: DomEvaluator,
  timeoutMs: number,
  pollIntervalMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const closed = await evaluator.evaluate<boolean>(() => {
      const overlay = document.querySelector(
        ".note-detail-mask, [class*='note-detail-mask']",
      );
      return overlay === null;
    });
    if (closed) return true;
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
  return false;
}

/**
 * Click the close button if visible, otherwise dispatch an Escape key event
 * on document. Returns true if either path was attempted.
 */
export async function dispatchOverlayClose(evaluator: DomEvaluator): Promise<boolean> {
  return evaluator.evaluate<boolean>(() => {
    const overlay = document.querySelector(
      ".note-detail-mask, [class*='note-detail-mask']",
    );
    if (overlay !== null) {
      const close = overlay.querySelector<HTMLElement>(
        ".close, .close-btn, [class*='close-circle'], svg.close",
      );
      if (close !== null) {
        close.click();
        return true;
      }
    }
    const evt = new KeyboardEvent("keydown", {
      key: "Escape",
      code: "Escape",
      keyCode: 27,
      which: 27,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(evt);
    document.body.dispatchEvent(evt);
    return true;
  });
}

export interface DetailCommentItem {
  author: string;
  content: string;
  likeCount: number;
  timeText: string;
}

export interface DetailMetadata {
  /** canonical note id from the address bar (preferred) or detail anchor. */
  noteId: string | null;
  /** full URL with xsec_token (if present). */
  shareUrl: string | null;
  /** "video" | "image_text" — derived from <video> presence in the overlay. */
  noteType: "video" | "image_text";
  caption: string;
  hashtags: string[];
  authorHandle: string;
  authorDisplayName: string | null;
  likeCount: number;
  commentCount: number;
  collectCount: number;
  shareCount: number;
  /** Up to 10 top-level comments visible in the detail overlay. Empty when none. */
  comments: DetailCommentItem[];
}

/**
 * Read full metadata out of the detail overlay. Caller must have ensured
 * the overlay is open. Throws if the overlay vanished mid-read.
 */
export async function extractDetailMetadata(evaluator: DomEvaluator): Promise<DetailMetadata> {
  return evaluator.evaluate<DetailMetadata>(() => {
    function parseStatLocal(raw: string): number {
      const trimmed = (raw || "").trim();
      if (trimmed.length === 0) return 0;
      const lowered = trimmed.toLowerCase();
      const match = lowered.match(/^([0-9]+(?:\.[0-9]+)?)([万wk亿]?)\+?$/u);
      if (match === null) {
        const fallback = lowered.replace(/,/g, "");
        const n = Number(fallback);
        if (Number.isFinite(n)) return Math.round(n);
        return 0;
      }
      const num = parseFloat(match[1] || "0");
      const unit = match[2] || "";
      if (unit === "万" || unit === "w") return Math.round(num * 10_000);
      if (unit === "亿") return Math.round(num * 100_000_000);
      if (unit === "k") return Math.round(num * 1_000);
      return Math.round(num);
    }
    function extractNoteIdFromUrl(raw: string): string | null {
      try {
        const u = new URL(raw, location.origin);
        const m = u.pathname.match(
          /^\/(?:explore|discovery\/item)\/([0-9A-Za-z]{8,32})\/?$/,
        );
        if (m === null || m[1] === undefined) return null;
        return m[1];
      } catch {
        return null;
      }
    }

    const container = document.querySelector(
      "#noteContainer, .note-container, [class*='note-container']",
    );
    if (container === null) {
      throw new Error("detail overlay container vanished mid-read");
    }

    const isVideo =
      container.querySelector(
        "video[src], xg-video-container video, [class*='video-container'] video",
      ) !== null;

    // URL in the address bar is the most reliable canonical href; fall back
    // to the first /explore/ anchor inside the overlay.
    let shareUrl: string | null = location.href;
    let noteId = extractNoteIdFromUrl(location.href);
    if (noteId === null) {
      const anchor = container.querySelector<HTMLAnchorElement>(
        "a[href*='/explore/'], a[href*='/discovery/item/']",
      );
      if (anchor !== null) {
        const href = anchor.getAttribute("href") ?? "";
        const full = href.startsWith("http") ? href : `${location.origin}${href}`;
        const id = extractNoteIdFromUrl(full);
        if (id !== null) {
          noteId = id;
          shareUrl = full;
        }
      }
    }

    // Caption: prefer #detail-desc, fallback to the note-content body div.
    const captionEl = container.querySelector(
      "#detail-desc, .note-content .desc, [class*='note-content'] .desc",
    );
    let caption = (captionEl?.textContent ?? "").trim();
    if (caption.length === 0) {
      const titleEl = container.querySelector(
        "#detail-title, .title, [class*='note-content'] .title",
      );
      caption = (titleEl?.textContent ?? "").trim();
    }
    if (caption.length > 4096) caption = caption.slice(0, 4096);

    // Hashtags: anchors inside the caption that point to /search_result?keyword=#…
    const tagEls = Array.from(
      container.querySelectorAll<HTMLAnchorElement>(
        "a[href*='/search_result?keyword=#'], [class*='hash-tag']",
      ),
    );
    const hashtags: string[] = [];
    for (const t of tagEls) {
      const txt = (t.textContent ?? "").trim().replace(/^#/, "").slice(0, 64);
      if (txt.length > 0 && !hashtags.includes(txt)) hashtags.push(txt);
      if (hashtags.length >= 64) break;
    }

    // Author: prefer the text of the author link inside .author-wrapper.
    const authorAnchor = container.querySelector<HTMLAnchorElement>(
      ".author-wrapper a.name, a.user-link, [class*='author'] .name",
    );
    let authorDisplayName: string | null = null;
    let authorHandle = "unknown";
    if (authorAnchor !== null) {
      const txt = (authorAnchor.textContent ?? "").trim().slice(0, 256);
      if (txt.length > 0) authorDisplayName = txt;
      const href = authorAnchor.getAttribute("href") ?? "";
      const m = href.match(/\/user\/profile\/([0-9A-Za-z]+)/);
      if (m !== null && m[1] !== undefined) authorHandle = m[1].slice(0, 256);
    }

    // Counts: read the visible label of each interaction button.
    // IMPORTANT: try selectors in PRIORITY ORDER, not as a comma-list.
    // querySelector with a comma-list returns the first match in DOCUMENT
    // order across all listed selectors, which means a less-scoped fallback
    // like `[class*='like-wrapper']` will hijack a tightly-scoped winner if
    // the broader element appears earlier in the DOM. XHS comments each
    // render their own `.like-wrapper` and they're in the DOM ABOVE the
    // engage-bar, so a comma-fallback ends up reading a comment's like
    // count instead of the note's. Iterating the array gives us strict
    // priority: the scoped engage-bar selector wins whenever it matches.
    function readCount(sels: readonly string[]): {
      value: number;
      rawText: string;
      matched: boolean;
    } {
      for (const sel of sels) {
        const btn = container!.querySelector(sel);
        if (btn === null) continue;
        const fullText = (btn.textContent ?? "").trim().slice(0, 80);
        const raw = (btn.textContent ?? "").replace(/[^0-9.万wk亿+]/g, "");
        if (raw.length === 0) return { value: 0, rawText: fullText, matched: true };
        return { value: parseStatLocal(raw), rawText: fullText, matched: true };
      }
      return { value: -1, rawText: "", matched: false };
    }
    // The modal interaction bar is wrapped in `.interactions.engage-bar`
    // (or `.engage-bar-style`); each `*-wrapper` inside it holds a single
    // `<span class="count">N</span>`. Each individual COMMENT below the
    // bar also renders its own `.like-wrapper`, and comments are above the
    // engage-bar in DOM order — so we MUST list scoped selectors first and
    // try them in priority order (see readCount) rather than relying on
    // querySelector's document-order tie-breaking. We also target `.count`
    // directly so SVG labels / lottie spans / 中文标签 don't pollute the
    // textContent.
    // Selector priority is critical here. `.interactions` alone is too
    // broad — XHS comment threads also use `.interactions` as a wrapper,
    // and they appear above the engage-bar in DOM order, so any selector
    // beginning with just `.interactions` will hijack a comment's
    // `.like-wrapper > .count` (typically a single-digit count) and
    // shadow the note's real like total. The reliable scopes are:
    //   1. `.engage-bar-style` — only used on the modal interact-bar's
    //      buttons row (`<div class="buttons engage-bar-style">`).
    //      Comments do not have this class.
    //   2. `.interactions.engage-bar` — the wrapping div of the modal
    //      interact-bar (`<div class="interactions engage-bar">`).
    //      Comments use plain `.interactions` without `.engage-bar`.
    // We try `.engage-bar-style` first, fall back to `.interactions.engage-bar`,
    // and only as a last resort the legacy `.buttons` selector.
    const likeRead = readCount([
      ".engage-bar-style .like-wrapper .count",
      ".interactions.engage-bar .like-wrapper .count",
      ".engage-bar-style .like-wrapper",
      ".interactions.engage-bar .like-wrapper",
      ".buttons .like-wrapper",
    ]);
    const collectRead = readCount([
      ".engage-bar-style .collect-wrapper .count",
      ".interactions.engage-bar .collect-wrapper .count",
      ".engage-bar-style .collect-wrapper",
      ".interactions.engage-bar .collect-wrapper",
      ".buttons .collect-wrapper",
    ]);
    const commentRead = readCount([
      ".engage-bar-style .chat-wrapper .count",
      ".interactions.engage-bar .chat-wrapper .count",
      ".engage-bar-style .chat-wrapper",
      ".interactions.engage-bar .chat-wrapper",
      ".buttons .chat-wrapper",
    ]);
    const likeCount = likeRead.value;
    const collectCount = collectRead.value;
    const commentCount = commentRead.value;
    // Stash diagnostics on a global the executor can sniff on the next
    // evaluate. Cheap; no extra round-trip needed.
    // Also dump the outerHTML of any candidate interaction-bar wrapper so
    // we can see the new DOM layout in one log line — selectors are
    // currently mis-aligned (like-wrapper picks up tiny stray digits while
    // collect-wrapper actually carries the like count) and we need ground
    // truth, not guesses, to fix the mapping.
    try {
      const interactBar =
        container!.querySelector(".interact-bar") ??
        container!.querySelector(".engage-bar") ??
        container!.querySelector(".buttons") ??
        container!.querySelector("[class*='engage']") ??
        container!.querySelector("[class*='interact']") ??
        container!.querySelector(".note-content .footer") ??
        null;
      const interactHtml =
        interactBar !== null
          ? (interactBar as HTMLElement).outerHTML.replace(/\s+/g, " ").slice(0, 1500)
          : "";
      (window as unknown as { __uaXhsCountDiag?: unknown }).__uaXhsCountDiag = {
        likeMatched: likeRead.matched,
        likeRaw: likeRead.rawText,
        collectMatched: collectRead.matched,
        collectRaw: collectRead.rawText,
        commentMatched: commentRead.matched,
        commentRaw: commentRead.rawText,
        interactBarTag:
          interactBar !== null ? (interactBar as HTMLElement).tagName : "",
        interactBarClass:
          interactBar !== null ? (interactBar as HTMLElement).className : "",
        interactBarHtml: interactHtml,
      };
    } catch {
      /* ignore */
    }
    // XHS doesn't expose share count on the detail overlay; record -1.
    const shareCount = -1;

    // ─── Top-level comments (up to 10) ───────────────────────────────────
    // Comment thread DOM is rooted at `.list-container .parent-comment` inside
    // the modal. Each `.parent-comment` carries an `.author-wrapper a.name`
    // for the author handle, a `.content` (or `.note-text`) span for body
    // text, a `.like-wrapper .count` for the per-comment like total, and a
    // `.date` for the relative timestamp. We pin selectors with `.list-container`
    // as the scope so a `.like-wrapper` inside the engage-bar (already extracted
    // above as the note's like count) cannot bleed in. Skin variants:
    //   - Some renders use `.comment-item` instead of `.parent-comment`.
    //   - Some use `.note-text` instead of `.content` for the body.
    // We try the common selectors in priority order and fall through.
    const commentList: { author: string; content: string; likeCount: number; timeText: string }[] = [];
    const commentRoot =
      container.querySelector(".list-container") ??
      container.querySelector(".comments-container") ??
      container.querySelector("[class*='commentContainer']") ??
      null;
    let commentNodeCount = 0;
    if (commentRoot !== null) {
      const nodes = Array.from(
        commentRoot.querySelectorAll<HTMLElement>(
          ".parent-comment, .comment-item",
        ),
      );
      commentNodeCount = nodes.length;
      for (const node of nodes) {
        if (commentList.length >= 10) break;
        const authorEl = node.querySelector<HTMLAnchorElement>(
          ".author-wrapper a.name, .name, a.user-link",
        );
        const author = ((authorEl?.textContent ?? "").trim() || "未知").slice(0, 256);
        const contentEl = node.querySelector(
          ".content .note-text, .note-text, .content, [class*='content']",
        );
        let content = (contentEl?.textContent ?? "").trim();
        if (content.length > 1024) content = content.slice(0, 1024);
        const likeEl = node.querySelector(".like-wrapper .count, .like-wrapper");
        let likeCount = -1;
        if (likeEl !== null) {
          const raw = (likeEl.textContent ?? "").replace(/[^0-9.万wk亿+]/g, "");
          if (raw.length === 0) {
            likeCount = 0;
          } else {
            likeCount = parseStatLocal(raw);
          }
        }
        const timeEl = node.querySelector(".date, .time, [class*='date'], [class*='time']");
        const timeText = ((timeEl?.textContent ?? "").trim() || "").slice(0, 64);
        if (content.length === 0) continue;
        commentList.push({ author, content, likeCount, timeText });
      }
    }
    try {
      (window as unknown as { __uaXhsCommentDiag?: unknown }).__uaXhsCommentDiag = {
        rootMatched: commentRoot !== null,
        rootClass: commentRoot !== null ? (commentRoot as HTMLElement).className : "",
        nodeCount: commentNodeCount,
        captured: commentList.length,
      };
    } catch {
      /* ignore */
    }

    return {
      noteId,
      shareUrl,
      noteType: isVideo ? "video" : "image_text",
      caption,
      hashtags,
      authorHandle,
      authorDisplayName,
      likeCount,
      commentCount,
      collectCount,
      shareCount,
      comments: commentList.map((c) => ({
        author: c.author,
        content: c.content,
        likeCount: c.likeCount,
        timeText: c.timeText,
      })),
    };
  });
}

/**
 * Scroll the masonry's scroll root toward its bottom to trigger lazy-load.
 * Returns true iff a scrollable target was found.
 */
export async function scrollMasonryBottom(evaluator: DomEvaluator): Promise<boolean> {
  return evaluator.evaluate<boolean>(() => {
    // XHS uses window scroll most of the time; some skin variants put the
    // masonry inside a scrolling div. Target both.
    const candidates: Element[] = [];
    const c1 = document.querySelector(
      ".feeds-container, .feeds-page, [class*='feeds-container']",
    );
    if (c1 !== null) candidates.push(c1);
    let scrolled = false;
    for (const cand of candidates) {
      const el = cand as HTMLElement;
      const before = el.scrollTop;
      el.scrollTop = el.scrollHeight;
      if (el.scrollTop !== before) scrolled = true;
    }
    const beforeWin = window.scrollY;
    window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "instant" });
    if (window.scrollY !== beforeWin) scrolled = true;
    return scrolled || true;
  });
}

/**
 * Wait for the masonry card count to grow above `previousCount` within
 * `timeoutMs`. Returns the new count (≥ previousCount + 1) on success, or
 * the still-unchanged count on timeout.
 */
export async function waitForCardCountGrowth(
  evaluator: DomEvaluator,
  previousCount: number,
  timeoutMs: number,
  pollIntervalMs: number,
): Promise<number> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const cur = await evaluator.evaluate<number>(() => {
      const container = document.querySelector(
        ".feeds-container, .feeds-page, [class*='feeds-container']",
      );
      if (container === null) return 0;
      return container.querySelectorAll("section.note-item, [class*='note-item']").length;
    });
    if (cur > previousCount) return cur;
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
  // Final read.
  return evaluator.evaluate<number>(() => {
    const container = document.querySelector(
      ".feeds-container, .feeds-page, [class*='feeds-container']",
    );
    if (container === null) return 0;
    return container.querySelectorAll("section.note-item, [class*='note-item']").length;
  });
}

// `parseStat` is duplicated inline inside each `evaluate(fn)` because
// patchright runs the function in the page context with no closure. The
// outer copy is kept for unit-testable logic and to anchor selector
// edits in this file.
export { parseStat };

/**
 * 006-2 — Selector for the modal-side author area to hover. Caller passes
 * this to `port.hover(selector)` (real-pointer hover via patchright).
 *
 * The `.author-container` ancestor is unique to the open detail modal —
 * masonry cards have only `.author-wrapper` without the container, so this
 * selector is safe to fire even when the underlying masonry is reachable
 * through `.note-container`'s descendants.
 */
export const XHS_DETAIL_AUTHOR_AVATAR_SELECTOR = SEL_DETAIL_AUTHOR_HOVER;

/**
 * 006-2 — Wait for XHS's user-info hover popup to mount with at least the
 * 粉丝 (follower) line populated. Returns true on success, false on timeout.
 *
 * Polls for `.tooltip-container .header-area` AND a non-empty number text
 * adjacent to a `<span class="interaction-name">粉丝</span>` — XHS mounts
 * the card skeleton first and fills in counts asynchronously, so the mere
 * presence of `.header-area` isn't enough.
 */
export async function waitForUserHoverCard(
  evaluator: DomEvaluator,
  timeoutMs: number,
  pollIntervalMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ready = await evaluator.evaluate<boolean>(() => {
      const card = document.querySelector(".tooltip-container .header-area");
      if (card === null) return false;
      const links = card.querySelectorAll(".interaction-info a.interaction");
      for (let i = 0; i < links.length; i++) {
        const link = links[i] as HTMLElement;
        const tag = link.querySelector(".interaction-name") as HTMLElement | null;
        if (tag === null) continue;
        if ((tag.textContent || "").trim() !== "粉丝") continue;
        const linkText = (link.textContent || "").trim();
        const tagText = (tag.textContent || "").trim();
        const numberText = linkText.endsWith(tagText)
          ? linkText.slice(0, linkText.length - tagText.length).trim()
          : linkText.replace(tagText, "").trim();
        if (numberText.length > 0) return true;
      }
      return false;
    });
    if (ready) return true;
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
  return false;
}

/**
 * 006-2 — Read the follower count out of the open user hover card. Returns
 * null if the card isn't present or the number can't be parsed (e.g.
 * deleted/private accounts that show a placeholder). Caller is responsible
 * for first hovering the avatar and waiting via `waitForUserHoverCard`.
 *
 * Number parsing is consistent with `parseStat` (handles 万/w/亿/k and the
 * "1.2万+" variant).
 */
export async function readUserHoverCardFollowerCount(
  evaluator: DomEvaluator,
): Promise<number | null> {
  return evaluator.evaluate<number | null>(() => {
    function parseStatLocal(raw: string): number | null {
      const trimmed = (raw || "").trim();
      if (trimmed.length === 0) return null;
      const lowered = trimmed.toLowerCase();
      const match = lowered.match(/^([0-9]+(?:\.[0-9]+)?)([万wk亿]?)\+?$/u);
      if (match === null) {
        const fallback = lowered.replace(/,/g, "");
        const n = Number(fallback);
        if (Number.isFinite(n)) return Math.round(n);
        return null;
      }
      const num = parseFloat(match[1] || "0");
      const unit = match[2] || "";
      if (unit === "万" || unit === "w") return Math.round(num * 10_000);
      if (unit === "亿") return Math.round(num * 100_000_000);
      if (unit === "k") return Math.round(num * 1_000);
      return Math.round(num);
    }
    const card = document.querySelector(".tooltip-container .header-area");
    if (card === null) return null;
    const links = card.querySelectorAll(".interaction-info a.interaction");
    for (let i = 0; i < links.length; i++) {
      const link = links[i] as HTMLElement;
      const tag = link.querySelector(".interaction-name") as HTMLElement | null;
      if (tag === null) continue;
      if ((tag.textContent || "").trim() !== "粉丝") continue;
      const linkText = (link.textContent || "").trim();
      const tagText = (tag.textContent || "").trim();
      const numberText = linkText.endsWith(tagText)
        ? linkText.slice(0, linkText.length - tagText.length).trim()
        : linkText.replace(tagText, "").trim();
      const n = parseStatLocal(numberText);
      if (n === null) return null;
      if (n <= 0) return null;
      return n;
    }
    return null;
  });
}

// Re-export selector constants so /speckit.analyze and follow-up DOM
// audits can find them at one well-known location.
export const SELECTORS = {
  masonryContainer: SEL_MASONRY_CONTAINER,
  card: SEL_CARD,
  cardLink: SEL_CARD_LINK,
  cardVideoBadge: SEL_CARD_VIDEO_BADGE,
  cardLivestreamBadge: SEL_CARD_LIVESTREAM_BADGE,
  cardAdMarker: SEL_CARD_AD_MARKER,
  detailOverlay: SEL_DETAIL_OVERLAY,
  detailContainer: SEL_DETAIL_CONTAINER,
  detailVideo: SEL_DETAIL_VIDEO,
  detailImageGrid: SEL_DETAIL_IMAGE_GRID,
  detailCaption: SEL_DETAIL_CAPTION,
  detailTitle: SEL_DETAIL_TITLE,
  detailAuthorLink: SEL_DETAIL_AUTHOR_LINK,
  detailHashtag: SEL_DETAIL_HASHTAG,
  detailLikeBtn: SEL_DETAIL_LIKE_BTN,
  detailCollectBtn: SEL_DETAIL_COLLECT_BTN,
  detailCommentBtn: SEL_DETAIL_COMMENT_BTN,
  detailCloseBtn: SEL_DETAIL_CLOSE_BTN,
  detailAuthorHover: SEL_DETAIL_AUTHOR_HOVER,
} as const;
