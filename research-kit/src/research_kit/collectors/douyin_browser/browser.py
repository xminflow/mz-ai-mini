"""Patchright 浏览器会话封装。

Patchright 是 Playwright 的反检测分支，比原版更不容易被抖音/小红书反爬。
本模块只暴露同步上下文管理器，便于在采集 pipeline 中按博主开/关浏览器。

依赖：`patchright>=1.40`（包含 Chromium 二进制需 `patchright install chromium`）。
"""

from __future__ import annotations

from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator

from research_kit.core.logging import get_logger

_log = get_logger(__name__)


@contextmanager
def browser_session(
    *,
    storage_state: Path | None = None,
    headless: bool = False,
    proxy: str | None = None,
    user_data_dir: Path | None = None,
) -> Iterator["BrowserHandle"]:
    """启动 Patchright Chromium 浏览器并 yield 一个会话句柄。退出时自动关闭。

    - storage_state: 已导出的 Playwright storage_state.json（含登录态 cookies）。
    - headless: 默认 False。抖音对 headless 检测严格，建议保留可见窗口。
    - proxy: e.g. "http://127.0.0.1:7078"
    - user_data_dir: 若提供，使用持久化用户目录（自动保留登录态）。
    """
    # 延迟 import，让 patchright 未安装时 core 模块依然可导。
    from patchright.sync_api import sync_playwright

    _log.info(
        "启动浏览器: headless=%s proxy=%s user_data_dir=%s storage_state=%s",
        headless,
        proxy or "-",
        user_data_dir or "-",
        storage_state or "-",
    )

    with sync_playwright() as p:
        # 国内环境的 Chromium 必须显式直连 + 禁用 DNS-over-HTTPS：
        # - 默认会继承 Windows 系统代理 → ERR_CONNECTION_CLOSED（代理服务异常时）
        # - 即使直连，Chromium 默认走 DoH（Cloudflare / Google），国内被墙
        #   → ERR_NAME_NOT_RESOLVED
        # 解决：args 显式声明 direct:// + 禁用 DnsOverHttps 走系统 DNS。
        chromium_args: list[str] = []
        launch_kwargs: dict[str, Any] = {
            "headless": headless,
            "args": chromium_args,
        }
        if proxy:
            launch_kwargs["proxy"] = {"server": proxy}
        else:
            chromium_args.append("--proxy-server=direct://")
            chromium_args.append("--proxy-bypass-list=*")
            chromium_args.append("--disable-features=DnsOverHttps")

        _log.info("chromium_args=%s launch_kwargs_keys=%s", chromium_args, sorted(launch_kwargs))

        if user_data_dir is not None:
            user_data_dir.mkdir(parents=True, exist_ok=True)
            context = p.chromium.launch_persistent_context(
                user_data_dir=str(user_data_dir),
                **launch_kwargs,
            )
            browser = None
        else:
            browser = p.chromium.launch(**launch_kwargs)
            context_kwargs: dict[str, Any] = {
                "viewport": {"width": 1440, "height": 900},
                "locale": "zh-CN",
                "timezone_id": "Asia/Shanghai",
                "user_agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/131.0.0.0 Safari/537.36"
                ),
            }
            if storage_state is not None and storage_state.exists():
                context_kwargs["storage_state"] = str(storage_state)
            context = browser.new_context(**context_kwargs)

        page = context.pages[0] if context.pages else context.new_page()
        _log.info("context pages count=%d", len(context.pages))

        handle = BrowserHandle(context=context, page=page)
        try:
            yield handle
        finally:
            try:
                context.close()
            except Exception as exc:  # pragma: no cover
                _log.warning("关闭 context 失败: %s", exc)
            if browser is not None:
                try:
                    browser.close()
                except Exception as exc:  # pragma: no cover
                    _log.warning("关闭 browser 失败: %s", exc)


