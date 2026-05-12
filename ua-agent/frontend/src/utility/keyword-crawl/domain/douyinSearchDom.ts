/**
 * Search-result-page DOM contract (Decision 4). The locators below are
 * encapsulated in this single module so a future Douyin DOM revamp is a
 * one-file change. They are reachable from BatchExecutor only via the
 * exported helpers — no other file should import these constants directly.
 *
 * REVISIT ON DOM REVAMP: every constant under `LOCATORS` must be re-validated
 * against the current Douyin search page when the DOM structure changes.
 */

const LOCATORS = {
  // Toggles between multi-column grid and the single-column "feed-style" layout.
  // Heuristic: the toggle button has an aria-label that includes "切换" or
  // a class name that contains "switch". A future DOM revamp may move this.
  singleColumnToggle:
    'button[aria-label*="切换"], button[class*="switch"], [data-e2e="switch-mode"]',
  // Cards in the single-column layout. We rely on a stable data-e2e marker
  // when present and fall back to a class-based heuristic.
  cardSelector: '[data-e2e="search-result-card"], [class*="search-card-list"] > div',
  // Marker indicating we're already in the single-column mode.
  singleColumnMarker: '[data-mode="single-column"], [class*="single-column"]',
} as const;

export type CardClassification =
  | "video"
  | "ad"
  | "livestream"
  | "profile"
  | "topic"
  | "removed"
  | "other";

export interface ExtractedCardMetadata {
  href: string | null;
  caption: string;
  authorHandle: string;
  authorDisplayName: string | null;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  hashtags: string[];
}

export interface DomEvaluator<TResult> {
  evaluate(fn: () => TResult | Promise<TResult>): Promise<TResult>;
}

const NUM_RE = /^([\d,.]+)\s*(万|w|k|千)?$/i;

/** Parse "1.2万" / "1234" / "1.2k" / "12,345" into an integer. */
export function parseStat(raw: string | null | undefined): number {
  if (raw === null || raw === undefined) return -1;
  const trimmed = raw.replace(/\s+/g, "").replace(/[,，]/g, "");
  if (trimmed.length === 0) return -1;
  const m = trimmed.match(NUM_RE);
  if (m === null) {
    const direct = Number(trimmed);
    return Number.isFinite(direct) ? Math.round(direct) : -1;
  }
  const baseStr = m[1] ?? "";
  const unit = (m[2] ?? "").toLowerCase();
  const base = Number(baseStr);
  if (!Number.isFinite(base)) return -1;
  const multiplier = unit === "万" || unit === "w" ? 10_000 : unit === "k" || unit === "千" ? 1_000 : 1;
  return Math.round(base * multiplier);
}

const FOLLOWER_NUM_RE = /^([\d,.]+)\s*(万|亿|w|k|千)?$/i;

/**
 * Parse the follower-count segment of the Douyin author-card stats string,
 * e.g. "4.9万粉丝" → 49000, "1.2亿粉丝" → 120_000_000, "1234粉丝" → 1234.
 * The literal `粉丝` suffix is stripped before parsing the number; the same
 * 万 / 亿 / k / 千 multipliers as `parseStat` are recognised plus 亿 (1e8).
 * Returns -1 on failure.
 */
export function parseFollowerStat(raw: string | null | undefined): number {
  if (raw === null || raw === undefined) return -1;
  let trimmed = raw.replace(/\s+/g, "").replace(/[,，]/g, "");
  // Strip the trailing "粉丝" / "fans" label if present so the unit suffix
  // (万/亿/etc.) is the last character we need to recognise.
  trimmed = trimmed.replace(/粉丝$/u, "").replace(/fans?$/i, "");
  if (trimmed.length === 0) return -1;
  const m = trimmed.match(FOLLOWER_NUM_RE);
  if (m === null) {
    const direct = Number(trimmed);
    return Number.isFinite(direct) ? Math.round(direct) : -1;
  }
  const baseStr = m[1] ?? "";
  const unit = (m[2] ?? "").toLowerCase();
  const base = Number(baseStr);
  if (!Number.isFinite(base)) return -1;
  const multiplier =
    unit === "亿"
      ? 100_000_000
      : unit === "万" || unit === "w"
        ? 10_000
        : unit === "k" || unit === "千"
          ? 1_000
          : 1;
  return Math.round(base * multiplier);
}

/**
 * Detector — returns true iff the page is currently in the single-column
 * layout. Pure browser-side function suitable for `page.evaluate`.
 */
export async function isSingleColumnLayout<E extends DomEvaluator<boolean>>(page: E): Promise<boolean> {
  return page.evaluate(() => {
    const sel = '[data-mode="single-column"], [class*="single-column"]';
    return document.querySelector(sel) !== null;
  });
}

/**
 * Click the layout-toggle button to flip to single-column mode.
 *
 * Real Douyin DOM (sample) — the "单列" affordance is a div with an svg + a
 * label child:
 *   <div class="JLxgOO5G flex items-center justify-center lzvzH9wn">
 *     <svg ...></svg>
 *     <div class="ml-2">单列</div>
 *   </div>
 * It's not a <button> and has no aria-label, so we locate it by walking the
 * text nodes for the literal label "单列" and clicking the closest
 * interactive ancestor. The same strategy works for any future label
 * variant ("List", "列表" etc.) by extending the candidates list.
 */
export async function clickSingleColumnToggle<E extends DomEvaluator<boolean>>(
  page: E,
): Promise<boolean> {
  return page.evaluate(() => {
    function findByLabel(label: string): HTMLElement | null {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode()) !== null) {
        const text = node.textContent !== null ? node.textContent.trim() : "";
        if (text === label) {
          // The text is in <div class="ml-2">单列</div>; the clickable
          // wrapper is the parent's parent. Walk up at most 4 levels and
          // pick the first element that visually looks clickable.
          let p: HTMLElement | null = node.parentElement;
          for (let i = 0; i < 4 && p !== null; i++) {
            const role = p.getAttribute("role");
            const tag = p.tagName.toLowerCase();
            const cs = window.getComputedStyle(p);
            if (
              tag === "button" ||
              role === "button" ||
              cs.cursor === "pointer" ||
              p.classList.contains("flex")
            ) {
              return p;
            }
            p = p.parentElement;
          }
          return node.parentElement?.parentElement ?? node.parentElement;
        }
      }
      return null;
    }

    // Primary path: text-based lookup for the user-visible label.
    const labels = ["单列", "列表", "List", "Single column"];
    for (const label of labels) {
      const el = findByLabel(label);
      if (el !== null) {
        el.click();
        return true;
      }
    }

    // Fallback: legacy selector candidates for future DOM variants.
    const candidates: string[] = [
      'button[aria-label*="单列"]',
      'button[aria-label*="列表"]',
      'button[aria-label*="切换"]',
      'button[title*="单列"]',
      'button[title*="列表"]',
      '[data-e2e*="single-column"]',
      '[data-e2e*="list-mode"]',
      '[data-e2e="switch-mode"]',
      '[role="button"][aria-label*="单列"]',
      '[role="button"][aria-label*="列表"]',
      'button[class*="single"]',
      'button[class*="ListIcon"]',
      'button[class*="switch"]',
    ];
    for (const sel of candidates) {
      const el = document.querySelector<HTMLElement>(sel);
      if (el !== null) {
        el.click();
        return true;
      }
    }
    return false;
  });
}

export async function applyPublishTimeFilter<
  E extends DomEvaluator<boolean>,
