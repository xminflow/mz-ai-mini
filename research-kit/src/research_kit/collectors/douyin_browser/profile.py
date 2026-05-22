"""博主主页 DOM 抓取与作品列表枚举。

DOM 选择器照搬自 ua-agent/frontend/src/utility/keyword-crawl/domain/douyinProfileDom.ts。
抖音 DOM 改版时需要在此处同步更新。
"""

from __future__ import annotations

from typing import TypedDict

from research_kit.collectors.douyin_browser.browser import BrowserHandle
from research_kit.collectors.douyin_browser.stats import parse_follower_stat, parse_stat
from research_kit.collectors.douyin_browser.urls import canonicalize_video_url
from research_kit.core.logging import get_logger

_log = get_logger(__name__)


class ProfileFields(TypedDict):
    display_name: str | None
    avatar_url: str | None
    douyin_id: str | None
    signature: str | None
    sec_uid: str | None
    follow_count: int | None
    fans_count: int | None
    liked_count: int | None


class ExtractedWork(TypedDict):
    url: str
    title: str | None
    index: int


_FIND_WORKS_GRID_FN = r"""
function __findWorksGrid() {
  for (const sel of ['[data-e2e="user-post-list"]', '[data-e2e="user-tab-content"]']) {
    const el = document.querySelector(sel);
    if (el !== null) return el;
  }
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
  return bestCount >= 4 ? best : null;
}
"""


