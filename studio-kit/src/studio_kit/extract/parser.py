"""解析博主拆解 HTML 报告，产出 outline.json。

输入：
  - overview.html（由 research-kit douyin-blogger-report-v2 生成的 14 章 HTML 报告）
  - index.json（同目录，含 blogger_id / run_id 等元数据）

输出：
  - OutlineDoc（序列化为 outline.json）
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup, Tag

from studio_kit.core.contracts import (
    BloggerStats,
    ChapterSummary,
    FrameRef,
    OutlineDoc,
    QuoteItem,
)
from studio_kit.core.logging import get_logger

logger = get_logger(__name__)

# 14 章 id 顺序（与 research-kit 报告保持一致）
CHAPTER_IDS: list[str] = [
    "profile", "audience", "positioning", "style", "value",
    "topics", "scripts", "craft", "growth", "evolution",
    "monetization", "transferability", "risk", "takeaway",
]

CHAPTER_TITLES: dict[str, str] = {
    "profile": "博主画像",
    "audience": "观众画像",
    "positioning": "内容定位",
    "style": "作品风格",
    "value": "核心价值主张",
    "topics": "选题策略",
    "scripts": "文案与脚本",
    "craft": "制作品质",
    "growth": "算法适配",
    "evolution": "成长路线",
    "monetization": "变现路径",
    "transferability": "方法论可迁移性",
    "risk": "风险与天花板",
    "takeaway": "可借鉴清单",
}

_MAX_SUMMARY_CHARS = 200
_MAX_BULLETS = 5
_MAX_BULLET_CHARS = 80


def _truncate(text: str, max_chars: int) -> str:
    text = text.strip()
    if len(text) <= max_chars:
        return text
    return text[:max_chars].rstrip() + "…"


def _parse_stats(soup: BeautifulSoup) -> BloggerStats:
    """从 summary section 或首个 section 中提取博主统计数据。"""
    display_name = ""
    followers = ""
    likes = ""
    works_count = 0

    # 尝试 summary section
    summary_sec = soup.find("section", id="summary")
    if not summary_sec:
        # fallback：找首个 h1
        summary_sec = soup

    h1 = summary_sec.find("h1")  # type: ignore[union-attr]
    if h1:
        display_name = h1.get_text(separator=" ", strip=True)

    # dl 里的数据（粉丝/获赞/作品数）
    for dl in summary_sec.find_all("dl"):  # type: ignore[union-attr]
        items = list(zip(dl.find_all("dt"), dl.find_all("dd")))
        for dt, dd in items:
            label = dt.get_text(strip=True).lower()
            value = dd.get_text(strip=True)
            if any(kw in label for kw in ("粉丝", "follower", "fans")):
                followers = value
            elif any(kw in label for kw in ("获赞", "like", "点赞")):
                likes = value
            elif any(kw in label for kw in ("作品", "work", "视频", "video")):
                try:
                    works_count = int(re.sub(r"[^\d]", "", value) or "0")
                except ValueError:
                    works_count = 0

    logger.debug("解析博主统计: name=%s followers=%s likes=%s works=%d",
                 display_name, followers, likes, works_count)
    return BloggerStats(
        display_name=display_name,
        followers=followers,
        likes=likes,
        works_count=works_count,
    )


def _parse_verdict(soup: BeautifulSoup) -> str:
    """从 summary section 的 .font-serif-zh 或首段 p 取一句话答卷。"""
    summary_sec = soup.find("section", id="summary") or soup
    # 优先找带特定 class 的元素
    verdict_el = summary_sec.find(class_=re.compile(r"serif|verdict|answer", re.I))  # type: ignore[union-attr]
    if verdict_el:
        return _truncate(verdict_el.get_text(separator=" ", strip=True), 100)
    # fallback：summary section 首段 p
    p = summary_sec.find("p")  # type: ignore[union-attr]
    if p:
        return _truncate(p.get_text(separator=" ", strip=True), 100)
    return ""


def _parse_chapter(section: Tag, chapter_id: str) -> ChapterSummary:
    """从一个 <section> 节点提取 ChapterSummary。"""
    title = CHAPTER_TITLES.get(chapter_id, chapter_id)

    # h2/h3 覆盖默认标题
    heading = section.find(["h2", "h3"])
    if heading:
        heading_text = heading.get_text(separator=" ", strip=True)
        if heading_text:
            title = heading_text

    # 前 3 段 p 拼成 summary
    paragraphs = section.find_all("p", limit=3)
    summary_parts: list[str] = []
    for p in paragraphs:
        text = p.get_text(separator=" ", strip=True)
        if text:
            summary_parts.append(text)
    summary = _truncate(" ".join(summary_parts), _MAX_SUMMARY_CHARS)

    # li 内容作为 bullets（最多 5 条）
    bullets: list[str] = []
    for li in section.find_all("li"):
        text = _truncate(li.get_text(separator=" ", strip=True), _MAX_BULLET_CHARS)
        if text:
            bullets.append(text)
        if len(bullets) >= _MAX_BULLETS:
            break

    # blockquote.report-quote 作为 quotes
    quotes: list[str] = []
    for bq in section.find_all("blockquote", class_=re.compile(r"report.?quote", re.I)):
        text = bq.get_text(separator=" ", strip=True)
        if text:
            quotes.append(_truncate(text, 120))

    logger.debug("章节 %s: summary=%d字 bullets=%d quotes=%d",
                 chapter_id, len(summary), len(bullets), len(quotes))
    return ChapterSummary(
        id=chapter_id,
        title=title,
        summary=summary,
        bullets=bullets,
        quotes=quotes,
    )


def _parse_frame_refs(soup: BeautifulSoup) -> list[FrameRef]:
    """收集所有带 data-rk-frame 属性的 img 标签。"""
    refs: list[FrameRef] = []
    for img in soup.find_all("img", attrs={"data-rk-frame": True}):
        path = img.get("data-rk-frame", "") or img.get("src", "")
        caption = img.get("alt", "") or img.get("data-caption", "")
        if path:
            refs.append(FrameRef(path=str(path), caption=str(caption)))
    return refs


def _parse_top_quotes(chapters: list[ChapterSummary]) -> list[QuoteItem]:
    """从所有章节 quotes 里取出前 5 条最有代表性的引用。"""
    items: list[QuoteItem] = []
    for ch in chapters:
        for q in ch.quotes:
            items.append(QuoteItem(text=q, source_chapter=ch.id))
            if len(items) >= 5:
                return items
    return items


def parse_report(report_dir: Path) -> OutlineDoc:
    """解析 report_dir 下的 overview.html + index.json，返回 OutlineDoc。"""
    overview_html = report_dir / "overview.html"
    index_json = report_dir / "index.json"

    if not overview_html.exists():
        raise FileNotFoundError(f"overview.html 不存在：{overview_html}")
    if not index_json.exists():
        raise FileNotFoundError(f"index.json 不存在：{index_json}")

    # 读取 index.json 获取 blogger_slug 和 run_id
    index_data: dict[str, Any] = json.loads(index_json.read_text(encoding="utf-8"))
    blogger_id: str = (
        index_data.get("blogger", {}).get("blogger_id", "")
        or index_data.get("blogger_id", "")
        or report_dir.name
    )
    run_id: str = (
        index_data.get("run_id", "")
        or report_dir.parent.name
    )
    # slug 用 blogger_id（去除非 ASCII 字符做 fallback）
    blogger_slug = re.sub(r"[^\w\-]", "_", blogger_id).strip("_") or "unknown"

    logger.info("解析报告目录: %s (slug=%s run_id=%s)", report_dir, blogger_slug, run_id)

    html_text = overview_html.read_text(encoding="utf-8")
    soup = BeautifulSoup(html_text, "html.parser")

    stats = _parse_stats(soup)
    # 若 display_name 为空，用 blogger_id 兜底
    if not stats.display_name:
        stats = stats.model_copy(update={"display_name": blogger_id})

    verdict = _parse_verdict(soup)

    chapters: list[ChapterSummary] = []
    for ch_id in CHAPTER_IDS:
        section = soup.find("section", id=ch_id)
        if section and isinstance(section, Tag):
            chapters.append(_parse_chapter(section, ch_id))
        else:
            logger.debug("章节 section#%s 未找到，跳过", ch_id)

    frame_refs = _parse_frame_refs(soup)
    top_quotes = _parse_top_quotes(chapters)

    return OutlineDoc(
        blogger_slug=blogger_slug,
        run_id=run_id,
        stats=stats,
        verdict=verdict,
        chapters=chapters,
        top_quotes=top_quotes,
        frame_refs=frame_refs,
    )


def run_extract(report_dir: Path, out_path: Path) -> OutlineDoc:
    """解析报告并写出 outline.json，供 CLI 调用。"""
    outline = parse_report(report_dir)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        outline.model_dump_json(indent=2),
        encoding="utf-8",
    )
    logger.info("outline.json 已写出：%s", out_path)
    return outline