>(
  page: E,
  range: "all" | "day" | "week" | "half_year",
): Promise<boolean> {
  if (range === "all") return true;
  if (range === "day") {
    return page.evaluate(async () => {
      const desiredLabel = "一天内";

      function isVisible(el: HTMLElement): boolean {
        const cs = window.getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") {
          return false;
        }
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) return true;
        return /jsdom/i.test(navigator.userAgent);
      }

      function textOf(el: Element): string {
        return (el.textContent ?? "").replace(/\s+/g, "").trim();
      }

      function findFilterButton(): HTMLElement | null {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode()) !== null) {
          if ((node.textContent ?? "").trim() !== "筛选") continue;
          let el: HTMLElement | null = node.parentElement;
          for (let i = 0; i < 6 && el !== null; i += 1) {
            const tag = el.tagName.toLowerCase();
            const role = el.getAttribute("role");
            const cs = window.getComputedStyle(el);
            if (tag === "button" || role === "button" || el.tabIndex >= 0 || cs.cursor === "pointer") {
              return el;
            }
            el = el.parentElement;
          }
        }
        return null;
      }

      function findPublishTimeGroup(): HTMLElement | null {
        const headings = Array.from(
          document.querySelectorAll<HTMLElement>("div, span, p, h1, h2, h3, h4, h5, h6"),
        ).filter((el) => textOf(el) === "发布时间");
        const groups: HTMLElement[] = [];
        const seen = new Set<HTMLElement>();
        for (const heading of headings) {
          let group = heading.parentElement;
          while (group !== null) {
            const options = Array.from(group.querySelectorAll<HTMLElement>("span, button"));
            if (options.some((el) => textOf(el) === desiredLabel)) {
              if (!seen.has(group)) {
                seen.add(group);
                groups.push(group);
              }
              break;
            }
            group = group.parentElement;
          }
        }
        return (
          groups.find((group) => {
            const option = Array.from(group.querySelectorAll<HTMLElement>("span, button")).find(
              (el) => textOf(el) === desiredLabel,
            );
            return option !== undefined && isVisible(option);
          }) ?? groups[0] ?? null
        );
      }

      function findPublishTimeOption(): HTMLElement | null {
        const group = findPublishTimeGroup();
        if (group === null) return null;
        return (
          Array.from(group.querySelectorAll<HTMLElement>("span, button")).find(
            (el) => textOf(el) === desiredLabel,
          ) ?? null
        );
      }

      function setDiag(step: string, extra: Record<string, unknown> = {}): void {
        try {
          (window as unknown as { __uaDouyinPublishTimeFilterDiag?: unknown }).__uaDouyinPublishTimeFilterDiag = {
            step,
            desiredLabel,
            ...extra,
          };
        } catch {
          /* best effort */
        }
      }

      async function waitForOption(): Promise<{ group: HTMLElement; option: HTMLElement } | null> {
        const deadline = Date.now() + 3000;
        do {
          const group = findPublishTimeGroup();
          if (group !== null) {
            const option = findPublishTimeOption();
            if (option !== null && isVisible(option)) return { group, option };
          }
          await new Promise<void>((resolve) => setTimeout(resolve, 80));
        } while (Date.now() < deadline);
        return null;
      }

      type OptionState = {
        className: string;
        ariaSelected: string | null;
        dataSelected: string | null;
        dataState: string | null;
        dataStatus: string | null;
        dataActive: string | null;
        styleKey: string;
      };

      function readOptionState(el: HTMLElement | null): OptionState | null {
        if (el === null) return null;
        const cs = window.getComputedStyle(el);
        return {
          className: el.className,
          ariaSelected: el.getAttribute("aria-selected"),
          dataSelected: el.getAttribute("data-selected"),
          dataState: el.getAttribute("data-state"),
          dataStatus: el.getAttribute("data-status"),
          dataActive: el.getAttribute("data-active"),
          styleKey: [
            cs.color,
            cs.backgroundColor,
            cs.fontWeight,
            cs.borderColor,
            cs.opacity,
          ].join("|"),
        };
      }

      function hasExplicitSelectedMarker(el: HTMLElement): boolean {
        if (el.classList.contains("u39cEW99")) return true;
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

      function optionStateChanged(current: OptionState | null, before: OptionState | null): boolean {
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

      function clickLikeUser(el: HTMLElement): void {
        el.scrollIntoView({ block: "center", inline: "center" });
        el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
        el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
        el.click();
      }

      async function waitUntilSelected(option: HTMLElement, beforeState: OptionState | null): Promise<boolean> {
        const deadline = Date.now() + 2000;
        do {
          const current = findPublishTimeOption() ?? option;
          if (!isVisible(current)) return true;
          if (hasExplicitSelectedMarker(current)) return true;
          if (optionStateChanged(readOptionState(current), beforeState)) return true;
          await new Promise<void>((resolve) => setTimeout(resolve, 80));
        } while (Date.now() < deadline);
        return false;
      }

      async function waitUntilClosed(): Promise<boolean> {
        const deadline = Date.now() + 2000;
        do {
          const current = findPublishTimeOption();
          if (current === null || !isVisible(current)) return true;
          await new Promise<void>((resolve) => setTimeout(resolve, 80));
        } while (Date.now() < deadline);
        return false;
      }

      const filterButton = findFilterButton();
      if (filterButton === null) {
        setDiag("filter-button-not-found");
        return false;
      }
      const currentOption = findPublishTimeOption();
      if (currentOption === null || !isVisible(currentOption)) clickLikeUser(filterButton);
      const found = await waitForOption();
      if (found === null) {
        setDiag("publish-time-option-not-found", {
          groupText: findPublishTimeGroup()?.textContent?.replace(/\s+/g, " ").trim().slice(0, 500) ?? "",
        });
        return false;
      }
      const optionStateBeforeClick = readOptionState(found.option);
      clickLikeUser(found.option);
      if (!(await waitUntilSelected(found.option, optionStateBeforeClick))) {
        setDiag("publish-time-option-not-selected", {
          optionText: found.option.textContent?.trim() ?? "",
          optionClass: found.option.className,
          optionStateBeforeClick,
          optionStateAfterClick: readOptionState(findPublishTimeOption() ?? found.option),
        });
        return false;
      }
      const visibleAfterSelection = findPublishTimeOption();
      if (visibleAfterSelection !== null && isVisible(visibleAfterSelection)) {
        clickLikeUser(filterButton);
        if (!(await waitUntilClosed())) {
          setDiag("filter-panel-not-closed", {
            optionText: found.option.textContent?.trim() ?? "",
            groupText: findPublishTimeGroup()?.textContent?.replace(/\s+/g, " ").trim().slice(0, 500) ?? "",
          });
          return false;
        }
      }
      setDiag("ok");
      return true;
    });
  }
  if (range === "week") {
    return page.evaluate(async () => {
      const desiredLabel = "一周内";

      function isVisible(el: HTMLElement): boolean {
        const cs = window.getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") {
          return false;
        }
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) return true;
        return /jsdom/i.test(navigator.userAgent);
      }

      function textOf(el: Element): string {
        return (el.textContent ?? "").replace(/\s+/g, "").trim();
      }

      function findFilterButton(): HTMLElement | null {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode()) !== null) {
          if ((node.textContent ?? "").trim() !== "筛选") continue;
          let el: HTMLElement | null = node.parentElement;
          for (let i = 0; i < 6 && el !== null; i += 1) {
            const tag = el.tagName.toLowerCase();
            const role = el.getAttribute("role");
            const cs = window.getComputedStyle(el);
            if (tag === "button" || role === "button" || el.tabIndex >= 0 || cs.cursor === "pointer") {
              return el;
            }
            el = el.parentElement;
          }
        }
        return null;
      }

      function findPublishTimeGroup(): HTMLElement | null {
        const headings = Array.from(
          document.querySelectorAll<HTMLElement>("div, span, p, h1, h2, h3, h4, h5, h6"),
        ).filter((el) => textOf(el) === "发布时间");
        const groups: HTMLElement[] = [];
        const seen = new Set<HTMLElement>();
        for (const heading of headings) {
          let group = heading.parentElement;
          while (group !== null) {
            const options = Array.from(group.querySelectorAll<HTMLElement>("span, button"));
            if (options.some((el) => textOf(el) === desiredLabel)) {
              if (!seen.has(group)) {
                seen.add(group);
                groups.push(group);
              }
              break;
            }
            group = group.parentElement;
          }
        }
        return (
          groups.find((group) => {
            const option = Array.from(group.querySelectorAll<HTMLElement>("span, button")).find(
              (el) => textOf(el) === desiredLabel,
            );
            return option !== undefined && isVisible(option);
          }) ?? groups[0] ?? null
        );
      }

      function findPublishTimeOption(): HTMLElement | null {
        const group = findPublishTimeGroup();
        if (group === null) return null;
        return (
          Array.from(group.querySelectorAll<HTMLElement>("span, button")).find(
            (el) => textOf(el) === desiredLabel,
          ) ?? null
        );
      }

      function setDiag(step: string, extra: Record<string, unknown> = {}): void {
        try {
          (window as unknown as { __uaDouyinPublishTimeFilterDiag?: unknown }).__uaDouyinPublishTimeFilterDiag = {
            step,
            desiredLabel,
            ...extra,
          };
        } catch {
          /* best effort */
        }
      }

      async function waitForOption(): Promise<{ group: HTMLElement; option: HTMLElement } | null> {
        const deadline = Date.now() + 3000;
        do {
          const group = findPublishTimeGroup();
          if (group !== null) {
            const option = findPublishTimeOption();
            if (option !== null && isVisible(option)) return { group, option };
          }
          await new Promise<void>((resolve) => setTimeout(resolve, 80));
        } while (Date.now() < deadline);
        return null;
      }

      type OptionState = {
        className: string;
        ariaSelected: string | null;
        dataSelected: string | null;
        dataState: string | null;
        dataStatus: string | null;
        dataActive: string | null;
        styleKey: string;
      };

      function readOptionState(el: HTMLElement | null): OptionState | null {
        if (el === null) return null;
        const cs = window.getComputedStyle(el);
        return {
          className: el.className,
          ariaSelected: el.getAttribute("aria-selected"),
          dataSelected: el.getAttribute("data-selected"),
          dataState: el.getAttribute("data-state"),
          dataStatus: el.getAttribute("data-status"),
          dataActive: el.getAttribute("data-active"),
          styleKey: [
            cs.color,
            cs.backgroundColor,
            cs.fontWeight,
            cs.borderColor,
            cs.opacity,
          ].join("|"),
        };
      }

      function hasExplicitSelectedMarker(el: HTMLElement): boolean {
        if (el.classList.contains("u39cEW99")) return true;
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

      function optionStateChanged(current: OptionState | null, before: OptionState | null): boolean {
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

      function clickLikeUser(el: HTMLElement): void {
        el.scrollIntoView({ block: "center", inline: "center" });
        el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
        el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
        el.click();
      }

      async function waitUntilSelected(option: HTMLElement, beforeState: OptionState | null): Promise<boolean> {
        const deadline = Date.now() + 2000;
        do {
          const current = findPublishTimeOption() ?? option;
          if (!isVisible(current)) return true;
          if (hasExplicitSelectedMarker(current)) return true;
          if (optionStateChanged(readOptionState(current), beforeState)) return true;
          await new Promise<void>((resolve) => setTimeout(resolve, 80));
        } while (Date.now() < deadline);
        return false;
      }

      async function waitUntilClosed(): Promise<boolean> {
        const deadline = Date.now() + 2000;
        do {
          const current = findPublishTimeOption();
          if (current === null || !isVisible(current)) return true;
          await new Promise<void>((resolve) => setTimeout(resolve, 80));
        } while (Date.now() < deadline);
        return false;
      }

      const filterButton = findFilterButton();
      if (filterButton === null) {
        setDiag("filter-button-not-found");
        return false;
      }
      const currentOption = findPublishTimeOption();
      if (currentOption === null || !isVisible(currentOption)) clickLikeUser(filterButton);
      const found = await waitForOption();
      if (found === null) {
        setDiag("publish-time-option-not-found", {
          groupText: findPublishTimeGroup()?.textContent?.replace(/\s+/g, " ").trim().slice(0, 500) ?? "",
        });
        return false;
      }
      const optionStateBeforeClick = readOptionState(found.option);
      clickLikeUser(found.option);
      if (!(await waitUntilSelected(found.option, optionStateBeforeClick))) {
        setDiag("publish-time-option-not-selected", {
          optionText: found.option.textContent?.trim() ?? "",
          optionClass: found.option.className,
          optionStateBeforeClick,
          optionStateAfterClick: readOptionState(findPublishTimeOption() ?? found.option),
        });
        return false;
      }
      const visibleAfterSelection = findPublishTimeOption();
      if (visibleAfterSelection !== null && isVisible(visibleAfterSelection)) {
        clickLikeUser(filterButton);
        if (!(await waitUntilClosed())) {
          setDiag("filter-panel-not-closed", {
            optionText: found.option.textContent?.trim() ?? "",
            groupText: findPublishTimeGroup()?.textContent?.replace(/\s+/g, " ").trim().slice(0, 500) ?? "",
          });
          return false;
        }
      }
      setDiag("ok");
      return true;
    });
  }
  return page.evaluate(async () => {
    const desiredLabel = "半年内";

    function isVisible(el: HTMLElement): boolean {
      const cs = window.getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") {
        return false;
      }
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return true;
      return /jsdom/i.test(navigator.userAgent);
    }

    function textOf(el: Element): string {
      return (el.textContent ?? "").replace(/\s+/g, "").trim();
    }

    function findFilterButton(): HTMLElement | null {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode()) !== null) {
        if ((node.textContent ?? "").trim() !== "筛选") continue;
        let el: HTMLElement | null = node.parentElement;
        for (let i = 0; i < 6 && el !== null; i += 1) {
          const tag = el.tagName.toLowerCase();
          const role = el.getAttribute("role");
          const cs = window.getComputedStyle(el);
          if (tag === "button" || role === "button" || el.tabIndex >= 0 || cs.cursor === "pointer") {
            return el;
          }
          el = el.parentElement;
        }
      }
      return null;
    }

    function findPublishTimeGroup(): HTMLElement | null {
      const headings = Array.from(
        document.querySelectorAll<HTMLElement>("div, span, p, h1, h2, h3, h4, h5, h6"),
      ).filter((el) => textOf(el) === "发布时间");
      const groups: HTMLElement[] = [];
      const seen = new Set<HTMLElement>();
      for (const heading of headings) {
        let group = heading.parentElement;
        while (group !== null) {
          const options = Array.from(group.querySelectorAll<HTMLElement>("span, button"));
          if (options.some((el) => textOf(el) === desiredLabel)) {
            if (!seen.has(group)) {
              seen.add(group);
              groups.push(group);
            }
            break;
          }
          group = group.parentElement;
        }
      }
      return (
        groups.find((group) => {
          const option = Array.from(group.querySelectorAll<HTMLElement>("span, button")).find(
            (el) => textOf(el) === desiredLabel,
          );
          return option !== undefined && isVisible(option);
        }) ?? groups[0] ?? null
      );
    }

    function findPublishTimeOption(): HTMLElement | null {
      const group = findPublishTimeGroup();
      if (group === null) return null;
      return (
        Array.from(group.querySelectorAll<HTMLElement>("span, button")).find(
          (el) => textOf(el) === desiredLabel,
        ) ?? null
      );
    }

    function setDiag(step: string, extra: Record<string, unknown> = {}): void {
      try {
        (window as unknown as { __uaDouyinPublishTimeFilterDiag?: unknown }).__uaDouyinPublishTimeFilterDiag = {
          step,
          desiredLabel,
          ...extra,
        };
      } catch {
        /* best effort */
      }
    }

    async function waitForOption(): Promise<{ group: HTMLElement; option: HTMLElement } | null> {
      const deadline = Date.now() + 3000;
      do {
        const group = findPublishTimeGroup();
        if (group !== null) {
          const option = findPublishTimeOption();
          if (option !== null && isVisible(option)) return { group, option };
        }
        await new Promise<void>((resolve) => setTimeout(resolve, 80));
      } while (Date.now() < deadline);
      return null;
    }

    type OptionState = {
      className: string;
      ariaSelected: string | null;
      dataSelected: string | null;
      dataState: string | null;
      dataStatus: string | null;
      dataActive: string | null;
      styleKey: string;
    };

    function readOptionState(el: HTMLElement | null): OptionState | null {
      if (el === null) return null;
      const cs = window.getComputedStyle(el);
      return {
        className: el.className,
        ariaSelected: el.getAttribute("aria-selected"),
        dataSelected: el.getAttribute("data-selected"),
        dataState: el.getAttribute("data-state"),
        dataStatus: el.getAttribute("data-status"),
        dataActive: el.getAttribute("data-active"),
        styleKey: [
          cs.color,
          cs.backgroundColor,
          cs.fontWeight,
          cs.borderColor,
          cs.opacity,
        ].join("|"),
      };
    }

    function hasExplicitSelectedMarker(el: HTMLElement): boolean {
      if (el.classList.contains("u39cEW99")) return true;
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

    function optionStateChanged(current: OptionState | null, before: OptionState | null): boolean {
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

    function clickLikeUser(el: HTMLElement): void {
      el.scrollIntoView({ block: "center", inline: "center" });
      el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
      el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
      el.click();
    }

    async function waitUntilSelected(option: HTMLElement, beforeState: OptionState | null): Promise<boolean> {
      const deadline = Date.now() + 2000;
      do {
        const current = findPublishTimeOption() ?? option;
        if (!isVisible(current)) return true;
        if (hasExplicitSelectedMarker(current)) return true;
        if (optionStateChanged(readOptionState(current), beforeState)) return true;
        await new Promise<void>((resolve) => setTimeout(resolve, 80));
      } while (Date.now() < deadline);
      return false;
    }

    async function waitUntilClosed(): Promise<boolean> {
      const deadline = Date.now() + 2000;
      do {
        const current = findPublishTimeOption();
        if (current === null || !isVisible(current)) return true;
        await new Promise<void>((resolve) => setTimeout(resolve, 80));
      } while (Date.now() < deadline);
      return false;
    }

    const filterButton = findFilterButton();
    if (filterButton === null) {
      setDiag("filter-button-not-found");
      return false;
    }
    const currentOption = findPublishTimeOption();
    if (currentOption === null || !isVisible(currentOption)) clickLikeUser(filterButton);
    const found = await waitForOption();
    if (found === null) {
      setDiag("publish-time-option-not-found", {
        groupText: findPublishTimeGroup()?.textContent?.replace(/\s+/g, " ").trim().slice(0, 500) ?? "",
      });
      return false;
    }
    const optionStateBeforeClick = readOptionState(found.option);
    clickLikeUser(found.option);
    if (!(await waitUntilSelected(found.option, optionStateBeforeClick))) {
      setDiag("publish-time-option-not-selected", {
        optionText: found.option.textContent?.trim() ?? "",
        optionClass: found.option.className,
        optionStateBeforeClick,
        optionStateAfterClick: readOptionState(findPublishTimeOption() ?? found.option),
      });
      return false;
    }
    const visibleAfterSelection = findPublishTimeOption();
    if (visibleAfterSelection !== null && isVisible(visibleAfterSelection)) {
      clickLikeUser(filterButton);
      if (!(await waitUntilClosed())) {
        setDiag("filter-panel-not-closed", {
          optionText: found.option.textContent?.trim() ?? "",
          groupText: findPublishTimeGroup()?.textContent?.replace(/\s+/g, " ").trim().slice(0, 500) ?? "",
        });
        return false;
      }
    }
    setDiag("ok");
    return true;
  });
}