_READ_PROFILE_JS = r"""
(() => {
  function txt(el) {
    if (el === null) return null;
    const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
    return t.length === 0 ? null : t;
  }

  // Avatar: 取 page 中最大渲染面积的候选 img
  let avatar_url = null;
  {
    const candidateSet = new Set();
    for (const sel of ['[data-e2e="live-avatar"] img', '[data-e2e="user-avatar"] img', 'img[alt$="头像"]']) {
      for (const el of document.querySelectorAll(sel)) candidateSet.add(el);
    }
    let bestArea = 0;
    let bestSrc = null;
    for (const img of candidateSet) {
      const r = img.getBoundingClientRect();
      const area = r.width * r.height;
      if (area <= bestArea) continue;
      const src = img.currentSrc || img.src || img.getAttribute('src');
      if (typeof src !== 'string' || src.length === 0) continue;
      bestArea = area;
      bestSrc = src;
    }
    avatar_url = bestSrc;
  }

  // Display name
  let display_name = null;
  for (const sel of ['[data-e2e="user-name"]', '[data-e2e="user-info"] h1', 'h1[class*="nickname"]', 'h1[class*="name"]', 'div[class*="nickname"]', 'header h1', 'h1']) {
    const t = txt(document.querySelector(sel));
    if (t !== null) { display_name = t; break; }
  }

  // 抖音号
  let douyin_id = null;
  {
    const candidates = Array.from(document.querySelectorAll('div, span, p, [class*="account"], [data-e2e*="account"]'));
    for (const el of candidates) {
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (t.length === 0 || t.length > 200) continue;
      const m = t.match(/(?:抖音号|Douyin\s*ID|ID)\s*[:：]\s*([\w.-]+)/i);
      if (m !== null && m[1]) { douyin_id = m[1]; break; }
    }
  }

  // Signature: 先看 marker 邻近 <p>（expand_bio_if_truncated 已经标记并 hover 展开了），
  // 没找到再走 fallback selector 列表。
  let signature = null;
  {
    const marker = document.querySelector('[data-bio-more-marker="1"]');
    if (marker !== null) {
      let ancestor = marker.parentElement;
      for (let i = 0; i < 4 && ancestor !== null; i++) {
        for (const p of Array.from(ancestor.querySelectorAll('p'))) {
          const text = (p.textContent || '').replace(/\s+/g, ' ').trim();
          if (text.length < 2 || text.length > 2000) continue;
          if (text === '更多' || text === '展开' || text === '收起') continue;
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
  // Fallback selectors
  if (signature === null) {
    const selectors = ['[data-e2e="user-info-desc"]', '[data-e2e="user-bio"]', '[data-e2e="user-info-bio"]', '[data-e2e="user-introduction"]', '[data-e2e="profile-introduction"]', '[class*="signature"]', '[class*="user-desc"]', '[class*="bio"]', '[class*="introduction"]', 'p[class*="desc"]'];
    for (const sel of selectors) {
      for (const el of document.querySelectorAll(sel)) {
        const t = txt(el);
        if (t === null) continue;
        if (t === '更多' || t === '展开' || t === '收起') continue;
        if (t.length < 2 || t.length > 2000) continue;
        signature = t; break;
      }
      if (signature !== null) break;
    }
  }

  // sec_uid from path
  let sec_uid = null;
  {
    const m = window.location.pathname.match(/^\/user\/([^/?#]+)/);
    if (m !== null && m[1]) sec_uid = m[1];
  }

  // Stats: 先 data-e2e 精确选择器，失败再走 label-fallback
  // —— 直接全 DOM 配对会跨容器串号（"关注 44 粉丝 427.3万" 被读成"粉丝=44"），
  // 所以 fallback 走"找到标签后，逐层向上找只包含这一个标签的最小容器"，
  // 然后在那个容器内读数字。逻辑 1:1 移植自 ua-agent douyinProfileDom.ts。
  const numRe = /^[\d.,]+\s*(?:万|亿|w|k|千)?$/i;
  const statLabels = new Set(['关注', '粉丝', '获赞']);

  function leafTexts(root) {
    const out = [];
    for (const el of root.querySelectorAll('*')) {
      if (el.children.length !== 0) continue;
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (t.length > 0) out.push(t);
    }
    return out;
  }

  function readStatNumber(root) {
    if (!root) return null;
    for (const el of root.children) {
      const t = txt(el);
      if (t !== null && numRe.test(t)) return t;
    }
    for (const t of leafTexts(root)) {
      if (numRe.test(t)) return t;
    }
    return null;
  }

  let follow_text = readStatNumber(document.querySelector('[data-e2e="user-info-follow"]'));
  let fans_text = readStatNumber(document.querySelector('[data-e2e="user-info-fans"]'));
  let liked_text = readStatNumber(document.querySelector('[data-e2e="user-info-like"]'));

  if (follow_text === null || fans_text === null || liked_text === null) {
    const labelEls = Array.from(document.querySelectorAll('body *')).filter((el) => {
      const t = txt(el);
      return t !== null && statLabels.has(t);
    });
    function assignStat(label, value) {
      if (value === null) return;
      if (label === '关注' && follow_text === null) follow_text = value;
      else if (label === '粉丝' && fans_text === null) fans_text = value;
      else if (label === '获赞' && liked_text === null) liked_text = value;
    }
    for (const labelEl of labelEls) {
      const label = txt(labelEl);
      if (label === null) continue;
      let scope = labelEl.parentElement;
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

  return {
    display_name, avatar_url, douyin_id, signature, sec_uid,
    follow_text, fans_text, liked_text,
  };
})()
"""


_FIND_AND_TAG_MORE_JS = r"""
(() => {
  // 找"更多 / 展开 / More / 查看更多"按钮，给它打 data-bio-more-marker="1"
  // 并 scrollIntoView。返回 {found, rect, matchedText}。
  const exact = ['更多', '展开', 'More', '查看更多'];
  const endsWith = ['更多', '展开'];
  const candidates = Array.from(document.querySelectorAll('span, a, button, div, p'));
  for (const el of candidates) {
    const t = (el.textContent || '').replace(/\s+/g, '').trim();
    if (t.length === 0 || t.length > 10) continue;
    const matches = exact.includes(t) || endsWith.some(s => t.endsWith(s));
    if (!matches) continue;
    if (el.children.length > 2) continue;  // 跳过 wrapper，只要叶子级
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    el.setAttribute('data-bio-more-marker', '1');
    el.scrollIntoView({ block: 'center' });
    const r2 = el.getBoundingClientRect();
    return {
      found: true,
      rect: { x: r2.left, y: r2.top, w: r2.width, h: r2.height },
      matchedText: t,
    };
  }
  return { found: false, rect: null, matchedText: null };
})()
"""


