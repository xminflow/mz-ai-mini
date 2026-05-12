import { afterEach, describe, expect, it } from "vitest";

import {
  applyPublishTimeFilter,
  isAuthorCardOpen,
  liftCard,
  parseFollowerStat,
  parseStat,
  readAuthorCardFollowerCount,
  readCurrentBrowseVideo,
  readDouyinDetailVideo,
} from "../domain/douyinSearchDom";

describe("parseStat", () => {
  it("parses plain numbers", () => {
    expect(parseStat("1234")).toBe(1234);
  });
  it("parses 万 / w as 10_000 multiplier", () => {
    expect(parseStat("1.2万")).toBe(12_000);
    expect(parseStat("3.5w")).toBe(35_000);
  });
  it("parses 千 / k as 1_000 multiplier", () => {
    expect(parseStat("1.2k")).toBe(1_200);
    expect(parseStat("2千")).toBe(2_000);
  });
  it("strips commas", () => {
    expect(parseStat("12,345")).toBe(12_345);
    expect(parseStat("12，345")).toBe(12_345);
  });
  it("returns -1 for empty / null / unparseable", () => {
    expect(parseStat("")).toBe(-1);
    expect(parseStat(null)).toBe(-1);
    expect(parseStat(undefined)).toBe(-1);
    expect(parseStat("nope")).toBe(-1);
  });
});

describe("liftCard", () => {
  it("returns metadata for a video card", () => {
    const out = liftCard({
      href: "https://www.douyin.com/video/abc",
      caption: "标题",
      authorHandle: "MS4wLjABAAAA",
      authorDisplayName: "Alice",
      likeRaw: "1.2万",
      commentRaw: "200",
      shareRaw: "10",
      hashtags: ["前端"],
      classification: "video",
      index: 0,
      total: 5,
    });
    expect(out.classification).toBe("video");
    expect(out.metadata?.likeCount).toBe(12_000);
    expect(out.metadata?.caption).toBe("标题");
    expect(out.metadata?.hashtags).toEqual(["前端"]);
  });

  it("returns null metadata for ad / livestream / removed cards", () => {
    for (const cls of ["ad", "livestream", "removed", "topic", "profile", "other"] as const) {
      const out = liftCard({
        href: null,
        caption: "",
        authorHandle: "",
        authorDisplayName: null,
        likeRaw: "",
        commentRaw: "",
        shareRaw: "",
        hashtags: [],
        classification: cls,
        index: 0,
        total: 1,
      });
      expect(out.classification).toBe(cls);
      expect(out.metadata).toBeNull();
    }
  });
});