/**
 * Scroll the results column to reveal more cards. Returns true if the page
 * actually advanced (scrollHeight or visible-card-count grew); false when
 * we appear to have reached the bottom.
 */
export async function scrollToLoadMore<E extends DomEvaluator<{ advanced: boolean; height: number; cards: number }>>(
  page: E,
): Promise<{ advanced: boolean; height: number; cards: number }> {
  return page.evaluate(() => {
    const cardSel =
      '[data-e2e="search-result-card"], [data-e2e="scroll-list"] > *, [data-e2e="search-card-list"] > *, [class*="search-card-list"] > div, [class*="search-result-list"] > *, a[href*="/video/"]';
    const beforeHeight = document.documentElement.scrollHeight;
    const beforeCards = document.querySelectorAll(cardSel).length;
    // Try the inner scroll container first (Douyin usually has a
    // virtualised scroll list); fall back to window scroll.
    const inner = document.querySelector<HTMLElement>(
      '[data-e2e="scroll-list"], [class*="scroll-list"], [class*="search-result"][class*="scroll"]',
    );
    if (inner !== null) {
      inner.scrollTop = inner.scrollHeight;
    }
    window.scrollBy(0, Math.max(800, window.innerHeight * 0.9));
    const afterHeight = document.documentElement.scrollHeight;
    const afterCards = document.querySelectorAll(cardSel).length;
    return {
      advanced: afterHeight > beforeHeight || afterCards > beforeCards,
      height: afterHeight,
      cards: afterCards,
    };
  });
}

/**
 * Polls every 200 ms (cap at `timeoutMs`) until single-column layout is
 * detected. Resolves true on success; false on timeout.
 */
export async function waitForSingleColumnLayout<E extends DomEvaluator<boolean>>(
  page: E,
  timeoutMs: number,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isSingleColumnLayout(page)) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