def expand_bio_if_truncated(handle: BrowserHandle) -> dict:
    """如果主页简介被截断（出现"更多 / 展开"按钮），hover 它让 popover 展开。

    三件事做对：
    1. **Tag-then-hover**：先 evaluate 给按钮加 `data-bio-more-marker="1"` 做稳定 selector
    2. **bringToFront**：抖音 popover 通过 `document.hasFocus()` 判定，必须让窗口前置
    3. **mouseMove with steps=8**：单步 jump 会被 mouseenter 的 debounce 丢掉

    返回 `{found, hovered, matched_text}` 给调用方做日志诊断。
    """
    tag_result = handle.evaluate(_FIND_AND_TAG_MORE_JS)
    if not isinstance(tag_result, dict) or not tag_result.get("found"):
        return {"found": False, "hovered": False, "matched_text": None}

    matched_text = tag_result.get("matchedText")
    rect = tag_result.get("rect")
    _log.info("找到 bio 展开按钮 '%s'，准备 hover 展开", matched_text)

    try:
        handle.bring_to_front()
        handle.hover('[data-bio-more-marker="1"]', timeout_ms=2000)
        if isinstance(rect, dict):
            cx = float(rect.get("x", 0)) + float(rect.get("w", 0)) / 2
            cy = float(rect.get("y", 0)) + float(rect.get("h", 0)) / 2
            handle.mouse_move(cx, cy, steps=8)
        # popover mount + 动画 settle，1500ms 是 ua-agent 同款经验值
        handle.wait(1500)
        _log.info("bio 展开 hover 成功")
        return {"found": True, "hovered": True, "matched_text": matched_text}
    except Exception as exc:
        _log.warning("bio hover 失败（不影响主流程，会走 fallback）: %s", exc)
        return {"found": True, "hovered": False, "matched_text": matched_text}


_WAIT_FOR_STATS_JS = r"""
(() => {
  // 抖音主页 stats 数字位异步填充：先渲染 data-e2e 容器但子节点为空，
  // 几秒后 SSR/CSR 才把"41.3万"塞进去。判断条件：fans 或 like 容器里
  // 出现匹配 ^[\d.,]+\s*(?:万|亿|w|k|千)?$ 的数字 leaf。
  const numRe = /^[\d.,]+\s*(?:万|亿|w|k|千)?$/i;
  function hasNumber(root) {
    if (!root) return false;
    for (const el of root.querySelectorAll('*')) {
      if (el.children.length !== 0) continue;
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (numRe.test(t)) return true;
    }
    return false;
  }
  const fans = document.querySelector('[data-e2e="user-info-fans"]');
  const like = document.querySelector('[data-e2e="user-info-like"]');
  return hasNumber(fans) || hasNumber(like);
})()
"""


def wait_for_stats(handle: BrowserHandle, *, timeout_ms: int = 12000, poll_ms: int = 500) -> bool:
    """轮询等待主页 stats 数字异步出现。返回 True 表示已就绪，False 表示超时。

    抖音 PC 主页骨架先渲染 `data-e2e="user-info-fans"` 等容器，再过几秒才异步把
    数字塞进子 div。如果 read_profile 紧跟在 navigate 后跑，会读到空字符串。
    """
    waited = 0
    while waited < timeout_ms:
        try:
            ok = handle.evaluate(_WAIT_FOR_STATS_JS)
        except Exception:
            ok = False
        if ok:
            _log.info("stats 数字位已就绪（等了 %dms）", waited)
            return True
        handle.wait(poll_ms)
        waited += poll_ms
    _log.warning("stats 数字位等待超时（%dms），fans/likes 可能仍为 null", timeout_ms)
    return False