describe("applyPublishTimeFilter", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  const localEvaluator = {
    async evaluate<T>(fn: () => T | Promise<T>): Promise<T> {
      return fn();
    },
  };

  function mountFilterPanel(
    autoCloseOnOption = false,
    selectedClass = "u39cEW99",
  ): { panel: HTMLElement; clicks: string[] } {
    const selectedClassTokens = selectedClass.split(/\s+/).filter(Boolean);
    document.body.innerHTML = `
      <div class="QqI8CXJa" tabindex="0" style="margin-left: 22px;">
        <span class="mGU8JlJS">筛选<svg class="arrow"></svg></span>
        <div style="display: none;">
          <div>
            <div class="ja2Fx5Hj">排序依据</div>
            <span data-index1="0" data-index2="0" class="SUqP5eBO u39cEW99">综合排序</span>
            <span data-index1="0" data-index2="1" class="SUqP5eBO">最新发布</span>
            <span data-index1="0" data-index2="2" class="SUqP5eBO">最多点赞</span>
          </div>
          <div>
            <div class="ja2Fx5Hj">发布时间</div>
            <span data-index1="1" data-index2="0" class="SUqP5eBO u39cEW99">不限</span>
            <span data-index1="1" data-index2="1" class="SUqP5eBO">一天内</span>
            <span data-index1="1" data-index2="2" class="SUqP5eBO">一周内</span>
            <span data-index1="1" data-index2="3" class="SUqP5eBO">半年内</span>
          </div>
          <div>
            <div class="ja2Fx5Hj">视频时长</div>
            <span data-index1="2" data-index2="0" class="SUqP5eBO u39cEW99">不限</span>
            <span data-index1="2" data-index2="1" class="SUqP5eBO">1分钟以下</span>
          </div>
        </div>
      </div>
    `;
    const root = document.querySelector<HTMLElement>(".QqI8CXJa")!;
    const panel = root.lastElementChild as HTMLElement;
    const clicks: string[] = [];
    root.addEventListener("click", (event) => {
      if (event.target instanceof Node && panel.contains(event.target)) return;
      clicks.push(panel.style.display === "none" ? "open" : "close");
      panel.style.display = panel.style.display === "none" ? "block" : "none";
    });
    for (const option of Array.from(panel.querySelectorAll<HTMLElement>('span[data-index1="1"]'))) {
      option.addEventListener("click", () => {
        clicks.push(option.textContent?.trim() ?? "");
        for (const peer of Array.from(panel.querySelectorAll<HTMLElement>('span[data-index1="1"]'))) {
          for (const token of selectedClassTokens) peer.classList.remove(token);
        }
        for (const token of selectedClassTokens) option.classList.add(token);
        if (autoCloseOnOption) {
          clicks.push("auto-close");
          panel.style.display = "none";
        }
      });
    }
    return { panel, clicks };
  }

  it("opens the filter panel, selects the publish-time option, then closes the panel", async () => {
    const { panel, clicks } = mountFilterPanel();
    const ok = await applyPublishTimeFilter(localEvaluator, "week");
    expect(ok).toBe(true);
    expect(clicks).toEqual(["open", "一周内", "close"]);
    expect(panel.style.display).toBe("none");
    expect(
      document.querySelector<HTMLElement>('span[data-index1="1"].u39cEW99')?.textContent?.trim(),
    ).toBe("一周内");
  });

  it("does not reopen the filter panel when the site auto-closes it after selection", async () => {
    const { panel, clicks } = mountFilterPanel(true);
    const ok = await applyPublishTimeFilter(localEvaluator, "week");
    expect(ok).toBe(true);
    expect(clicks).toEqual(["open", "一周内", "auto-close"]);
    expect(panel.style.display).toBe("none");
  });

  it("accepts the current Douyin selected class shape when the option is selected", async () => {
    const { panel, clicks } = mountFilterPanel(false, "eXMmo3JR sDNqBVWH");
    const ok = await applyPublishTimeFilter(localEvaluator, "week");
    expect(ok).toBe(true);
    expect(clicks).toEqual(["open", "一周内", "close"]);
    expect(panel.style.display).toBe("none");
  });
});

