"""drawio → PNG 导出，封装 draw.io Desktop CLI。

已验证命令：<exe> --export --no-sandbox --format png --scale N --output <out> <in>
exe 路径：环境变量 DRAWIO_EXE 优先，否则默认常量。
"""
from __future__ import annotations

import os
import subprocess
from pathlib import Path

from studio_kit.core.logging import get_logger

logger = get_logger(__name__)

_DEFAULT_DRAWIO_EXE = Path(r"D:\software\drawio\draw.io\draw.io.exe")


def resolve_drawio_exe() -> Path:
    raw = os.environ.get("DRAWIO_EXE")
    exe = Path(raw) if raw else _DEFAULT_DRAWIO_EXE
    if not exe.exists():
        raise FileNotFoundError(
            f"draw.io Desktop 可执行文件不存在：{exe}\n"
            "请安装 draw.io Desktop，或用环境变量 DRAWIO_EXE 指定其路径。"
        )
    return exe


def build_export_cmd(exe: Path, drawio_path: Path, png_path: Path, scale: int) -> list[str]:
    return [
        str(exe), "--export", "--no-sandbox",
        "--format", "png", "--scale", str(scale),
        "--output", str(png_path), str(drawio_path),
    ]


def build_svg_export_cmd(exe: Path, drawio_path: Path, svg_path: Path) -> list[str]:
    return [
        str(exe), "--export", "--no-sandbox",
        "--format", "svg",
        "--output", str(svg_path), str(drawio_path),
    ]


def patch_svg_for_dark_theme(svg_path: Path) -> None:
    """修正 drawio 导出 SVG 在深色页面下的配色错乱。

    drawio 导出的 SVG 根节点带 `color-scheme: light dark`，且每个颜色都包成
    `light-dark(浅色, 深色)`。当该 SVG 嵌入深色 HTML 页面时，Chrome 会解析为
    深色变体——于是描边、白字全被换成暗灰，看上去像“字看不清”。
    强制 `color-scheme: light`，让所有 light-dark() 取第一个（即图里实际设定的）颜色。
    """
    text = svg_path.read_text(encoding="utf-8")
    patched = text.replace("color-scheme: light dark", "color-scheme: light")
    if patched != text:
        svg_path.write_text(patched, encoding="utf-8")
        logger.info("已修正 SVG 深色配色：%s（color-scheme→light）", svg_path.name)


def export_drawio_to_png(drawio_path: Path, png_path: Path, *, scale: int = 2) -> None:
    if not drawio_path.exists():
        raise FileNotFoundError(f"drawio 源文件不存在：{drawio_path}")
    exe = resolve_drawio_exe()
    png_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = build_export_cmd(exe, drawio_path, png_path, scale)
    logger.info("drawio 导出：%s → %s", drawio_path.name, png_path.name)
    result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if result.returncode != 0:
        raise RuntimeError(
            f"drawio 导出失败（exit={result.returncode}）：{drawio_path}\n"
            f"STDERR:\n{result.stderr}"
        )
    if not png_path.exists():
        raise RuntimeError(f"drawio 导出未生成 PNG：{png_path}（exit=0 但文件缺失）")


def export_drawio_to_svg(drawio_path: Path, svg_path: Path) -> None:
    """导出透明 SVG（供 HTML 框架嵌入），并修正深色页面下的配色错乱。"""
    if not drawio_path.exists():
        raise FileNotFoundError(f"drawio 源文件不存在：{drawio_path}")
    exe = resolve_drawio_exe()
    svg_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = build_svg_export_cmd(exe, drawio_path, svg_path)
    logger.info("drawio 导出 SVG：%s → %s", drawio_path.name, svg_path.name)
    result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if result.returncode != 0:
        raise RuntimeError(
            f"drawio 导出 SVG 失败（exit={result.returncode}）：{drawio_path}\n"
            f"STDERR:\n{result.stderr}"
        )
    if not svg_path.exists():
        raise RuntimeError(f"drawio 导出未生成 SVG：{svg_path}（exit=0 但文件缺失）")
    patch_svg_for_dark_theme(svg_path)


def export_dir(src_dir: Path, out_dir: Path, *, scale: int = 2, force: bool = False) -> list[Path]:
    if not src_dir.is_dir():
        raise FileNotFoundError(f"drawio 源目录不存在：{src_dir}")
    out_dir.mkdir(parents=True, exist_ok=True)
    results: list[Path] = []
    drawios = sorted(src_dir.glob("*.drawio"))
    if not drawios:
        raise FileNotFoundError(f"{src_dir} 下没有 .drawio 文件")
    for d in drawios:
        png = out_dir / f"{d.stem}.png"
        if png.exists() and not force:
            logger.info("%s 已存在，跳过", png.name)
            results.append(png)
            continue
        export_drawio_to_png(d, png, scale=scale)
        results.append(png)
    return results