/**
 * Blur whatever element currently holds focus. Needed before sending a
 * page-level hotkey (e.g. "h" to enter browse mode): after clicking the "单列"
 * toggle the button stays focused, so a subsequent `keyboard.press("h")` is
 * delivered to the button and never reaches Douyin's global hotkey listener.
 * Resolves true if anything was blurred, false if focus was already on body.
 */
export async function blurActiveElement<E extends DomEvaluator<boolean>>(
  page: E,
): Promise<boolean> {
  return page.evaluate(() => {
    const ae = document.activeElement;
    if (
      ae !== null &&
      ae !== document.body &&
      "blur" in ae &&
      typeof (ae as HTMLElement).blur === "function"
    ) {
      (ae as HTMLElement).blur();
      return true;
    }
    return false;
  });
}

/**
 * Detector — true iff the page is currently showing the browse-mode viewer
 * (the focused single-video player layered over search results, identified
 * by the stable `data-e2e="video-player-digg"` like-button marker).
 */
export async function isBrowseModeActive<E extends DomEvaluator<boolean>>(
  page: E,
): Promise<boolean> {
  return page.evaluate(() => {
    return document.querySelector('[data-e2e="video-player-digg"]') !== null;
  });
}

/**
 * Fallback for pages where `keyboard.press("h")` is swallowed by a focused
 * widget: synthesise a "h" KeyboardEvent and dispatch it through window /
 * document / body. Trusted-event listeners will ignore this, but Douyin's
 * own browse-mode trigger has historically also accepted dispatched events
 * on `window`. Returns true if at least one listener didn't preventDefault.
 */
export async function dispatchBrowseModeHotkey<E extends DomEvaluator<boolean>>(
  page: E,
): Promise<boolean> {
  return page.evaluate(() => {
    const init: KeyboardEventInit = {
      key: "h",
      code: "KeyH",
      keyCode: 72,
      which: 72,
      bubbles: true,
      cancelable: true,
    };
    const targets: EventTarget[] = [window, document, document.body];
    let delivered = false;
    for (const phase of ["keydown", "keypress", "keyup"] as const) {
      for (const t of targets) {
        const ev = new KeyboardEvent(phase, init);
        const ok = t.dispatchEvent(ev);
        if (ok) delivered = true;
      }
    }
    return delivered;
  });
}

interface CardHandle {
  href: string | null;
  caption: string;
  authorHandle: string;
  authorDisplayName: string | null;
  likeRaw: string;
  commentRaw: string;
  shareRaw: string;
  hashtags: string[];
  classification: CardClassification;
  index: number;
  total: number;
}

/**
 * Read all visible cards into an array of plain JSON-serialisable objects.
 * The executor calls `firstCard()` then `nextCard(currentIndex)` to walk.
 */
