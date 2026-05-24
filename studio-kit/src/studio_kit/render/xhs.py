"""小红书图文渲染器：HTML 模板注入 + Patchright 截图 → 8 张 PNG。

与 slide_renderer.py 的关键差异：
  - 输出 PNG 而非 mp4（无录屏、无 ffmpeg、无动画时长概念）
  - 画布 1242×1656（3:4）而非 1080×1920（9:16）
  - 5 张 point 共用 1 个模板（card-point.html.tmpl）
  - point_quote 为空时整块 quote-card 必须被去掉，不允许空框
"""
from __future__ import annotations

import asyncio
from pathlib import Path

from studio_kit.core.contracts import XhsCard, XhsDoc
from studio_kit.core.logging import get_logger

logger = get_logger(__name__)

# templates 目录：studio-kit/.claude/skills/blogger-breakdown-xhs/templates/
_TEMPLATE_DIR = (
    Path(__file__).resolve().parents[3]
    / ".claude"
    / "skills"
    / "blogger-breakdown-xhs"
    / "templates"
)

XHS_CANVAS_WIDTH = 1242
XHS_CANVAS_HEIGHT = 1656


def _get_template_dir() -> Path:
    """模板目录，开发期可通过 STUDIO_KIT_XHS_TEMPLATE_DIR 覆盖。"""
    import os
    override = os.environ.get("STUDIO_KIT_XHS_TEMPLATE_DIR")
    if override:
        return Path(override)
    return _TEMPLATE_DIR


def _load_template(card_type: str) -> str:
    """加载 card-<type>.html.tmpl。"""
    tmpl_path = _get_template_dir() / f"card-{card_type}.html.tmpl"
    if not tmpl_path.exists():
        raise FileNotFoundError(f"找不到模板文件：{tmpl_path}")
    return tmpl_path.read_text(encoding="utf-8")


def _build_quote_block(card: XhsCard) -> str:
    """渲染 point 卡片的引用块；quote 为空时返回空串以彻底隐藏。

    这样设计的原因：避免模板里出现空框（{{point_quote}} 占位符即使为空字符串，
    外层 <div class="quote-card"> 也会保留边框/padding，视觉上是个空洞）。
    渲染器直接用 Python 控制这一整段的存在性。
    """
    quote = card.point_quote.strip()
    if not quote:
        return ""
    source = card.point_quote_source.strip()
    source_html = (
        f'<div class="quote-source">—— {source}</div>' if source else ""
    )
    return (
        '<div class="quote-card">'
        f'<div class="quote-text">{quote}</div>'
        f'{source_html}'
        '</div>'
    )


def _replacements_for(card: XhsCard) -> dict[str, str]:
    """收集模板占位符 → 值的映射。空字段保持空字符串。"""
    return {
        "{{page_label}}": card.page_label,
        # cover
        "{{cover_kicker}}": card.cover_kicker,
        "{{cover_title_line_1}}": card.cover_title_line_1,
        "{{cover_title_line_2}}": card.cover_title_line_2,
        "{{cover_title_line_3}}": card.cover_title_line_3,
        "{{blogger_name}}": card.blogger_name,
        "{{blogger_followers}}": card.blogger_followers,
        "{{cover_badge}}": card.cover_badge,
        # hook
        "{{hook_kicker}}": card.hook_kicker,
        "{{hook_big_line_1}}": card.hook_big_line_1,
        "{{hook_big_line_2}}": card.hook_big_line_2,
        "{{hook_big_line_3}}": card.hook_big_line_3,
        "{{hook_sub}}": card.hook_sub,
        # point
        "{{point_no}}": card.point_no,
        "{{point_kicker}}": card.point_kicker,
        "{{point_title}}": card.point_title,
        "{{point_insight}}": card.point_insight,
        "{{point_quote_block}}": _build_quote_block(card),
        # cta
        "{{cta_kicker}}": card.cta_kicker,
        "{{cta_big_line_1}}": card.cta_big_line_1,
        "{{cta_big_line_2}}": card.cta_big_line_2,
        "{{cta_sub}}": card.cta_sub,
        "{{cta_brand}}": card.cta_brand,
    }