describe("readCurrentBrowseVideo (browse mode)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // Live-DOM evaluator that runs the supplied function in the current jsdom
  // environment — mimics what the real browser-side `evaluate` does.
  const localEvaluator = {
    async evaluate<T>(fn: () => T | Promise<T>): Promise<T> {
      return fn();
    },
  };

  it("extracts the like count from the video-player-digg button", async () => {
    document.body.innerHTML = `
      <div data-e2e="video-player-digg">
        <div class="UIQajZAR"><div class="UcFxoJav"><svg></svg></div></div>
        <div class="KV_gO8oI">52</div>
      </div>
      <a href="/user/MS4wLjABAAAA-handle"><span class="account-name-text">@工具怪 Talen</span></a>
      <div data-e2e="video-player-comment"><svg></svg><div>34</div></div>
      <div data-e2e="video-player-share"><svg></svg><div>1.2万</div></div>
      <div data-e2e="video-player-collect"><svg></svg><div>2.3万</div></div>
    `;
    const video = await readCurrentBrowseVideo(localEvaluator);
    expect(video.likeCount).toBe(52);
    expect(video.commentCount).toBe(34);
    expect(video.shareCount).toBe(12_000);
    expect(video.collectCount).toBe(23_000);
  });

  it("uses .account-name-text for display name (stripping @) and resolves the handle from its parent /user/ anchor", async () => {
    document.body.innerHTML = `
      <a href="https://www.douyin.com/user/MS4wLjABAAAA-handle">
        <span class="account-name-text"><span><span><span><span><span><span>@工具怪 Talen</span></span></span></span></span></span></span>
      </a>
      <a href="/user/sidebar-recommendation">侧栏推荐</a>
    `;
    const video = await readCurrentBrowseVideo(localEvaluator);
    expect(video.authorDisplayName).toBe("工具怪 Talen");
    expect(video.authorHandle).toBe("MS4wLjABAAAA-handle");
  });

  it("falls back to the first /user/ anchor when account-name-text is absent", async () => {
    document.body.innerHTML = `
      <a href="/user/fallback-handle"><img alt="avatar" /></a>
    `;
    const video = await readCurrentBrowseVideo(localEvaluator);
    expect(video.authorHandle).toBe("fallback-handle");
  });

  it("returns -1 like count and null display name when nothing is present", async () => {
    document.body.innerHTML = `<div></div>`;
    const video = await readCurrentBrowseVideo(localEvaluator);
    expect(video.likeCount).toBe(-1);
    expect(video.collectCount).toBe(-1);
    expect(video.authorDisplayName).toBeNull();
    expect(video.authorHandle).toBe("");
  });

  it("picks the largest visible [data-e2e=video-desc] for caption + parses hashtags inside it", async () => {
    document.body.innerHTML = `
      <div data-e2e="video-desc" id="card-A">
        <span>列表卡 A 短文案</span>
        <a><span>#误打误撞</span></a>
      </div>
      <div data-e2e="video-desc" id="card-B">
        <span>列表卡 B 短文案</span>
      </div>
      <div data-e2e="video-desc" id="overlay">
        <span>前端解散，哈哈哈哈哈，别看，看下一个就是你！！！！！</span>
        <a><span>#程序员</span></a>
        <a><span>#裁员</span></a>
        <a><span>#大厂</span></a>
        <button>展开</button>
      </div>
    `;
    const stubs: Array<[string, { x: number; y: number; width: number; height: number }]> = [
      ["card-A", { x: 0, y: 0, width: 100, height: 50 }],
      ["card-B", { x: 0, y: 100, width: 100, height: 50 }],
      ["overlay", { x: 200, y: 0, width: 400, height: 200 }],
    ];
    for (const [id, r] of stubs) {
      const el = document.getElementById(id)!;
      const dom = {
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        top: r.y,
        left: r.x,
        right: r.x + r.width,
        bottom: r.y + r.height,
        toJSON() {
          return this;
        },
      };
      Object.defineProperty(el, "getBoundingClientRect", { value: () => dom });
    }
    const video = await readCurrentBrowseVideo(localEvaluator);
    expect(video.caption).toMatch(/前端解散/);
    expect(video.caption).not.toMatch(/列表卡/);
    expect(video.caption).not.toMatch(/展开$/);
    expect(video.hashtags).toEqual(["程序员", "裁员", "大厂"]);
  });

  it("scopes extraction to the largest visible .basePlayerContainer when multiple coexist", async () => {
    // Simulates the real Douyin search page with the result-list still
    // mounted under a focused-video overlay. Each card and the overlay
    // each render their own .basePlayerContainer + video-player-digg.
    document.body.innerHTML = `
      <div class="basePlayerContainer card-card-A">
        <div data-e2e="video-player-digg"><svg></svg><div>99999</div></div>
        <a href="/user/list-card-author-A"><span class="account-name-text">@列表作者A</span></a>
      </div>
      <div class="basePlayerContainer card-card-B">
        <div data-e2e="video-player-digg"><svg></svg><div>88888</div></div>
        <a href="/user/list-card-author-B"><span class="account-name-text">@列表作者B</span></a>
      </div>
      <div class="basePlayerContainer focused-overlay">
        <div data-e2e="video-player-digg"><svg></svg><div>52</div></div>
        <a href="/user/focused-video-author"><span class="account-name-text">@浮层作者</span></a>
      </div>
    `;
    // jsdom returns 0×0 from getBoundingClientRect by default — stub each
    // container so the largest-area heuristic has something to compare.
    const containers = document.querySelectorAll<HTMLElement>(".basePlayerContainer");
    const rects = [
      { x: 0, y: 0, width: 200, height: 200 },          // list card A
      { x: 0, y: 220, width: 200, height: 200 },        // list card B
      { x: 200, y: 0, width: 600, height: 800 },        // focused overlay
    ];
    containers.forEach((el, i) => {
      const r = rects[i]!;
      const dom = {
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        top: r.y,
        left: r.x,
        right: r.x + r.width,
        bottom: r.y + r.height,
        toJSON() {
          return this;
        },
      };
      Object.defineProperty(el, "getBoundingClientRect", { value: () => dom });
    });
    const video = await readCurrentBrowseVideo(localEvaluator);
    expect(video.likeCount).toBe(52);
    expect(video.authorHandle).toBe("focused-video-author");
    expect(video.authorDisplayName).toBe("浮层作者");
  });
});