export async function readAllCards<E extends DomEvaluator<CardHandle[]>>(
  page: E,
): Promise<CardHandle[]> {
  return page.evaluate(() => {
    // Broad: prefer well-known data-e2e markers, but also fall back to any
    // anchor in the document that points at a /video/<id> URL — that's the
    // ground-truth signal that we're looking at a video card. We then walk
    // up to the closest "card" container so the surrounding caption / author
    // / stat elements are reachable from one anchor.
    const seen = new Set<HTMLElement>();
    const containers: HTMLElement[] = [];
    const e2eSelectors =
      '[data-e2e="search-result-card"], [data-e2e="scroll-list"] > *, [data-e2e="search-card-list"] > *, [class*="search-card-list"] > div, [class*="search-result-list"] > *';
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(e2eSelectors))) {
      if (!seen.has(el)) {
        seen.add(el);
        containers.push(el);
      }
    }
    if (containers.length === 0) {
      const links = Array.from(
        document.querySelectorAll<HTMLAnchorElement>('a[href*="/video/"], a[href*="/note/"]'),
      );
      for (const a of links) {
        const candidate =
          a.closest<HTMLElement>("li, article, [class*='card']") ??
          (a.parentElement as HTMLElement | null);
        if (candidate !== null && candidate !== undefined && !seen.has(candidate)) {
          seen.add(candidate);
          containers.push(candidate);
        }
      }
    }
    return containers.map((el, idx, arr): CardHandle => {
      const linkEl = el.querySelector<HTMLAnchorElement>('a[href*="/video/"], a[href*="/note/"]');
      const href = linkEl?.href ?? null;
      const captionEl = el.querySelector<HTMLElement>(
        '[class*="caption"], [class*="title"], [class*="desc"]',
      );
      const authorEl = el.querySelector<HTMLAnchorElement>('a[href*="/user/"]');
      const authorHandleAttr = authorEl?.href.match(/\/user\/([^/?#]+)/)?.[1] ?? null;
      const authorName = authorEl?.textContent?.trim() ?? null;
      const likeEl = el.querySelector<HTMLElement>('[class*="like"], [data-e2e*="like"]');
      const commentEl = el.querySelector<HTMLElement>(
        '[class*="comment"], [data-e2e*="comment"]',
      );
      const shareEl = el.querySelector<HTMLElement>('[class*="share"], [data-e2e*="share"]');
      const hashtagEls = el.querySelectorAll<HTMLElement>(
        '[class*="tag"], [class*="hashtag"], a[href*="/search/"]',
      );
      const hashtags = Array.from(hashtagEls)
        .map((h) => h.textContent?.replace(/^#/, "").trim() ?? "")
        .filter((s) => s.length > 0)
        .slice(0, 64);

      let classification: CardClassification = "other";
      if (el.querySelector('[class*="ad-marker"], [data-e2e="ad-card"]') !== null) classification = "ad";
      else if (el.querySelector('[class*="livestream"], [data-e2e="livestream-card"]') !== null) classification = "livestream";
      else if (linkEl?.href.includes("/user/")) classification = "profile";
      else if (linkEl?.href.includes("/topic/")) classification = "topic";
      else if (el.querySelector('[class*="removed"], [data-e2e="removed-card"]') !== null) classification = "removed";
      else if (linkEl?.href.includes("/video/") || linkEl?.href.includes("/note/")) classification = "video";

      return {
        href,
        caption: captionEl?.textContent?.trim() ?? "",
        authorHandle: authorHandleAttr ?? "",
        authorDisplayName: authorName,
        likeRaw: likeEl?.textContent?.trim() ?? "",
        commentRaw: commentEl?.textContent?.trim() ?? "",
        shareRaw: shareEl?.textContent?.trim() ?? "",
        hashtags,
        classification,
        index: idx,
        total: arr.length,
      };
    });
  });
}

export interface ClassifiedCard {
  classification: CardClassification;
  metadata: ExtractedCardMetadata | null;
  index: number;
  total: number;
}

export function liftCard(handle: CardHandle): ClassifiedCard {
  if (handle.classification !== "video") {
    return { classification: handle.classification, metadata: null, index: handle.index, total: handle.total };
  }
  const md: ExtractedCardMetadata = {
    href: handle.href,
    caption: handle.caption,
    authorHandle: handle.authorHandle,
    authorDisplayName: handle.authorDisplayName,
    likeCount: parseStat(handle.likeRaw),
    commentCount: parseStat(handle.commentRaw),
    shareCount: parseStat(handle.shareRaw),
    hashtags: handle.hashtags,
  };
  return { classification: "video", metadata: md, index: handle.index, total: handle.total };
}

export const __locators = LOCATORS;

// ─── Browse-mode (浏览模式) extraction ─────────────────────────────────────
//
// After the user clicks "单列" and presses "H", Douyin enters a focused
// single-video viewer. Pressing "ArrowDown" advances to the next video.
// In this mode the DOM exposes one full video at a time with caption,
// author handle, hashtags, like / comment / share counts, and a canonical
// /video/<id> URL on the current location.

export interface BrowseModeCommentItem {
  author: string;
  content: string;
  likeCount: number;
  timeText: string;
}

export interface DouyinDetailVideo {
  href: string | null;
  caption: string;
  authorHandle: string;
  authorDisplayName: string | null;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  collectCount: number;
  authorFollowerCount: number | null;
  hashtags: string[];
  pageUrl: string;
}

export interface BrowseModeVideo {
  /** Canonical douyin URL of the current video, or null if not extractable. */
  href: string | null;
  caption: string;
  authorHandle: string;
  authorDisplayName: string | null;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  collectCount: number;
  hashtags: string[];
  /** Top-level comments visible in the side panel. Up to 10. Empty if panel
   *  is collapsed / unloaded — we don't force-open to keep crawl times stable. */
  comments: BrowseModeCommentItem[];
}

interface BrowseModeRawComment {
  author: string;
  content: string;
  likeRaw: string;
  timeText: string;
}

interface BrowseModeRaw {
  href: string | null;
  caption: string;
  authorHandle: string;
  authorDisplayName: string | null;
  likeRaw: string;
  commentRaw: string;
  shareRaw: string;
  collectRaw: string;
  hashtags: string[];
  pageUrl: string;
  comments: BrowseModeRawComment[];
}

interface DouyinDetailRaw {
  found: boolean;
  href: string | null;
  caption: string;
  authorHandle: string;
  authorDisplayName: string | null;
  likeRaw: string;
  commentRaw: string;
  shareRaw: string;
  collectRaw: string;
  authorFollowerRaw: string | null;
  hashtags: string[];
  pageUrl: string;
}

/**
 * True when the current page is Douyin's standalone video detail layout.
 * This layout exposes all fields directly and does not require the search
 * browse-mode H/F hotkeys.
 */
export async function isDouyinDetailPage<E extends DomEvaluator<boolean>>(
  page: E,
): Promise<boolean> {
  return page.evaluate(() => {
    return document.querySelector('[data-e2e="detail-video-info"][data-e2e-aweme-id]') !== null;
  });
}

export async function waitForDouyinDetailPage<E extends DomEvaluator<boolean>>(
  page: E,
  timeoutMs: number,
  pollMs: number,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isDouyinDetailPage(page).catch(() => false)) return true;
    await new Promise((r) => setTimeout(r, pollMs));
  }
  return false;
}

export async function readDouyinDetailVideo<E extends DomEvaluator<DouyinDetailRaw>>(
  page: E,
): Promise<DouyinDetailVideo | null> {
  const raw = await page.evaluate((): DouyinDetailRaw => {
    function cleanText(rawText: string | null | undefined): string {
      return (rawText ?? "").replace(/\s+/g, " ").trim();
    }

    function firstOwnSpanText(root: HTMLElement): string {
      for (const child of Array.from(root.children)) {
        if (child instanceof HTMLSpanElement) {
          const text = cleanText(child.textContent);
          if (text.length > 0) return text;
        }
      }
      const direct = root.querySelector<HTMLElement>("span");
      return cleanText(direct?.textContent);
    }

    const detail = document.querySelector<HTMLElement>(
      '[data-e2e="detail-video-info"][data-e2e-aweme-id]',
    );
    if (detail === null) {
      return {
        found: false,
        href: null,
        caption: "",
        authorHandle: "",
        authorDisplayName: null,
        likeRaw: "",
        commentRaw: "",
        shareRaw: "",
        collectRaw: "",
        authorFollowerRaw: null,
        hashtags: [],
        pageUrl: location.href,
      };
    }

    const awemeId = detail.getAttribute("data-e2e-aweme-id");
    const canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const href =
      awemeId !== null && awemeId.length > 0
        ? `https://www.douyin.com/video/${awemeId}`
        : canonicalLink?.href?.includes("/video/")
          ? canonicalLink.href
          : location.pathname.startsWith("/video/")
            ? location.href
            : null;

    const titleEl =
      detail.querySelector<HTMLElement>("h1") ??
      detail.querySelector<HTMLElement>('[data-e2e="video-desc"]');
    let caption = cleanText(titleEl?.textContent);
    caption = caption.replace(/^(展开|收起)\s*/u, "").replace(/\s*(展开|收起)$/u, "").trim();

    const hashtags: string[] = [];
    const seenTags = new Set<string>();
    const tagScope = titleEl ?? detail;
    for (const a of Array.from(tagScope.querySelectorAll<HTMLElement>('a[href*="/search/"]'))) {
      const text = cleanText(a.textContent);
      if (!text.startsWith("#")) continue;
      const tag = text.replace(/^#+/u, "").trim();
      if (tag.length > 0 && !seenTags.has(tag)) {
        seenTags.add(tag);
        hashtags.push(tag);
      }
    }
    for (const match of cleanText(tagScope.textContent).matchAll(/#([\p{L}\p{N}_-]{1,64})/gu)) {
      const tag = match[1] ?? "";
      if (tag.length > 0 && !seenTags.has(tag)) {
        seenTags.add(tag);
        hashtags.push(tag);
      }
    }
    hashtags.splice(64);

    const statGroups = Array.from(detail.querySelectorAll<HTMLElement>(".fzu5HWhU"));
    const shareGroup =
      detail.querySelector<HTMLElement>('[data-e2e="video-share-icon-container"]') ?? null;
    const nonShareGroups = statGroups.filter((group) => group !== shareGroup);
    const likeRaw = firstOwnSpanText(nonShareGroups[0] ?? detail);
    const commentRaw = firstOwnSpanText(nonShareGroups[1] ?? detail);
    const collectRaw = firstOwnSpanText(nonShareGroups[2] ?? detail);
    const shareRaw = shareGroup !== null ? firstOwnSpanText(shareGroup) : firstOwnSpanText(nonShareGroups[3] ?? detail);

    const userInfo = document.querySelector<HTMLElement>('[data-e2e="user-info"]');
    const authorAnchor = userInfo?.querySelector<HTMLAnchorElement>('a[href*="/user/"]') ?? null;
    const authorHandle =
      authorAnchor?.href.match(/\/user\/([^/?#]+)/)?.[1] ??
      authorAnchor?.getAttribute("href")?.match(/\/user\/([^/?#]+)/)?.[1] ??
      "";
    const nameEl =
      userInfo?.querySelector<HTMLElement>('[data-click-from="title"]') ??
      userInfo?.querySelector<HTMLElement>(".eHjNILBn") ??
      null;
    const authorDisplayName = cleanText(nameEl?.textContent) || null;
    const userText = cleanText(userInfo?.textContent);
    const followerMatch = userText.match(/粉丝\s*([0-9,.，]+(?:万|亿|w|k|千)?)/iu);
    const authorFollowerRaw =
      followerMatch?.[1] !== undefined && followerMatch[1].length > 0
        ? `${followerMatch[1]}粉丝`
        : null;

    return {
      found: true,
      href,
      caption,
      authorHandle,
      authorDisplayName,
      likeRaw,
      commentRaw,
      shareRaw,
      collectRaw,
      authorFollowerRaw,
      hashtags,
      pageUrl: location.href,
    };
  });

  if (!raw.found) return null;
  return {
    href: raw.href,
    caption: raw.caption,
    authorHandle: raw.authorHandle,
    authorDisplayName: raw.authorDisplayName,
    likeCount: parseStat(raw.likeRaw),
    commentCount: parseStat(raw.commentRaw),
    shareCount: parseStat(raw.shareRaw),
    collectCount: parseStat(raw.collectRaw),
    authorFollowerCount:
      raw.authorFollowerRaw === null ? null : parseFollowerStat(raw.authorFollowerRaw),
    hashtags: raw.hashtags,
    pageUrl: raw.pageUrl,
  };
}

/**
 * Read the currently-focused video in browse mode. Tries multiple
 * selector strategies because the Douyin player DOM is volatile.
 */
export async function readCurrentBrowseVideo<E extends DomEvaluator<BrowseModeRaw>>(
  page: E,
): Promise<BrowseModeVideo & { pageUrl: string }> {
  const raw = await page.evaluate((): BrowseModeRaw => {
    // The search-results feed stays mounted while browse mode runs, so
    // every list card AND the focused viewer each render their own
    // `.basePlayerContainer` + `[data-e2e="video-player-digg"]`. Naively
    // querying document-wide grabs the first list card, not the in-play
    // overlay — that's why caption/like/author all stuck on the same
    // (wrong) value across iterations even though the post id (which comes
    // from the URL) advanced correctly.
    //
    // Heuristic: among all visible `.basePlayerContainer` nodes, the one
    // belonging to the focused viewer has the largest on-screen area
    // (typically a 600×900 player vs. 200×280 card thumbs). Pick that.
    function pickActiveContainer(): HTMLElement {
      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[class*="basePlayerContainer"], [data-e2e="video-detail"], [data-e2e*="detail-video"], [data-e2e="feed-active-video-container"], [class*="active-video"]',
        ),
      );
      let best: { el: HTMLElement; area: number } | null = null;
      for (const c of candidates) {
        const r = c.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) continue;
        if (r.bottom <= 0 || r.top >= window.innerHeight) continue;
        const area = r.width * r.height;
        if (best === null || area > best.area) {
          best = { el: c, area };
        }
      }
      return best?.el ?? document.body;
    }
    const activeContainer = pickActiveContainer();

    // The current post URL. Browse-mode in search results presents the active
    // video as a modal layered on /search/...?modal_id=<aweme_id>, so the
    // location pathname stays on /search/. Try canonical/anchor first, then
    // synthesise a /video/<id> URL from `modal_id`, finally fall back to
    // `location.href` only when it's already a /video/ pathname.
    const canonicalLink = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    const anchorWithVideo =
      activeContainer.querySelector<HTMLAnchorElement>('a[href*="/video/"]') ??
      document.querySelector<HTMLAnchorElement>('a[href*="/video/"]');
    let modalHref: string | null = null;
    try {
      const modalId = new URL(location.href).searchParams.get("modal_id");
      if (modalId !== null && /^[0-9A-Za-z_-]{6,32}$/.test(modalId)) {
        modalHref = `https://www.douyin.com/video/${modalId}`;
      }
    } catch {
      modalHref = null;
    }
    const href =
      (canonicalLink?.href !== undefined && canonicalLink.href.includes("/video/")
        ? canonicalLink.href
        : null) ??
      anchorWithVideo?.href ??
      modalHref ??
      (location.pathname.startsWith("/video/") ? location.href : null);

    // Caption lives in the right-side info panel (sibling of the player),
    // NOT inside basePlayerContainer. Each list card ALSO renders its own
    // `[data-e2e="video-desc"]` so a naive document-wide query picks the
    // wrong one. Use the same "largest visible" heuristic as the player
    // container — the focused viewer's caption panel is by far the biggest.
    function pickActiveCaption(): HTMLElement | null {
      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>('[data-e2e="video-desc"]'),
      );
      let best: { el: HTMLElement; area: number } | null = null;
      for (const c of candidates) {
        const r = c.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) continue;
        if (r.bottom <= 0 || r.top >= window.innerHeight) continue;
        const area = r.width * r.height;
        if (best === null || area > best.area) {
          best = { el: c, area };
        }
      }
      return best?.el ?? null;
    }
    const captionEl = pickActiveCaption();

    // Author display name lives in a stable, semantic class — the wrapper span
    // around the @-prefixed handle text. Scoped to the active player; we
    // deliberately do NOT fall back to `document.querySelector` because the
    // top-nav "我的主页" link is the global first `a[href*="/user/"]` and
    // would poison `authorHandle` to "self".
    const accountNameEl = activeContainer.querySelector<HTMLElement>(".account-name-text");
    // Author handle (the MS4wLjAB… opaque id) — prefer the /user/<id> anchor
    // wrapping the account-name-text span; fall back to the first /user/
    // anchor still inside the active player container.
    const authorAnchor =
      accountNameEl?.closest<HTMLAnchorElement>('a[href*="/user/"]') ??
      activeContainer.querySelector<HTMLAnchorElement>('a[href*="/user/"]');
    const authorHandle =
      authorAnchor?.href.match(/\/user\/([^/?#]+)/)?.[1] ?? "";
    const rawName =
      accountNameEl?.textContent?.trim() ?? authorAnchor?.textContent?.trim() ?? null;
    const authorName =
      rawName !== null && rawName.length > 0
        ? rawName.replace(/^@+/, "").trim()
        : null;

    // Stat buttons — scoped to the active player container so we don't read
    // the like/comment/share strip of an off-screen list card. Both DOM
    // shapes are tried (data-e2e markers + class heuristics) but neither
    // escapes the active-container scope.
    const likeEl =
      activeContainer.querySelector<HTMLElement>('[data-e2e="video-player-digg"]') ??
      activeContainer.querySelector<HTMLElement>(
        '[data-e2e*="like"], [class*="like-count"], [class*="like-num"]',
      );
    const commentEl =
      activeContainer.querySelector<HTMLElement>('[data-e2e="video-player-comment"]') ??
      activeContainer.querySelector<HTMLElement>(
        '[data-e2e*="comment"], [class*="comment-count"], [class*="comment-num"]',
      );
    const shareEl =
      activeContainer.querySelector<HTMLElement>('[data-e2e="video-player-share"]') ??
      activeContainer.querySelector<HTMLElement>(
        '[data-e2e*="share"], [class*="share-count"], [class*="share-num"]',
      );
    // Collect / favorite ("收藏") button. Douyin's stable marker follows the
    // same `video-player-<verb>` family, with `collect` / `favorite` /
    // `favourite` all observed across regions and revisions.
    const collectEl =
      activeContainer.querySelector<HTMLElement>('[data-e2e="video-player-collect"]') ??
      activeContainer.querySelector<HTMLElement>('[data-e2e="video-player-favorite"]') ??
      activeContainer.querySelector<HTMLElement>('[data-e2e="video-player-favourite"]') ??
      activeContainer.querySelector<HTMLElement>(
        '[data-e2e*="collect"], [data-e2e*="favorite"], [data-e2e*="favourite"], [class*="collect-count"], [class*="favorite-count"]',
      );

    // Hashtags are rendered as `<a><span>#topic</span></a>` *inside* the
    // caption block (no /search/ href, no `tag`/`hashtag` class to anchor
    // on). Walk the caption element only — anything outside is unrelated
    // navigation and would re-introduce the cross-card bleed we just
    // killed. Also accept plain `#word` text segments so we don't drop
    // hashtags that the page failed to wrap in an anchor.
    const hashtags: string[] = [];
    if (captionEl !== null) {
      const seen = new Set<string>();
      for (const a of Array.from(captionEl.querySelectorAll<HTMLElement>("a"))) {
        const t = a.textContent?.trim() ?? "";
        if (t.startsWith("#")) {
          const tag = t.replace(/^#+/, "").trim();
          if (tag.length > 0 && !seen.has(tag)) {
            seen.add(tag);
            hashtags.push(tag);
          }
        }
      }
      // Fallback for inline text-only hashtags (no <a> wrapper).
      const text = captionEl.textContent ?? "";
      for (const m of text.matchAll(/#([\p{L}\p{N}_]{1,50})/gu)) {
        const tag = m[1] ?? "";
        if (tag.length > 0 && !seen.has(tag)) {
          seen.add(tag);
          hashtags.push(tag);
        }
      }
      hashtags.splice(64);
    }

    // Strip the trailing "展开"/"收起" toggle button label that the caption
    // panel injects after the truncation point — it bleeds into textContent
    // because the button is a sibling-in-flow with the description spans.
    let captionText = captionEl?.textContent?.trim() ?? "";
    captionText = captionText.replace(/(展开|收起)\s*$/, "").trim();

    // ─── Top-level comments (best-effort, up to 10) ───────────────────────
    // Browse mode renders the comment panel as a sibling of the player. Each
    // top-level comment is a `[data-e2e="comment-item"]` (sometimes
    // `[data-e2e="comment-list-item"]`). Inside it:
    //   - author: `[data-e2e="comment-username"]` or `.user-name`
    //   - body:   `[data-e2e="comment-content"]` or descendants of `.comment-mainContent`
    //   - likes:  `[data-e2e="comment-digg-count"]` or `.digg-count`
    //   - time:   `.publish-time`, `[class*="time"]`
    // The panel may be collapsed; we don't force-open it, just read what's
    // already in the DOM. A reply list is rendered as nested
    // `[data-e2e="comment-item"]` under each parent, so we restrict to direct
    // children of the comment list root.
    const commentRoots = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-e2e="comment-list"], [class*="commentList"], [class*="comment-list"]',
      ),
    );
    let commentRoot: HTMLElement | null = null;
    {
      let bestArea = 0;
      for (const r of commentRoots) {
        const rect = r.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;
        const area = rect.width * rect.height;
        if (area > bestArea) {
          bestArea = area;
          commentRoot = r;
        }
      }
    }
    const commentItems: BrowseModeRawComment[] = [];
    if (commentRoot !== null) {
      const itemNodes = Array.from(
        commentRoot.querySelectorAll<HTMLElement>(
          '[data-e2e="comment-item"], [data-e2e="comment-list-item"]',
        ),
      );
      const seenSig = new Set<string>();
      for (const node of itemNodes) {
        if (commentItems.length >= 10) break;
        // Skip nested replies — keep only top-level. A reply's closest
        // ancestor `[data-e2e="comment-item"]` would not be itself.
        const parentItem = node.parentElement?.closest(
          '[data-e2e="comment-item"], [data-e2e="comment-list-item"]',
        );
        if (parentItem !== null && parentItem !== undefined) continue;

        const authorEl = node.querySelector<HTMLElement>(
          '[data-e2e="comment-username"], .user-name, [class*="userName"]',
        );
        const author = ((authorEl?.textContent ?? "").trim() || "未知")
          .replace(/^@+/, "")
          .slice(0, 256);
        const contentEl =
          node.querySelector<HTMLElement>(
            '[data-e2e="comment-content"], [class*="commentContent"], .comment-text',
          ) ?? node.querySelector<HTMLElement>('[class*="comment-mainContent"] span');
        let content = (contentEl?.textContent ?? "").trim();
        if (content.length === 0) continue;
        if (content.length > 1024) content = content.slice(0, 1024);

        const likeEl = node.querySelector<HTMLElement>(
          '[data-e2e="comment-digg-count"], .digg-count, [class*="diggCount"]',
        );
        const likeRaw = (likeEl?.textContent ?? "").trim();

        const timeEl = node.querySelector<HTMLElement>(
          '.publish-time, [class*="publishTime"], [class*="time"]',
        );
        const timeText = ((timeEl?.textContent ?? "").trim() || "").slice(0, 64);

        const sig = `${author}::${content.slice(0, 64)}`;
        if (seenSig.has(sig)) continue;
        seenSig.add(sig);
        commentItems.push({ author, content, likeRaw, timeText });
      }
    }

    return {
      href,
      caption: captionText,
      authorHandle,
      authorDisplayName: authorName,
      likeRaw: likeEl?.textContent?.trim() ?? "",
      commentRaw: commentEl?.textContent?.trim() ?? "",
      shareRaw: shareEl?.textContent?.trim() ?? "",
      collectRaw: collectEl?.textContent?.trim() ?? "",
      hashtags,
      pageUrl: location.href,
      // Best-effort: panel is usually closed when the main metadata is read,
      // so this is normally []. The executor opens the panel via the "x"
      // hotkey on the non-duplicate branch and re-reads via
      // readBrowseModeComments below.
      comments: commentItems,
    };
  });
  return {
    href: raw.href,
    caption: raw.caption,
    authorHandle: raw.authorHandle,
    authorDisplayName: raw.authorDisplayName,
    likeCount: parseStat(raw.likeRaw),
    commentCount: parseStat(raw.commentRaw),
    shareCount: parseStat(raw.shareRaw),
    collectCount: parseStat(raw.collectRaw),
    hashtags: raw.hashtags,
    pageUrl: raw.pageUrl,
    comments: raw.comments.map((c) => ({
      author: c.author,
      content: c.content,
      likeCount: c.likeRaw.length === 0 ? 0 : parseStat(c.likeRaw),
      timeText: c.timeText,
    })),
  };
}

/**
 * Synthetic-event fallback for the "x" hotkey. Mirrors `dispatchBrowseModeHotkey`
 * but fires a `KeyX` keypress on window/document/body — used when the
 * patchright `keyboard.press("x")` path does not surface the comment panel,
 * typically because focus has drifted to a non-listening element.
 */
export async function dispatchCommentPanelHotkey<E extends DomEvaluator<boolean>>(
  page: E,
): Promise<boolean> {
  return page.evaluate(() => {
    const init: KeyboardEventInit = {
      key: "x",
      code: "KeyX",
      keyCode: 88,
      which: 88,
      bubbles: true,
      cancelable: true,
    };
    const targets: EventTarget[] = [window, document, document.body];
    let delivered = false;
    for (const phase of ["keydown", "keypress", "keyup"] as const) {
      for (const t of targets) {
        const ev = new KeyboardEvent(phase, init);
        const ok = t.dispatchEvent(ev);
        if (ok) delivered = true;
      }
    }
    return delivered;
  });
}

/**
 * Probe whether the right-side comment panel is currently open. We simply
 * look for any visible `[data-e2e="comment-item"]` anywhere in the document
 * — that's the most reliable signal across Douyin DOM revisions, since the
 * wrapping list container's class name is volatile (hashed) but the per-item
 * `data-e2e` marker has been stable.
 */
export async function isCommentPanelOpen<E extends DomEvaluator<boolean>>(
  page: E,
): Promise<boolean> {
  return page.evaluate((): boolean => {
    const items = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-e2e="comment-item"], [data-e2e="comment-list-item"]',
      ),
    );
    for (const it of items) {
      const r = it.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return true;
    }
    return false;
  });
}

/**
 * Wait until at least one visible `[data-e2e="comment-item"]` is mounted, or
 * until `timeoutMs` elapses. Returns the final open-state plus a debug
 * snapshot. The debug payload is also stashed on
 * `window.__uaDouyinCommentDiag` so the executor can dump it for selector
 * troubleshooting.
 */
export async function waitForCommentPanel<
  E extends DomEvaluator<{ open: boolean; items: number; rootClass: string; rootDataE2e: string }>,
>(
  page: E,
  timeoutMs: number,
  pollIntervalMs: number,
): Promise<{ open: boolean; items: number; rootClass: string; rootDataE2e: string }> {
  const start = Date.now();
  let last: { open: boolean; items: number; rootClass: string; rootDataE2e: string } = {
    open: false,
    items: 0,
    rootClass: "",
    rootDataE2e: "",
  };
  for (;;) {
    last = await page.evaluate(
      (): { open: boolean; items: number; rootClass: string; rootDataE2e: string } => {
        const itemNodes = Array.from(
          document.querySelectorAll<HTMLElement>(
            '[data-e2e="comment-item"], [data-e2e="comment-list-item"]',
          ),
        );
        const visible: HTMLElement[] = [];
        for (const it of itemNodes) {
          const r = it.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) visible.push(it);
        }
        let rootClass = "";
        let rootDataE2e = "";
        if (visible.length > 0) {
          // Walk up to the nearest reasonable container for diagnostics.
          let p: HTMLElement | null = visible[0]!.parentElement;
          for (let i = 0; i < 6 && p !== null; i += 1) {
            const cls = p.className?.toString() ?? "";
            const e2e = p.getAttribute?.("data-e2e") ?? "";
            if (/comment|list|panel/i.test(cls) || /comment|list|panel/i.test(e2e)) {
              rootClass = cls.slice(0, 200);
              rootDataE2e = e2e.slice(0, 80);
              break;
            }
            p = p.parentElement;
          }
        }
        const out = {
          open: visible.length > 0,
          items: visible.length,
          rootClass,
          rootDataE2e,
        };
        try {
          (window as unknown as { __uaDouyinCommentDiag?: unknown }).__uaDouyinCommentDiag = {
            ...out,
            totalItemNodes: itemNodes.length,
          };
        } catch {
          /* ignore */
        }
        return out;
      },
    );
    if (last.open && last.items > 0) return last;
    if (Date.now() - start >= timeoutMs) return last;
    await new Promise<void>((resolve) => setTimeout(resolve, pollIntervalMs));
  }
}

/**
 * Read up to 10 top-level comments from the (already-open) comment panel.
 * Returns an empty array if no comment items are visible.
 *
 * Strategy: locate all `[data-e2e="comment-item"]` in the document, keep
 * only visible ones, and exclude nested replies (any item that has another
 * comment-item ancestor). The list-container class names on Douyin are
 * hashed and revision-specific, so we deliberately do not require a wrapping
 * `[data-e2e="comment-list"]` — items alone are the reliable anchor.
 */
export async function readBrowseModeComments<E extends DomEvaluator<BrowseModeRawComment[]>>(
  page: E,
): Promise<BrowseModeCommentItem[]> {
  const raw = await page.evaluate((): BrowseModeRawComment[] => {
    const allItems = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-e2e="comment-item"], [data-e2e="comment-list-item"]',
      ),
    );
    // Keep only top-level + visible nodes.
    const nodes: HTMLElement[] = [];
    for (const node of allItems) {
      const rect = node.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) continue;
      const parentItem = node.parentElement?.closest<HTMLElement>(
        '[data-e2e="comment-item"], [data-e2e="comment-list-item"]',
      );
      if (parentItem !== null && parentItem !== undefined) continue;
      nodes.push(node);
    }
    const items: BrowseModeRawComment[] = [];
    const seen = new Set<string>();
    for (const node of nodes) {
      if (items.length >= 10) break;

      // Author. Douyin's stable anchor is `[data-click-from="title"]`
      // wrapped inside the author anchor under `.comment-item-info-wrap`.
      // Fall back to `.b2riW_HJ a` (info row's anchor) and then to any
      // user-link anchor inside the info-wrap.
      const infoWrap = node.querySelector<HTMLElement>(".comment-item-info-wrap");
      const authorEl =
        node.querySelector<HTMLElement>('[data-click-from="title"]') ??
        infoWrap?.querySelector<HTMLElement>('a[href*="/user/"]') ??
        null;
      const author = ((authorEl?.textContent ?? "").trim() || "未知")
        .replace(/^@+/, "")
        .slice(0, 256);

      // Content. The comment text lives in the FIRST sibling div that
      // follows `.comment-item-info-wrap` and precedes the stats container.
      // Class names on that wrapper are hashed (e.g. `LvAtyU_f`), but the
      // structural position is stable. We additionally skip the stats wrap
      // (contains `.comment-item-stats-container`) and the trailing
      // reply-expand button.
      let contentEl: HTMLElement | null = null;
      let timeEl: HTMLElement | null = null;
      if (infoWrap !== null && infoWrap.parentElement !== null) {
        const sibs = Array.from(infoWrap.parentElement.children) as HTMLElement[];
        const startIdx = sibs.indexOf(infoWrap);
        const remaining: HTMLElement[] = [];
        for (let i = startIdx + 1; i < sibs.length; i += 1) {
          const sib = sibs[i]!;
          if (sib.querySelector(".comment-item-stats-container") !== null) continue;
          if (sib.tagName === "BUTTON") continue;
          if ((sib.textContent ?? "").trim().length === 0) continue;
          remaining.push(sib);
        }
        if (remaining.length > 0) contentEl = remaining[0]!;
        // The time element is the sibling RIGHT before the stats wrapper —
        // i.e. the last entry in `remaining` once we have at least 2 of them.
        if (remaining.length >= 2) timeEl = remaining[remaining.length - 1]!;
      }
      let content = (contentEl?.textContent ?? "").trim();
      // Strip the trailing "作者赞过" / "作者" badge text (sibling of the
      // content span — Douyin appends it inside the same wrapper).
      content = content.replace(/(作者赞过|作者点赞|作者)$/u, "").trim();
      if (content.length === 0) continue;
      if (content.length > 1024) content = content.slice(0, 1024);

      // Like count. Stats container is `.comment-item-stats-container`. The
      // first `<p>` inside it carries the like icon + a `<span>` with the
      // numeric label.
      const statsRoot = node.querySelector<HTMLElement>(".comment-item-stats-container");
      const likeEl = statsRoot?.querySelector<HTMLElement>("p span") ?? null;
      const likeRaw = (likeEl?.textContent ?? "").trim();

      // Time. Pulled from the structural-sibling lookup above; fall back to
      // searching for a span whose text matches a "X前" / "X天" pattern.
      let timeText = (timeEl?.textContent ?? "").trim();
      if (timeText.length === 0) {
        const candidates = Array.from(node.querySelectorAll<HTMLElement>("span"));
        for (const c of candidates) {
          const t = (c.textContent ?? "").trim();
          if (/(前|刚刚|分钟|小时|周|天|·)/.test(t) && t.length <= 40) {
            timeText = t;
            break;
          }
        }
      }
      timeText = timeText.slice(0, 64);

      const sig = `${author}::${content.slice(0, 64)}`;
      if (seen.has(sig)) continue;
      seen.add(sig);
      items.push({ author, content, likeRaw, timeText });
    }
    return items;
  });
  return raw.map((c) => ({
    author: c.author,
    content: c.content,
    likeCount: c.likeRaw.length === 0 ? 0 : parseStat(c.likeRaw),
    timeText: c.timeText,
  }));
}