def generate_card_html(card: XhsCard, out_html: Path) -> None:
    """根据 XhsCard 渲染 HTML 并写到 out_html。"""
    template = _load_template(card.card_type)
    html = template
    for placeholder, value in _replacements_for(card).items():
        html = html.replace(placeholder, value)
    out_html.parent.mkdir(parents=True, exist_ok=True)
    out_html.write_text(html, encoding="utf-8")
    logger.debug("xhs 卡片 HTML 已写出：%s", out_html)


async def _screenshot_card(html_path: Path, out_png: Path) -> None:
    """用 Patchright headless Chromium 截 1242×1656 PNG。"""
    from patchright.async_api import async_playwright

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(
            viewport={"width": XHS_CANVAS_WIDTH, "height": XHS_CANVAS_HEIGHT},
            device_scale_factor=1.0,
        )
        page = await ctx.new_page()

        # 把页面默认背景设成极光黑，避免字体加载期间露白
        client = await ctx.new_cdp_session(page)
        await client.send(
            "Emulation.setDefaultBackgroundColorOverride",
            {"color": {"r": 5, "g": 5, "b": 7, "a": 1.0}},
        )

        file_url = html_path.as_uri()
        await page.goto(file_url, wait_until="load", timeout=15000)

        # 等字体加载齐再截图——否则首张可能用 fallback 字体出图
        await page.evaluate("document.fonts.ready")
        # 额外缓冲 200ms 等渐变/noise 等异步绘制完
        await page.wait_for_timeout(200)

        out_png.parent.mkdir(parents=True, exist_ok=True)
        await page.screenshot(
            path=str(out_png),
            clip={
                "x": 0,
                "y": 0,
                "width": XHS_CANVAS_WIDTH,
                "height": XHS_CANVAS_HEIGHT,
            },
            type="png",
            omit_background=False,
        )

        await ctx.close()
        await browser.close()

    logger.info("xhs 卡片 PNG 已生成：%s", out_png)


def _card_index_str(index: int) -> str:
    return f"{index:02d}"


async def _render_all_cards_async(
    script: XhsDoc,
    out_dir: Path,
    *,
    force: bool = False,
) -> list[Path]:
    """异步渲染所有 8 张卡片（单浏览器实例顺序复用，避免反复启停）。

    顺序复用而非并发：8 张图渲染总耗时 ≈ 8 × 1.5s ≈ 12s，并发反而引入资源争用和
    截图顺序错乱风险。如果以后要并发，再单独加一个 ProcessPool 实现。
    """
    from patchright.async_api import async_playwright

    results: list[Path] = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(
            viewport={"width": XHS_CANVAS_WIDTH, "height": XHS_CANVAS_HEIGHT},
            device_scale_factor=1.0,
        )

        client = await ctx.new_cdp_session(await ctx.new_page())
        await client.send(
            "Emulation.setDefaultBackgroundColorOverride",
            {"color": {"r": 5, "g": 5, "b": 7, "a": 1.0}},
        )

        for card in script.cards:
            idx_str = _card_index_str(card.index)
            out_html = out_dir / f"{idx_str}.html"
            out_png = out_dir / f"{idx_str}.png"

            if out_png.exists() and not force:
                logger.info("卡片 %s.png 已存在，跳过（--force 强制重新生成）", idx_str)
                results.append(out_png)
                continue

            generate_card_html(card, out_html)

            page = await ctx.new_page()
            await page.goto(out_html.as_uri(), wait_until="load", timeout=15000)
            await page.evaluate("document.fonts.ready")
            await page.wait_for_timeout(200)

            await page.screenshot(
                path=str(out_png),
                clip={
                    "x": 0,
                    "y": 0,
                    "width": XHS_CANVAS_WIDTH,
                    "height": XHS_CANVAS_HEIGHT,
                },
                type="png",
            )
            await page.close()

            logger.info("[%s] %s.png ← %s", card.card_type, idx_str, out_html.name)
            results.append(out_png)

        await ctx.close()
        await browser.close()

    return results


def render_all_cards(
    script: XhsDoc,
    out_dir: Path,
    *,
    force: bool = False,
) -> list[Path]:
    """同步入口：渲染 8 张 PNG，返回路径列表（顺序与 script.cards 一致）。"""
    return asyncio.run(_render_all_cards_async(script, out_dir, force=force))
