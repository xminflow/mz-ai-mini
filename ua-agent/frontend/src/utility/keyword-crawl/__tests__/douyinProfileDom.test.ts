/**
 * Regression tests for the profile-page DOM contract.
 *
 * These tests cover both the works-grid scroll probe and the profile stat
 * extraction logic. The latter previously flattened all leaf text in document
 * order, which could mis-pair the `关注` and `粉丝` values on the profile
 * header.
 */

import { afterEach, describe, expect, it } from "vitest";

import { readDouyinProfile, SCROLL_PROBE_FN_BODY } from "../domain/douyinProfileDom";

interface ProbeResult {
  cards: number;
  height: number;
  reachedEnd: boolean;
}

function runProbe(): ProbeResult {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const fn = new Function(SCROLL_PROBE_FN_BODY) as () => ProbeResult;
  return fn();
}

function makeGrid(cardCount: number): HTMLElement {
  const grid = document.createElement("div");
  grid.setAttribute("data-e2e", "user-post-list");
  for (let i = 0; i < cardCount; i++) {
    const card = document.createElement("li");
    const a = document.createElement("a");
    a.setAttribute("href", `https://www.douyin.com/video/${1000 + i}`);
    card.appendChild(a);
    grid.appendChild(card);
  }
  return grid;
}

function clearBody(): void {
  document.body.innerHTML = "";
}

const localEvaluator = {
  async evaluate<T>(fn: () => T | Promise<T>): Promise<T> {
    return fn();
  },
};

describe("SCROLL_PROBE_FN_BODY (works-grid probe)", () => {
  it("returns reachedEnd=false when grid is not yet loaded", () => {
    clearBody();
    const result = runProbe();
    expect(result.cards).toBe(0);
    expect(result.reachedEnd).toBe(false);
  });

  it("returns reachedEnd=false when sentinel text is inside a <script> tag", () => {
    clearBody();
    document.body.appendChild(makeGrid(8));
    const script = document.createElement("script");
    // Mimic Douyin's bundled JS shipping the i18n literal.
    script.textContent = `var i18n = { noMore: "暂时没有更多了" };`;
    document.body.appendChild(script);

    const result = runProbe();
    expect(result.cards).toBe(8);
    expect(result.reachedEnd).toBe(false);
  });

  it("returns reachedEnd=false when sentinel is hidden via display:none", () => {
    clearBody();
    const wrapper = document.createElement("div");
    wrapper.appendChild(makeGrid(8));
    const hidden = document.createElement("div");
    hidden.style.display = "none";
    hidden.textContent = "暂时没有更多了";
    wrapper.appendChild(hidden);
    document.body.appendChild(wrapper);

    const result = runProbe();
    expect(result.cards).toBe(8);
    expect(result.reachedEnd).toBe(false);
  });

  it("returns reachedEnd=false when sentinel lives in a recommendations sidebar (outside grid scope)", () => {
    clearBody();
    // Real Douyin layout: grid lives inside a tab-content panel; the
    // recommendations sidebar is at a higher layout level, so it is NOT a
    // descendant of grid.parentElement and the probe scope should miss it.
    const layout = document.createElement("div");
    const tabContent = document.createElement("div");
    tabContent.appendChild(makeGrid(8));
    const sidebar = document.createElement("aside");
    const sidebarFooter = document.createElement("p");
    sidebarFooter.textContent = "已加载全部";
    sidebar.appendChild(sidebarFooter);
    layout.appendChild(tabContent);
    layout.appendChild(sidebar);
    document.body.appendChild(layout);

    const result = runProbe();
    expect(result.cards).toBe(8);
    expect(result.reachedEnd).toBe(false);
  });

  it("returns reachedEnd=true when a visible sentinel sits next to the grid", () => {
    clearBody();
    const wrapper = document.createElement("div");
    wrapper.appendChild(makeGrid(8));
    const footer = document.createElement("p");
    footer.textContent = "暂时没有更多了";
    wrapper.appendChild(footer);
    document.body.appendChild(wrapper);

    const result = runProbe();
    expect(result.cards).toBe(8);
    expect(result.reachedEnd).toBe(true);
  });

  it("returns reachedEnd=false even when sentinel-near-grid exists, if no cards loaded yet", () => {
    clearBody();
    // Empty grid (no card anchors yet) + visible sentinel — common during
    // route transitions where the SPA has rendered scaffolding but no posts.
    // We must not declare "reached end" prematurely.
    const wrapper = document.createElement("div");
    const emptyGrid = document.createElement("div");
    emptyGrid.setAttribute("data-e2e", "user-post-list");
    wrapper.appendChild(emptyGrid);
    const footer = document.createElement("p");
    footer.textContent = "暂时没有更多了";
    wrapper.appendChild(footer);
    document.body.appendChild(wrapper);

    const result = runProbe();
    expect(result.cards).toBe(0);
    expect(result.reachedEnd).toBe(false);
  });
});

describe("readDouyinProfile", () => {
  afterEach(() => {
    clearBody();
  });

  it("reads 粉丝 from the dedicated stats block instead of the preceding 关注 count", async () => {
    document.body.innerHTML = `
      <div class="cuA7Ana_">
        <div class="Q1A_pjwq ELUP9h2u" data-e2e="user-info-follow">
          <div class="uvGnYXqn">关注</div>
          <div class="C1cxu0Vq">44</div>
        </div>
        <div class="Q1A_pjwq ELUP9h2u" data-e2e="user-info-fans">
          <div class="uvGnYXqn">粉丝</div>
          <div class="C1cxu0Vq">427.3万</div>
        </div>
        <div class="Q1A_pjwq" data-e2e="user-info-like">
          <div class="uvGnYXqn">获赞</div>
          <div class="C1cxu0Vq">3551.4万</div>
        </div>
      </div>
    `;

    const profile = await readDouyinProfile(localEvaluator);
    expect(profile.follow_count).toBe(44);
    expect(profile.fans_count).toBe(4_273_000);
    expect(profile.liked_count).toBe(35_514_000);
  });

  it("falls back to label-scoped blocks when data-e2e markers are absent", async () => {
    document.body.innerHTML = `
      <div class="profile-stats">
        <div class="stat"><span>关注</span><span>12</span></div>
        <div class="stat"><span>粉丝</span><span>9.8万</span></div>
        <div class="stat"><span>获赞</span><span>1.2万</span></div>
      </div>
    `;

    const profile = await readDouyinProfile(localEvaluator);
    expect(profile.follow_count).toBe(12);
    expect(profile.fans_count).toBe(98_000);
    expect(profile.liked_count).toBe(12_000);
  });
});