// ─── Author-card (F key) follower-count read ──────────────────────────────
//
// While in browse mode, pressing the "F" hotkey opens an author detail card
// layered over the player. The card exposes a stats line shaped like
//   <div class="wRhsTKHs author-card-user-stats">4.9万粉丝<span></span>91.8万获赞</div>
// and an author name in
//   <div class="wa8Zu2U5 author-card-user-name">…<span class="…">数据与科学</span>…</div>.
// Pressing ESC closes the card. We use the stable class fragments
// `author-card-user-stats` and `author-card-user-name` rather than the
// volatile hashed prefix classes (wRhsTKHs / wa8Zu2U5) so a future Douyin
// rebuild that re-hashes class names doesn't break the lookup.

export interface AuthorCardRead {
  /** Display name read from the author card, trimmed and stripped of leading "@". */
  displayName: string | null;
  /** Stable sec_uid-like handle from the card anchor href when present. */
  authorHandle: string | null;
  /** Parsed follower count (从粉丝段). -1 if the stats element was found but unparseable. null if no stats element. */
  followerCount: number | null;
  /** True if the author-card-user-stats element was found at all. */
  found: boolean;
  /** Raw selected stats text, for diagnosing Douyin DOM changes. */
  statsText: string | null;
  /** Raw follower segment before parse, for diagnosing placeholder reads. */
  followerRaw: string | null;
  /** Number of stats nodes in the document. */
  statsCandidateCount: number;
  /** Number of visible stats nodes in the document. */
  visibleStatsCandidateCount: number;
  /** The selected stats node outerHTML, truncated for logs. */
  selectedStatsHtml: string | null;
  /** The selected /user/ anchor href when available. */
  selectedAnchorHref: string | null;
}