def download_avatar(
    avatar_url: str,
    target_path: Path,
    *,
    proxy: str | None = None,
    referer: str = "https://www.douyin.com/",
    timeout_s: float = 15.0,
) -> Path:
    """把头像图片下载到 target_path。

    抖音头像 CDN `p3-pc.douyinpic.com` 当前不验 Referer，但仍按浏览器请求头送出，
    既无害也防止字节后续加签时立刻断链。失败时抛 RuntimeError，由调用方决定是否
    阻断主流程。
    """
    import httpx  # 延迟 import，避免 core 导入时拉重依赖

    target_path.parent.mkdir(parents=True, exist_ok=True)
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/131.0.0.0 Safari/537.36"
        ),
        "Referer": referer,
        "Accept": "image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8",
    }
    _log.info("下载头像: %s -> %s", avatar_url[:80] + ("..." if len(avatar_url) > 80 else ""), target_path)
    client_kwargs: dict = {"timeout": timeout_s, "follow_redirects": True}
    if proxy:
        client_kwargs["proxy"] = proxy
    with httpx.Client(**client_kwargs) as client:
        resp = client.get(avatar_url, headers=headers)
        if resp.status_code != 200:
            raise RuntimeError(
                f"avatar 下载失败 status={resp.status_code} url={avatar_url[:120]}"
            )
        content_type = (resp.headers.get("content-type") or "").lower()
        if "image" not in content_type:
            raise RuntimeError(
                f"avatar 响应非图片 content-type={content_type} url={avatar_url[:120]}"
            )
        body = resp.content
        if len(body) < 256:
            raise RuntimeError(f"avatar 响应过小 size={len(body)} bytes")
        target_path.write_bytes(body)
    _log.info("头像下载完成: %d bytes -> %s", len(body), target_path)
    return target_path


def read_profile(handle: BrowserHandle) -> ProfileFields:
    """读取当前页面的博主资料。需先 navigate 到主页。"""
    raw: dict = handle.evaluate(_READ_PROFILE_JS)  # type: ignore[assignment]

    def _to_int(text: str | None, *, is_follower: bool) -> int | None:
        if not text:
            return None
        value = parse_follower_stat(text) if is_follower else parse_stat(text)
        return None if value < 0 else value

    result: ProfileFields = {
        "display_name": raw.get("display_name"),
        "avatar_url": raw.get("avatar_url"),
        "douyin_id": raw.get("douyin_id"),
        "signature": raw.get("signature"),
        "sec_uid": raw.get("sec_uid"),
        "follow_count": _to_int(raw.get("follow_text"), is_follower=False),
        "fans_count": _to_int(raw.get("fans_text"), is_follower=True),
        "liked_count": _to_int(raw.get("liked_text"), is_follower=False),
    }
    _log.debug("profile fields: %s", result)
    return result


_PROBE_FN_BODY = (
    _FIND_WORKS_GRID_FN
    + r"""
const grid = __findWorksGrid();
const cards = grid !== null ? grid.querySelectorAll('a[href*="/video/"]').length : 0;
let reachedEnd = false;
if (grid !== null && cards > 0) {
  const endPhrases = ['暂时没有更多了', '没有更多了', '已经到底了', '已加载全部'];
  const scope = grid.parentElement || grid;
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode()) !== null) {
    const t = (node.textContent || '').replace(/\s+/g, '').trim();
    if (t.length === 0 || t.length > 50) continue;
    for (const p of endPhrases) {
      if (t.indexOf(p) !== -1) { reachedEnd = true; break; }
    }
    if (reachedEnd) break;
  }
}
return { cards, height: document.documentElement.scrollHeight, reachedEnd };
"""
)


_SCROLL_KICK_JS = (
    _FIND_WORKS_GRID_FN
    + r"""
const grid = __findWorksGrid();
if (grid !== null) {
  const cards = grid.querySelectorAll('a[href*="/video/"]');
  if (cards.length > 0) {
    cards[cards.length - 1].scrollIntoView({ block: 'end', behavior: 'instant' });
  }
}
window.scrollBy(0, Math.max(800, window.innerHeight * 0.9));
"""
)


