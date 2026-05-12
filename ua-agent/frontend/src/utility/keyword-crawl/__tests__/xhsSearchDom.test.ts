import { afterEach, describe, expect, it } from "vitest";

import { applyPublishTimeFilter } from "../domain/xhsSearchDom";

describe("xhs applyPublishTimeFilter", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  const localEvaluator = {
    async evaluate<T>(fn: () => T | Promise<T>): Promise<T> {
      const src = `return (${fn.toString()})()`;
      const isolated = new Function(src) as () => T | Promise<T>;
      return isolated();
    },
  };

  function mountFilterPanel(): { panel: HTMLElement; clicks: string[] } {
    const clicks: string[] = [];
    document.body.innerHTML = `
      <div class="filter">
        <span>筛选</span>
        <svg class="reds-icon filter-icon" width="16" height="16"><use xlink:href="#chevron_down"></use></svg>
      </div>
      <div class="filter-panel" style="display:none;">
        <div class="filter-container">
          <div class="filters-wrapper">
            <div class="filters">
              <span>排序依据</span>
              <div class="tag-container" style="position: relative;">
                <div class="tags active" button-hp-installed="1" data-hp-kind="filter-tag-综合" aria-hidden="true" tabindex="-1" style="position:absolute;opacity:0.00001;pointer-events:auto;inset:0 auto auto 0;z-index:-1;width:96px;height:40px;"><span>综合</span></div>
                <div class="tags active" data-hp-bound="1"><span>综合</span></div>
                <div class="tags" button-hp-installed="1" data-hp-kind="filter-tag-最新" aria-hidden="true" tabindex="-1" style="position:absolute;opacity:0.00001;pointer-events:auto;inset:0 auto auto 108px;z-index:-1;width:96px;height:40px;"><span>最新</span></div>
                <div class="tags" data-hp-bound="1"><span>最新</span></div>
              </div>
            </div>
            <div class="filters">
              <span>发布时间</span>
              <div class="tag-container" style="position: relative;">
                <div class="tags active"><span>不限</span></div>
                <div class="tags" button-hp-installed="1" data-hp-kind="filter-tag-一天内" aria-hidden="true" tabindex="-1" style="position:absolute;opacity:0.00001;pointer-events:auto;inset:0 auto auto 108px;z-index:-1;width:96px;height:40px;"><span>一天内</span></div>
                <div class="tags" data-hp-bound="1"><span>一天内</span></div>
                <div class="tags" button-hp-installed="1" data-hp-kind="filter-tag-一周内" aria-hidden="true" tabindex="-1" style="position:absolute;opacity:0.00001;pointer-events:auto;inset:0 auto auto 216px;z-index:-1;width:96px;height:40px;"><span>一周内</span></div>
                <div class="tags" data-hp-bound="1"><span>一周内</span></div>
                <div class="tags" button-hp-installed="1" data-hp-kind="filter-tag-半年内" aria-hidden="true" tabindex="-1" style="position:absolute;opacity:0.00001;pointer-events:auto;inset:50px auto auto 0;z-index:-1;width:96px;height:40px;"><span>半年内</span></div>
                <div class="tags" data-hp-bound="1"><span>半年内</span></div>
              </div>
            </div>
          </div>
          <div class="operation-container" style="position: relative;">
            <div class="operation" button-hp-installed="1" data-hp-kind="filter-op-收起" aria-hidden="true" tabindex="-1" style="position:absolute;opacity:0.00001;pointer-events:auto;inset:10px auto auto 168px;z-index:-1;width:152px;height:40px;">收起</div>
            <div class="operation" data-hp-bound="1">收起</div>
          </div>
        </div>
      </div>
    `;

    const filterButton = document.querySelector<HTMLElement>(".filter")!;
    const panel = document.querySelector<HTMLElement>(".filter-panel")!;
    const closeOp = Array.from(document.querySelectorAll<HTMLElement>(".operation")).find(
      (el) => el.hasAttribute("data-hp-bound"),
    )!;

    filterButton.addEventListener("click", () => {
      clicks.push(panel.style.display === "none" ? "open" : "close");
      panel.style.display = panel.style.display === "none" ? "block" : "none";
    });

    closeOp.addEventListener("click", () => {
      clicks.push("收起");
      panel.style.display = "none";
    });

    const groups = Array.from(document.querySelectorAll<HTMLElement>(".filters"));
    for (const group of groups) {
      const options = Array.from(group.querySelectorAll<HTMLElement>(".tags")).filter((el) =>
        el.hasAttribute("data-hp-bound") || !el.hasAttribute("button-hp-installed"),
      );
      for (const option of options) {
        option.addEventListener("click", () => {
          clicks.push(option.textContent?.replace(/\s+/g, "").trim() ?? "");
          for (const peer of options) peer.classList.remove("active");
          option.classList.add("active");
        });
      }
    }

    return { panel, clicks };
  }

  function textOf(el: Element | null): string {
    return (el?.textContent ?? "").replace(/\s+/g, "").trim();
  }

  function findSelectedVisibleTag(group: HTMLElement): HTMLElement | undefined {
    return Array.from(group.querySelectorAll<HTMLElement>(".tags")).find(
      (el) =>
        el.classList.contains("active") &&
        el.getAttribute("aria-hidden") !== "true" &&
        !el.hasAttribute("button-hp-installed"),
    );
  }

  it("opens the filter panel, switches sort to 最新, selects 一周内, then closes", async () => {
    const { panel, clicks } = mountFilterPanel();
    const ok = await applyPublishTimeFilter(localEvaluator, "week");
    expect(ok).toBe(true);
    expect(clicks).toEqual(["open", "最新", "一周内", "收起"]);
    expect(panel.style.display).toBe("none");

    const sortGroup = Array.from(document.querySelectorAll<HTMLElement>(".filters")).find(
      (el) => el.querySelector("span")?.textContent?.trim() === "排序依据",
    )!;
    const timeGroup = Array.from(document.querySelectorAll<HTMLElement>(".filters")).find(
      (el) => el.querySelector("span")?.textContent?.trim() === "发布时间",
    )!;
    expect(textOf(findSelectedVisibleTag(sortGroup) ?? null)).toBe("最新");
    expect(textOf(findSelectedVisibleTag(timeGroup) ?? null)).toBe("一周内");
  });
});