class BrowserHandle:
    """对外暴露的浏览器会话句柄。屏蔽 patchright 类型，便于上层调用。"""

    def __init__(self, context: Any, page: Any) -> None:
        self.context = context
        self.page = page

    def navigate(self, url: str, *, wait_ms: int = 1500) -> None:
        """导航到 URL 并固定等一会儿。

        wait_until 用 "commit" 而非 "domcontentloaded"——抖音页面里有不少 monitor
        / tracking 子资源（mon.zijieapi.com 等），其中任一个 DNS 解析失败都会让
        domcontentloaded 整个失败报 ERR_NAME_NOT_RESOLVED。commit 只等首个响应，
        随后通过 wait_for_timeout 让主 DOM 自然加载。
        """
        self.page.goto(url, wait_until="commit", timeout=30000)
        self.page.wait_for_timeout(wait_ms)

    def evaluate(self, js: str) -> Any:
        """在页面上下文执行一段 JS 表达式，返回 JSON 序列化结果。"""
        return self.page.evaluate(js)

    def press_key(self, key: str) -> None:
        self.page.keyboard.press(key)

    def wait(self, ms: int) -> None:
        self.page.wait_for_timeout(ms)

    def bring_to_front(self) -> None:
        """让浏览器窗口获得焦点。抖音的 popover 通过 document.hasFocus() 判定，
        如果窗口在后台，hover 即使触发了，popover 也不会 mount。"""
        try:
            self.page.bring_to_front()
        except Exception:
            pass

    def hover(self, selector: str, *, timeout_ms: int = 2000) -> None:
        """对一个 CSS selector 触发真实的 isTrusted hover 事件。"""
        self.page.hover(selector, timeout=timeout_ms)

    def mouse_move(self, x: float, y: float, *, steps: int = 8) -> None:
        """多步骤鼠标移动。单步 jump 会被 popover 的 mouseenter debounce 丢掉，
        必须分多步走。"""
        self.page.mouse.move(x, y, steps=steps)

    def screenshot_video_frames(
        self,
        video_url: str,
        target_dir: Path,
        *,
        frame_count: int = 4,
        wait_between_ms: int = 1500,
        initial_wait_ms: int = 4000,
    ) -> tuple[list[Path], str | None]:
        """打开视频页，截取播放器画面作为关键帧。

        相比拦截 mp4 流（抖音用 DASH 音视频分离 + fMP4，拼接复杂且需 demuxer），
        直接截屏更稳：浏览器自动播放视频，我们每隔 wait_between_ms 截一张。

        返回 `(帧路径列表, 字幕文本 or None)`。字幕从视频页面 DOM 抓取（如果有）。
        """
        target_dir.mkdir(parents=True, exist_ok=True)
        try:
            self.page.goto(video_url, wait_until="commit", timeout=15000)
        except Exception:
            pass
        # 等视频元素出现并开始播放
        self.page.wait_for_timeout(initial_wait_ms)

        # 尝试点击播放按钮（抖音偶尔会暂停）
        try:
            self.page.evaluate(
                """
                () => {
                  const v = document.querySelector('video');
                  if (v) { try { v.play(); v.muted = true; } catch(e) {} }
                }
                """
            )
        except Exception:
            pass
        self.page.wait_for_timeout(1500)

        frames: list[Path] = []
        for i in range(1, frame_count + 1):
            target = target_dir / f"{i}.jpg"
            try:
                # 优先截 video 元素本身（更精准、不带 UI）
                video_locator = self.page.locator("video")
                if video_locator.count() > 0:
                    video_locator.first.screenshot(path=str(target), type="jpeg", quality=85)
                else:
                    self.page.screenshot(path=str(target), type="jpeg", quality=85, full_page=False)
                if target.exists() and target.stat().st_size > 0:
                    frames.append(target)
            except Exception:
                pass
            if i < frame_count:
                self.page.wait_for_timeout(wait_between_ms)

        # 抓字幕（抖音有些视频在 DOM 里有 .caption / .subtitle 类）
        caption: str | None = None
        try:
            caption_raw = self.page.evaluate(
                """
                () => {
                  const candidates = [
                    '[data-e2e="video-desc"]',
                    '.video-desc',
                    '.caption',
                    '.subtitle-list',
                  ];
                  for (const sel of candidates) {
                    const el = document.querySelector(sel);
                    if (el) {
                      const t = (el.textContent || '').trim();
                      if (t.length > 5) return t;
                    }
                  }
                  return null;
                }
                """
            )
            if isinstance(caption_raw, str) and len(caption_raw) > 5:
                caption = caption_raw
        except Exception:
            pass

        return frames, caption

    def intercept_video(self, video_url: str, target: Path, *, timeout_ms: int = 30000) -> Path:
        """打开视频页，拦截 mp4 响应并拼接为完整文件。

        抖音 PC web 用 fragmented MP4（fMP4）+ MSE 流式下发：
        - 先一个 init segment：含 `ftyp` + `moov` box（通常 几 KB - 几十 KB）
        - 然后多个 fragments：`moof` + `mdat` boxes（每段几十 KB - 几百 KB）
        全部按序拼接才能得到合法 mp4 文件。

        策略：
        1. 监听所有 mp4 响应，按到达顺序累积 body
        2. 用首部 4 字节后是否含 'ftyp' 判别 init segment
        3. 持续到无新响应 stalled_ms ms 后认为下载完成
        4. 拼接 init + fragments 写盘

        浏览器自带登录态 + 签名，比 yt-dlp 稳定。
        """
        target.parent.mkdir(parents=True, exist_ok=True)
        init_segment: list[bytes] = []
        fragments: list[bytes] = []
        last_arrival = [0]  # ms since start

        def _is_video_response(resp: Any) -> bool:
            url = resp.url or ""
            ct = (resp.headers.get("content-type") or "").lower()
            return (
                "video/mp4" in ct
                or "video/" in ct
                or ".mp4" in url
                or "/play_video" in url
                or "/aweme/v1/play" in url
            )

        def on_response(resp: Any) -> None:
            if not _is_video_response(resp):
                return
            try:
                body = resp.body()
            except Exception:
                return
            if not body or len(body) < 200:
                return
            # 首部含 'ftyp' 的视为 init segment
            head_check = body[:32]
            if b"ftyp" in head_check:
                init_segment.append(body)
            elif b"moof" in head_check or b"mdat" in head_check or b"styp" in head_check:
                fragments.append(body)
            else:
                # 其它视频响应：可能是完整 mp4 或未知格式，当 fragment 处理
                fragments.append(body)
            last_arrival[0] = self._ms_elapsed_or(0)

        try:
            start_ms = self.page.evaluate("() => Date.now()")
        except Exception:
            start_ms = 0
        self._start_ms = start_ms

        self.page.on("response", on_response)
        try:
            try:
                self.page.goto(video_url, wait_until="commit", timeout=15000)
            except Exception:
                pass
            stalled_ms = 3500  # 无新片段 3.5s 后认为完成
            min_collect_ms = 6000  # 至少采集 6s 避免太早退出
            step = 500
            waited = 0
            while waited < timeout_ms:
                self.page.wait_for_timeout(step)
                waited += step
                if waited < min_collect_ms:
                    continue
                if (init_segment or fragments) and (waited - last_arrival[0] >= stalled_ms):
                    break
        finally:
            try:
                self.page.remove_listener("response", on_response)
            except Exception:
                pass

        if not init_segment and not fragments:
            raise RuntimeError(f"未拦截到任何视频响应：{video_url}")

        # 拼接：init 在前，fragments 按到达顺序拼
        chunks = init_segment + fragments
        total = sum(len(c) for c in chunks)
        target.write_bytes(b"".join(chunks))
        return target

    def _ms_elapsed_or(self, default: int) -> int:
        """从 start_ms 算到现在的毫秒数。"""
        try:
            now = self.page.evaluate("() => Date.now()")
            return int(now - self._start_ms)
        except Exception:
            return default

    def export_cookies_netscape(self, target: Path) -> Path:
        """把当前 context 的 cookies 以 Netscape 格式写盘，供 yt-dlp / curl 复用。

        Netscape cookies.txt 格式（每行一条，制表符分隔）：
            domain  include_subdomains  path  secure  expiry  name  value
        """
        cookies = self.context.cookies()
        target.parent.mkdir(parents=True, exist_ok=True)
        lines = [
            "# Netscape HTTP Cookie File",
            "# Exported by research-kit douyin_browser",
            "",
        ]
        for c in cookies:
            domain = c.get("domain", "")
            include_sub = "TRUE" if domain.startswith(".") else "FALSE"
            path = c.get("path", "/")
            secure = "TRUE" if c.get("secure", False) else "FALSE"
            expiry = int(c.get("expires", 0)) if c.get("expires", -1) and c.get("expires", -1) > 0 else 0
            name = c.get("name", "")
            value = c.get("value", "")
            if not domain or not name:
                continue
            lines.append("\t".join([domain, include_sub, path, secure, str(expiry), name, value]))
        target.write_text("\n".join(lines) + "\n", encoding="utf-8")
        return target


__all__ = ["BrowserHandle", "browser_session"]
