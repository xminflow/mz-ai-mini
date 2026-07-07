"""HTML 幻灯片 → PNG 渲染，封装无头 Chrome 截图。

高端 PPT 的图走「HTML/CSS → 无头 Chrome 截 1920×1080 PNG」流程，本模块把
output/ppt/*/html/render_all.sh 的临时脚本固化为可复用能力。

已验证命令：
    <chrome> --headless=new --hide-scrollbars --force-device-scale-factor=1
             --window-size=<w>,<h> --virtual-time-budget=<ms>
             --allow-file-access-from-files --screenshot=<绝对out> file:///<绝对html>

chrome 路径：环境变量 CHROME_PATH 优先，否则默认常量。
"""
from __future__ import annotations

import os
import subprocess
from pathlib import Path

from studio_kit.core.logging import get_logger

logger = get_logger(__name__)

_DEFAULT_CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"


def resolve_chrome_path() -> str:
    """解析无头 Chrome 可执行路径：环境变量 CHROME_PATH 优先，否则默认安装路径。"""
    return os.environ.get("CHROME_PATH", _DEFAULT_CHROME_PATH)


def build_chrome_cmd(
    chrome_path: str,
    html_path: Path,
    out_png: Path,
    *,
    width: int,
    height: int,
    timeout_ms: int,
) -> list[str]:
    """组装无头 Chrome 截图命令。

    out_png 必须是绝对路径：Chrome 的 --screenshot 相对路径会写到其工作目录，
    导致看似成功实则文件丢失/拒绝访问（已踩过的坑）。html 同样用绝对路径拼 file:// URL。
    """
    return [
        chrome_path,
        "--headless=new",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        f"--window-size={width},{height}",
        f"--virtual-time-budget={timeout_ms}",
        "--allow-file-access-from-files",
        f"--screenshot={out_png}",
        f"file:///{html_path.as_posix()}",
    ]


def render_html(
    html_path: Path,
    out_png: Path,
    *,
    chrome_path: str,
    width: int = 1920,
    height: int = 1080,
    timeout_ms: int = 4000,
) -> Path:
    """用无头 Chrome 把单个 HTML 截成 PNG，返回产物绝对路径。

    校验：调用后若目标 PNG 未生成，raise RuntimeError（含 chrome stderr），绝不静默失败。
    """
    if not html_path.exists():
        raise FileNotFoundError(f"HTML 源文件不存在：{html_path}")

    # Chrome 相对路径会写错位置，统一转绝对路径并确保父目录存在
    abs_html = html_path.resolve()
    abs_out = out_png.resolve()
    abs_out.parent.mkdir(parents=True, exist_ok=True)

    cmd = build_chrome_cmd(
        chrome_path,
        abs_html,
        abs_out,
        width=width,
        height=height,
        timeout_ms=timeout_ms,
    )
    logger.info("HTML 渲染：%s → %s（%d×%d）", abs_html.name, abs_out.name, width, height)
    # encoding=utf-8/errors=replace：Chrome 在 Windows 输出可能含非 gbk 字符，避免解码崩溃
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if not abs_out.exists():
        raise RuntimeError(
            f"无头 Chrome 未生成 PNG：{abs_out}（exit={result.returncode}）\n"
            f"STDERR:\n{result.stderr}"
        )
    return abs_out


def render_dir(
    html_dir: Path,
    out_dir: Path,
    *,
    chrome_path: str,
    only: list[str] | None = None,
    width: int = 1920,
    height: int = 1080,
) -> list[Path]:
    """渲染 html_dir 下所有 *.html → out_dir/<stem>.png，返回成功 PNG 路径列表。

    跳过以 `_` 开头的辅助文件；only 非空时只渲染指定页名（不带 .html 后缀）。
    """
    if not html_dir.is_dir():
        raise FileNotFoundError(f"HTML 源目录不存在：{html_dir}")
    out_dir.mkdir(parents=True, exist_ok=True)

    htmls = sorted(p for p in html_dir.glob("*.html") if not p.name.startswith("_"))
    if only:
        wanted = set(only)
        htmls = [p for p in htmls if p.stem in wanted]
    if not htmls:
        raise FileNotFoundError(
            f"{html_dir} 下没有待渲染的 .html 文件"
            + (f"（only={only}）" if only else "（已排除 _ 开头辅助文件）")
        )

    results: list[Path] = []
    for html in htmls:
        png = out_dir / f"{html.stem}.png"
        produced = render_html(
            html, png, chrome_path=chrome_path, width=width, height=height
        )
        logger.info("已渲染：%s", produced)
        results.append(produced)
    return results
