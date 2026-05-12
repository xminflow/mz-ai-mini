import { useEffect, useRef } from "react";

interface SentinelOptions {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
  /** Observe-margin in pixels — pre-fetch before the sentinel is on screen. */
  rootMargin?: string;
}

/**
 * Walk up the DOM from `el` until we find an ancestor that is itself a
 * scroll container (overflow-y === auto/scroll/overlay). Returns null when
 * the document viewport is the scroll container, which is the IO default.
 */
function findScrollableAncestor(el: HTMLElement): HTMLElement | null {
  let p: HTMLElement | null = el.parentElement;
  while (p !== null && p !== document.body && p !== document.documentElement) {
    const cs = window.getComputedStyle(p);
    const oy = cs.overflowY;
    if (oy === "auto" || oy === "scroll" || oy === "overlay") {
      return p;
    }
    p = p.parentElement;
  }
  return null;
}

/**
 * Wires an IntersectionObserver to a sentinel `<div ref={ref} />` placed at
 * the bottom of an infinite list. Triggers `fetchNextPage()` whenever the
 * sentinel intersects the relevant scroll viewport AND there's a next page
 * AND no fetch is already in flight.
 *
 * The IO `root` is auto-detected as the closest ancestor of the sentinel
 * that is itself a scroll container — this is required when the page is
 * laid out with a fixed-height app shell (overflow-hidden on body) and an
 * inner pane handles the actual scrolling. If no such ancestor exists the
 * viewport is used.
 */
export function useInfiniteScrollSentinel({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  rootMargin = "400px",
}: SentinelOptions) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (el === null) return;
    if (!hasNextPage) return;

    const root = findScrollableAncestor(el);
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry === undefined) return;
        if (entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root, rootMargin },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, rootMargin]);

  return ref;
}