interface AuthorCardRaw {
  found: boolean;
  displayName: string | null;
  authorHandle: string | null;
  followerRaw: string | null;
  statsText: string | null;
  statsCandidateCount: number;
  visibleStatsCandidateCount: number;
  selectedStatsHtml: string | null;
  selectedAnchorHref: string | null;
}

/**
 * Read the currently-open author card. Returns `found: false` when the
 * author-card-user-stats element is absent (card not yet opened, or already
 * closed). The follower segment is the textContent up to the inner `<span>`
 * separator, e.g. the leading "4.9万粉丝" of "4.9万粉丝<span></span>91.8万获赞".
 */
export async function readAuthorCardFollowerCount<E extends DomEvaluator<AuthorCardRaw>>(
  page: E,
): Promise<AuthorCardRead> {
  const raw = await page.evaluate((): AuthorCardRaw => {
    function isVisible(el: HTMLElement): boolean {
      const cs = window.getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") return false;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return true;
      // jsdom has no layout boxes; keep unit tests meaningful while real
      // browser runs still require a positive rect for visible nodes.
      if (/jsdom/i.test(navigator.userAgent)) return true;
      return false;
    }

    function extractFollowerRaw(statsText: string): string {
      const directMatch = statsText.match(/([\d,.]+)\s*(万|亿|w|k|千)?\s*粉丝/u);
      if (directMatch !== null && directMatch[1] !== undefined) {
        return `${directMatch[1]}${directMatch[2] ?? ""}`;
      }
      const cutAtFenSi = statsText.indexOf("粉丝");
      if (cutAtFenSi >= 0) return statsText.slice(0, cutAtFenSi).trim();
      const cutAtHuoZan = statsText.indexOf("获赞");
      return (cutAtHuoZan >= 0 ? statsText.slice(0, cutAtHuoZan) : statsText).trim();
    }

    function parseFollowerRaw(rawText: string): number {
      let trimmed = rawText.replace(/\s+/g, "").replace(/[,，]/g, "");
      trimmed = trimmed.replace(/粉丝$/u, "").replace(/fans?$/i, "");
      const m = trimmed.match(/^([\d,.]+)\s*(万|亿|w|k|千)?$/i);
      if (m === null) {
        const direct = Number(trimmed);
        return Number.isFinite(direct) ? Math.round(direct) : -1;
      }
      const base = Number(m[1] ?? "");
      if (!Number.isFinite(base)) return -1;
      const unit = (m[2] ?? "").toLowerCase();
      const multiplier =
        unit === "亿" ? 100_000_000 : unit === "万" || unit === "w" ? 10_000 : unit === "k" || unit === "千" ? 1_000 : 1;
      return Math.round(base * multiplier);
    }

    type Candidate = {
      stats: HTMLElement;
      statsText: string;
      followerRaw: string;
      parsedFollower: number;
      rootAnchor: HTMLAnchorElement | null;
      score: number;
    };

    const allStats = Array.from(
      document.querySelectorAll<HTMLElement>('[class*="author-card-user-stats"]'),
    );
    const visibleStats = allStats.filter((el) => isVisible(el));
    const candidates: Candidate[] = visibleStats.map((stats): Candidate => {
      const statsText = (stats.textContent ?? "").replace(/\s+/g, " ").trim();
      const followerRaw = extractFollowerRaw(statsText).replace(/\s+/g, " ").trim();
      const parsedFollower = parseFollowerRaw(followerRaw);
      const rootAnchor = stats.closest<HTMLAnchorElement>('a[href*="/user/"]');
      const hasName =
        (rootAnchor?.querySelector<HTMLElement>('[class*="author-card-user-name"]') ?? null) !==
          null ||
        (stats.parentElement?.querySelector<HTMLElement>('[class*="author-card-user-name"]') ??
          null) !== null;
      const r = stats.getBoundingClientRect();
      const area = Math.max(0, Math.round(r.width * r.height));
      const score =
        (parsedFollower > 0 ? 10_000 : 0) +
        (/粉丝/u.test(statsText) ? 1_000 : 0) +
        (rootAnchor !== null ? 100 : 0) +
        (hasName ? 50 : 0) +
        Math.min(area, 10_000) / 10;
      return { stats, statsText, followerRaw, parsedFollower, rootAnchor, score };
    });
    candidates.sort((a, b) => b.score - a.score);
    const picked = candidates[0] ?? null;
    if (picked === null) {
      return {
        found: false,
        displayName: null,
        authorHandle: null,
        followerRaw: null,
        statsText: null,
        statsCandidateCount: allStats.length,
        visibleStatsCandidateCount: visibleStats.length,
        selectedStatsHtml: null,
        selectedAnchorHref: null,
      };
    }
    const stats = picked.stats;
    const statsText = picked.statsText;
    const followerRaw = picked.followerRaw;
    const cardRoot = picked.rootAnchor;

    const nameEl =
      cardRoot?.querySelector<HTMLElement>('[class*="author-card-user-name"]') ??
      stats.closest<HTMLElement>('a[href*="/user/"]')?.querySelector<HTMLElement>(
        '[class*="author-card-user-name"]',
      ) ??
      document.querySelector<HTMLElement>('[class*="author-card-user-name"]');
    let displayName: string | null = null;
    let authorHandle: string | null = null;
    let selectedAnchorHref: string | null = null;
    if (nameEl !== null) {
      const linkEl = nameEl.closest<HTMLAnchorElement>('a[href*="/user/"]');
      const href = linkEl?.getAttribute("href") ?? linkEl?.href ?? null;
      selectedAnchorHref = href;
      if (href !== null) {
        const matched = href.match(/\/user\/([^/?#]+)/);
        authorHandle = matched?.[1] ?? null;
      }
      // The name lives in the deepest `<span>` chain after a leading "@" span.
      const spans = nameEl.querySelectorAll<HTMLSpanElement>("span");
      // Pick the longest non-"@" span text — that's reliably the actual name.
      let best = "";
      for (const s of Array.from(spans)) {
        const t = (s.textContent ?? "").trim();
        if (t.length === 0 || t === "@") continue;
        if (t.length > best.length) best = t;
      }
      if (best.length === 0) {
        best = (nameEl.textContent ?? "").replace(/^@+/, "").trim();
      }
      displayName = best.length > 0 ? best.replace(/^@+/, "").trim() : null;
    }

    if (selectedAnchorHref === null) {
      selectedAnchorHref = cardRoot?.getAttribute("href") ?? cardRoot?.href ?? null;
      if (authorHandle === null && selectedAnchorHref !== null) {
        const matched = selectedAnchorHref.match(/\/user\/([^/?#]+)/);
        authorHandle = matched?.[1] ?? null;
      }
    }

    return {
      found: true,
      displayName,
      authorHandle,
      followerRaw: followerRaw.length > 0 ? followerRaw : statsText,
      statsText,
      statsCandidateCount: allStats.length,
      visibleStatsCandidateCount: visibleStats.length,
      selectedStatsHtml: stats.outerHTML.slice(0, 500),
      selectedAnchorHref,
    };
  });
  if (!raw.found) {
    return {
      found: false,
      displayName: null,
      authorHandle: null,
      followerCount: null,
      statsText: raw.statsText,
      followerRaw: raw.followerRaw,
      statsCandidateCount: raw.statsCandidateCount,
      visibleStatsCandidateCount: raw.visibleStatsCandidateCount,
      selectedStatsHtml: raw.selectedStatsHtml,
      selectedAnchorHref: raw.selectedAnchorHref,
    };
  }
  const followerCount = raw.followerRaw === null ? -1 : parseFollowerStat(raw.followerRaw);
  return {
    found: true,
    displayName: raw.displayName,
    authorHandle: raw.authorHandle,
    followerCount,
    statsText: raw.statsText,
    followerRaw: raw.followerRaw,
    statsCandidateCount: raw.statsCandidateCount,
    visibleStatsCandidateCount: raw.visibleStatsCandidateCount,
    selectedStatsHtml: raw.selectedStatsHtml,
    selectedAnchorHref: raw.selectedAnchorHref,
  };
}

/** True if a visible author-card shell or stats element is currently on screen. */
export async function isAuthorCardOpen<E extends DomEvaluator<boolean>>(page: E): Promise<boolean> {
  return page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[class*="author-card-user-stats"], [class*="author-card-user-name"]',
      ),
    );
    return nodes.some((el) => {
      const cs = window.getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") return false;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return true;
      return /jsdom/i.test(navigator.userAgent);
    });
  });
}

/**
 * Synthetic-event fallback for the "f" hotkey. Mirrors `dispatchBrowseModeHotkey`
 * but fires a `KeyF` keypress on window/document/body — used when the
 * patchright `keyboard.press("f")` path does not surface the author card,
 * usually because the active element swallowed the event.
 */
export async function dispatchAuthorCardHotkey<E extends DomEvaluator<boolean>>(
  page: E,
): Promise<boolean> {
  return page.evaluate(() => {
    const init: KeyboardEventInit = {
      key: "f",
      code: "KeyF",
      keyCode: 70,
      which: 70,
      bubbles: true,
      cancelable: true,
    };
    const targets: EventTarget[] = [window, document, document.body];
    let delivered = false;
    for (const phase of ["keydown", "keypress", "keyup"] as const) {
      for (const t of targets) {
        const ev = new KeyboardEvent(phase, init);
        const ok = t.dispatchEvent(ev);
        if (ok) delivered = true;
      }
    }
    return delivered;
  });
}

/** Poll every 100ms up to `timeoutMs` until the author card opens. */
export async function waitForAuthorCard<E extends DomEvaluator<boolean>>(
  page: E,
  timeoutMs: number,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isAuthorCardOpen(page)) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}

/** Poll every 100ms up to `timeoutMs` until the author card closes. */
export async function waitForAuthorCardClosed<E extends DomEvaluator<boolean>>(
  page: E,
  timeoutMs: number,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (!(await isAuthorCardOpen(page))) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}