describe("readDouyinDetailVideo (standalone detail page)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  const localEvaluator = {
    async evaluate<T>(fn: () => T | Promise<T>): Promise<T> {
      return fn();
    },
  };

  it("extracts title, stats, author and follower count from the detail page DOM", async () => {
    document.body.innerHTML = `
      <div data-e2e="detail-video-info" data-e2e-aweme-id="7613213990534509425">
        <div>
          <button type="button">展开</button>
          <h1>
            <span>第31集 | </span>
            <span>我不够宽阔的臂膀也会是你的，温暖怀抱。 </span>
            <a href="//www.douyin.com/search/topic-a"><span>#青年创作者成长计划</span></a>
            <a href="//www.douyin.com/search/topic-b"><span>#我来开唱</span></a>
            <a href="//www.douyin.com/search/topic-c"><span>#做我老婆好不好翻唱</span></a>
          </h1>
        </div>
        <div class="YicB0lo_">
          <div class="fzu5HWhU"><div><svg></svg></div><span class="LJQOunN5">16.8万</span></div>
          <div class="fzu5HWhU"><div><svg></svg></div><span class="LJQOunN5">3965</span></div>
          <div class="fzu5HWhU"><div><svg></svg></div><span class="LJQOunN5">1.6万</span></div>
          <div class="DYolIlD6 fzu5HWhU" data-e2e="video-share-icon-container">
            <div><svg></svg></div><span class="ryCyNi1A">2.5万</span>
          </div>
        </div>
        <span data-e2e="detail-video-publish-time">发布时间：2026-03-04 12:00</span>
      </div>
      <div data-e2e="user-info">
        <a href="//www.douyin.com/user/MS4wLjABAAAAOPEtgY68bK3SAXUVsE8Z6pDdsIzRV6v-WXHXI70ZgM8"></a>
        <div data-click-from="title"><span>梁琪清.</span></div>
        <p><span>粉丝</span><span>163.1万</span><span>获赞</span><span>2343.6万</span></p>
      </div>
    `;

    const video = await readDouyinDetailVideo(localEvaluator);
    expect(video).not.toBeNull();
    expect(video?.href).toBe("https://www.douyin.com/video/7613213990534509425");
    expect(video?.caption).toContain("第31集 | 我不够宽阔的臂膀也会是你的，温暖怀抱。");
    expect(video?.hashtags).toEqual(["青年创作者成长计划", "我来开唱", "做我老婆好不好翻唱"]);
    expect(video?.likeCount).toBe(168_000);
    expect(video?.commentCount).toBe(3965);
    expect(video?.collectCount).toBe(16_000);
    expect(video?.shareCount).toBe(25_000);
    expect(video?.authorDisplayName).toBe("梁琪清.");
    expect(video?.authorHandle).toBe("MS4wLjABAAAAOPEtgY68bK3SAXUVsE8Z6pDdsIzRV6v-WXHXI70ZgM8");
    expect(video?.authorFollowerCount).toBe(1_631_000);
  });

  it("returns null when the page is not a standalone detail page", async () => {
    document.body.innerHTML = `<div data-e2e="video-player-digg">12</div>`;
    await expect(readDouyinDetailVideo(localEvaluator)).resolves.toBeNull();
  });
});