def scroll_works_to_bottom(
    handle: BrowserHandle,
    *,
    hard_cap: int = 500,
    scroll_delay_ms: int = 1200,
    plateau_limit: int = 15,
    on_progress: callable = None,  # type: ignore[assignment]
) -> tuple[int, int, bool]:
    """滚动加载作品列表到底。

    返回 `(total_scrolls, final_card_count, reached_bottom)`。

    与 ua-agent 一致：用 `scrollIntoView` + 按 End 键 + sentinel 检测 + 平台保险。
    """
    probe_js = f"(() => {{ {_PROBE_FN_BODY} }})()"

    initial = handle.evaluate(probe_js)
    assert isinstance(initial, dict)
    last_cards = int(initial.get("cards", 0))
    if initial.get("reachedEnd"):
        return 0, last_cards, True

    scrolls = 0
    plateau = 0
    reached_bottom = False
    while scrolls < hard_cap:
        handle.evaluate(f"(() => {{ {_SCROLL_KICK_JS} }})()")
        try:
            handle.press_key("End")
        except Exception:
            pass
        handle.wait(scroll_delay_ms)
        scrolls += 1

        probed = handle.evaluate(probe_js)
        assert isinstance(probed, dict)
        cards = int(probed.get("cards", 0))
        if on_progress is not None and scrolls % 5 == 0:
            on_progress(scrolls, cards)
        if probed.get("reachedEnd"):
            last_cards = cards
            reached_bottom = True
            break
        if cards <= last_cards:
            plateau += 1
            if plateau >= plateau_limit:
                last_cards = cards
                reached_bottom = True
                break
        else:
            plateau = 0
        last_cards = cards

    return scrolls, last_cards, reached_bottom


_EXTRACT_WORKS_JS = (
    _FIND_WORKS_GRID_FN
    + r"""
const grid = __findWorksGrid();
if (grid === null) return [];
const anchors = Array.from(grid.querySelectorAll('a[href*="/video/"]'));
const out = [];
let idx = 0;
for (const a of anchors) {
  const href = a.href || a.getAttribute('href') || '';
  if (typeof href !== 'string' || href.length === 0) continue;
  let title = null;
  const aria = a.getAttribute('aria-label');
  if (aria && aria.trim().length > 0) title = aria.trim();
  if (title === null) {
    const t = a.getAttribute('title');
    if (t && t.trim().length > 0) title = t.trim();
  }
  if (title === null) {
    const img = a.querySelector('img');
    if (img !== null) {
      const alt = img.getAttribute('alt');
      if (alt && alt.trim().length > 0) title = alt.trim();
    }
  }
  if (title === null) {
    const t = (a.textContent || '').replace(/\s+/g, ' ').trim();
    if (t.length > 0) title = t;
  }
  out.push({ href, title, index: idx });
  idx++;
}
return out;
"""
)


def extract_all_works(handle: BrowserHandle) -> list[ExtractedWork]:
    """抓取作品列表，去重 + 规范化 URL。"""
    raw = handle.evaluate(f"(() => {{ {_EXTRACT_WORKS_JS} }})()")
    assert isinstance(raw, list)

    seen: set[str] = set()
    out: list[ExtractedWork] = []
    for r in raw:
        href = r.get("href") if isinstance(r, dict) else None
        title = r.get("title") if isinstance(r, dict) else None
        if not isinstance(href, str):
            continue
        canon = canonicalize_video_url(href)
        if canon is None or canon in seen:
            continue
        seen.add(canon)
        out.append({"url": canon, "title": title, "index": len(out)})
    return out


__all__ = [
    "ExtractedWork",
    "ProfileFields",
    "extract_all_works",
    "read_profile",
    "scroll_works_to_bottom",
]