describe("parseFollowerStat", () => {
  it("parses 万-suffixed follower strings", () => {
    expect(parseFollowerStat("4.9万粉丝")).toBe(49_000);
    expect(parseFollowerStat("12.3万粉丝")).toBe(123_000);
  });
  it("parses 亿-suffixed follower strings", () => {
    expect(parseFollowerStat("1.2亿粉丝")).toBe(120_000_000);
  });
  it("parses k / 千 follower strings", () => {
    expect(parseFollowerStat("1.5k粉丝")).toBe(1_500);
    expect(parseFollowerStat("2千粉丝")).toBe(2_000);
  });
  it("parses plain integer follower strings", () => {
    expect(parseFollowerStat("1234粉丝")).toBe(1234);
    expect(parseFollowerStat("1234")).toBe(1234);
  });
  it("strips commas, full-width commas and surrounding whitespace", () => {
    expect(parseFollowerStat(" 12,345 粉丝 ")).toBe(12_345);
    expect(parseFollowerStat("12，345粉丝")).toBe(12_345);
  });
  it("returns -1 on null / empty / unparseable input", () => {
    expect(parseFollowerStat(null)).toBe(-1);
    expect(parseFollowerStat(undefined)).toBe(-1);
    expect(parseFollowerStat("")).toBe(-1);
    expect(parseFollowerStat("粉丝")).toBe(-1);
    expect(parseFollowerStat("nope")).toBe(-1);
  });
});

describe("readAuthorCardFollowerCount", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  const localEvaluator = {
    async evaluate<T>(fn: () => T | Promise<T>): Promise<T> {
      return fn();
    },
  };

  it("returns found=false when the card isn't open", async () => {
    document.body.innerHTML = `<div>nothing</div>`;
    const out = await readAuthorCardFollowerCount(localEvaluator);
    expect(out.found).toBe(false);
    expect(out.followerCount).toBeNull();
    expect(await isAuthorCardOpen(localEvaluator)).toBe(false);
  });

  it("treats a visible author-card name as open while stats are still hydrating", async () => {
    document.body.innerHTML = `<div class="author-card-user-name">胡说老王</div>`;
    const out = await readAuthorCardFollowerCount(localEvaluator);
    expect(out.found).toBe(false);
    expect(await isAuthorCardOpen(localEvaluator)).toBe(true);
  });

  it("parses 4.9万粉丝 from the user-supplied stats element shape", async () => {
    // The literal shape provided by the user — Douyin's author-card popup.
    document.body.innerHTML = `
      <div class="wRhsTKHs author-card-user-stats">4.9万粉丝<span></span>91.8万获赞</div>
    `;
    const out = await readAuthorCardFollowerCount(localEvaluator);
    expect(out.found).toBe(true);
    expect(out.followerCount).toBe(49_000);
    expect(await isAuthorCardOpen(localEvaluator)).toBe(true);
  });

  it("reads the deepest non-@ span as displayName from author-card-user-name", async () => {
    document.body.innerHTML = `
      <div class="wa8Zu2U5 author-card-user-name">
        <span class="Czcn9JPI">@</span>
        <span><span class="arnSiSbK w06vqa5G"><span><span><span><span>数据与科学</span></span></span></span></span></span>
      </div>
      <div class="wRhsTKHs author-card-user-stats">12.3万粉丝<span></span>50.0万获赞</div>
    `;
    const out = await readAuthorCardFollowerCount(localEvaluator);
    expect(out.found).toBe(true);
    expect(out.followerCount).toBe(123_000);
    expect(out.displayName).toBe("数据与科学");
  });

  it("falls back to the textContent up to 获赞 when the inner span separator is missing", async () => {
    // A shape without the empty <span></span> separator — make sure we
    // don't return -1 just because the splitter heuristic couldn't fire.
    document.body.innerHTML = `
      <div class="author-card-user-stats">7.2万粉丝 99.0万获赞</div>
    `;
    const out = await readAuthorCardFollowerCount(localEvaluator);
    expect(out.found).toBe(true);
    expect(out.followerCount).toBe(72_000);
  });

  it("returns followerCount = -1 when stats element is present but unparseable", async () => {
    document.body.innerHTML = `<div class="author-card-user-stats">??<span></span>--</div>`;
    const out = await readAuthorCardFollowerCount(localEvaluator);
    expect(out.found).toBe(true);
    expect(out.followerCount).toBe(-1);
  });

  it("prefers the visible author card when multiple stats nodes exist", async () => {
    document.body.innerHTML = `
      <div style="display:none" class="author-card-user-stats">1.0万粉丝<span></span>1万获赞</div>
      <a href="//www.douyin.com/user/MS4wVISIBLE">
        <div class="author-card-user-name">可见作者</div>
        <div class="author-card-user-stats">30.6万粉丝<span></span>170.7万获赞</div>
      </a>
    `;
    const out = await readAuthorCardFollowerCount(localEvaluator);
    expect(out.found).toBe(true);
    expect(out.followerCount).toBe(306_000);
    expect(out.authorHandle).toBe("MS4wVISIBLE");
  });

  it("parses follower count from a full author-card anchor root", async () => {
    document.body.innerHTML = `
      <div class="xf60TslU GbvUrcio HcYeDOmu">
        <div class="MbEZUJWM">
          <div class="ragRMOGr">
            <div class="c95YgYYQ">
              <a href="//www.douyin.com/user/MS4wLjABAAAAw1ZnR_5M0Jz-dlqoS4JdxwRemFo3c1aPAV7buvqB8LZwWPyY72OFclKUxHCs1ofh">
                <div class="xdac8hLY author-card-user-name">
                  <span class="zO1MnLKd">@</span>
                  <span><span><span><span><span>小猫说</span></span></span></span></span>
                </div>
                <div class="DRZNHpDW author-card-user-stats">30.6万粉丝<span></span>170.7万获赞</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
    const out = await readAuthorCardFollowerCount(localEvaluator);
    expect(out.found).toBe(true);
    expect(out.followerCount).toBe(306_000);
    expect(out.authorHandle).toBe(
      "MS4wLjABAAAAw1ZnR_5M0Jz-dlqoS4JdxwRemFo3c1aPAV7buvqB8LZwWPyY72OFclKUxHCs1ofh",
    );
    expect(out.displayName).toContain("小猫说");
  });

  it("parses the current Douyin author card DOM with 万粉丝 and 获赞 text", async () => {
    document.body.innerHTML = `
      <div class="lcobWFIH TwRYis2U dTifPXDI">
        <div class="NgLlChZi">
          <div class="yaaM86ge">
            <div class="Kx0WAkQX">
              <a href="//www.douyin.com/user/MS4wLjABAAAAjb1juHnK9tygA0nuoGgSEMW7ZuJzXNnTMx9XwaQh19k" class="uz1VJwFY YfkLD1JX" target="_blank" rel="noopener noreferrer">
                <div class="wa8Zu2U5 author-card-user-name">
                  <span class="Czcn9JPI">@</span>
                  <span><span class="arnSiSbK w06vqa5G"><span><span><span><span>胡说老王</span></span></span></span></span></span>
                </div>
                <div class="wRhsTKHs author-card-user-stats">711.7万粉丝<span></span>5131.4万获赞</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
    const out = await readAuthorCardFollowerCount(localEvaluator);
    expect(out.found).toBe(true);
    expect(out.followerCount).toBe(7_117_000);
    expect(out.followerRaw).toBe("711.7万");
    expect(out.displayName).toBe("胡说老王");
    expect(out.authorHandle).toBe(
      "MS4wLjABAAAAjb1juHnK9tygA0nuoGgSEMW7ZuJzXNnTMx9XwaQh19k",
    );
  });

});
