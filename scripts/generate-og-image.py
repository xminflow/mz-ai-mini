"""一次性脚本：生成 1200x630 的官网 OG 封面图。

通过 `uv run --with pillow python scripts/generate-og-image.py` 执行。
输出: website/public/og/cover.png
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUTPUT = Path(r"D:\code\weelume-base\website\public\og\cover.png")
LOGO = Path(r"D:\code\weelume-base\website\public\logo\weiyu-logo-web-light.svg")

WIDTH, HEIGHT = 1200, 630

# 风格与官网一致：深色画布 + 紫青渐变光晕
CANVAS = (5, 5, 7, 255)
INK = (245, 245, 247, 255)
INK_SOFT = (212, 212, 216, 255)
MUTED = (140, 140, 150, 255)
HAIRLINE = (255, 255, 255, 30)
VIOLET = (167, 139, 250)
CYAN = (34, 211, 238)
PINK = (244, 114, 182)

FONT_BOLD = Path(r"C:\Windows\Fonts\msyhbd.ttc")
FONT_REG = Path(r"C:\Windows\Fonts\msyh.ttc")
FONT_MONO_FALLBACK = Path(r"C:\Windows\Fonts\consola.ttf")


def gradient_text(
    img: Image.Image,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.FreeTypeFont,
    gradient: list[tuple[float, tuple[int, int, int]]],
) -> None:
    """以三段线性渐变绘制大字。"""
    # 先在透明层把文字绘制为白色
    bbox = font.getbbox(text)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1] + bbox[1]  # 含上方留白
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(layer).text((-bbox[0], 0), text, font=font, fill=(255, 255, 255, 255))

    # 构造水平渐变
    grad = Image.new("RGB", (w, 1), gradient[0][1])
    pixels = grad.load()
    if pixels is None:
        return
    for i in range(w):
        t = i / max(w - 1, 1)
        for k in range(len(gradient) - 1):
            t0, c0 = gradient[k]
            t1, c1 = gradient[k + 1]
            if t0 <= t <= t1:
                local = (t - t0) / max(t1 - t0, 1e-6)
                r = int(c0[0] + (c1[0] - c0[0]) * local)
                g = int(c0[1] + (c1[1] - c0[1]) * local)
                b = int(c0[2] + (c1[2] - c0[2]) * local)
                pixels[i, 0] = (r, g, b)
                break
    grad = grad.resize((w, h))

    # 把渐变图按文字 alpha 蒙版叠回画面
    grad_rgba = grad.convert("RGBA")
    grad_rgba.putalpha(layer.split()[3])
    img.alpha_composite(grad_rgba, xy)


def radial_glow(
    size: tuple[int, int], center: tuple[float, float], color: tuple[int, int, int], radius: float, alpha: float = 0.55
) -> Image.Image:
    """放射状辉光层（透明背景）。"""
    w, h = size
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    cx, cy = center
    steps = 36
    for i in range(steps, 0, -1):
        r = radius * (i / steps)
        a = int(alpha * 255 * (1 - i / steps) ** 1.6)
        draw.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            fill=(color[0], color[1], color[2], a),
        )
    return glow.filter(ImageFilter.GaussianBlur(60))


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    img = Image.new("RGBA", (WIDTH, HEIGHT), CANVAS)

    # 背景辉光
    img.alpha_composite(radial_glow((WIDTH, HEIGHT), (140, 80), VIOLET, 520, 0.55))
    img.alpha_composite(radial_glow((WIDTH, HEIGHT), (WIDTH - 100, HEIGHT - 60), CYAN, 520, 0.45))
    img.alpha_composite(radial_glow((WIDTH, HEIGHT), (WIDTH * 0.55, HEIGHT * 0.45), PINK, 280, 0.18))

    # 细网格点缀
    grid = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(grid)
    for x in range(0, WIDTH, 80):
        g_draw.line([(x, 0), (x, HEIGHT)], fill=(255, 255, 255, 7), width=1)
    for y in range(0, HEIGHT, 80):
        g_draw.line([(0, y), (WIDTH, y)], fill=(255, 255, 255, 7), width=1)
    img.alpha_composite(grid)

    # 顶部 hairline 与卡片边框
    draw = ImageDraw.Draw(img)
    pad = 56
    draw.rectangle([pad, pad, WIDTH - pad, HEIGHT - pad], outline=HAIRLINE, width=1)

    # 品牌词（左上）
    brand_font = ImageFont.truetype(str(FONT_BOLD), 26)
    draw.text((pad + 28, pad + 28), "微域生光", font=brand_font, fill=INK)
    tag_font = ImageFont.truetype(str(FONT_REG), 16)
    draw.text((pad + 28, pad + 64), "WEELUME · 自媒体获客信息库", font=tag_font, fill=MUTED)

    # 主标题（两行）
    title_font = ImageFont.truetype(str(FONT_BOLD), 92)
    sub_font = ImageFont.truetype(str(FONT_BOLD), 76)

    # Line 1: AI × 自媒体（白色）
    draw.text((pad + 28, 220), "AI × 自媒体", font=title_font, fill=INK)
    # Line 2: 让客户源源不断地找上门（渐变）
    gradient = [(0.0, VIOLET), (0.55, PINK), (1.0, CYAN)]
    gradient_text(img, (pad + 28, 340), "让客户源源不断地找上门", sub_font, gradient)

    # 副标题（小字）
    cap_font = ImageFont.truetype(str(FONT_REG), 22)
    draw.text(
        (pad + 28, 460),
        "真实赛道分析 · 一线博主拆解 · 运营方法论手册 · AI 信息工具",
        font=cap_font,
        fill=INK_SOFT,
    )

    # 右下脚注（域名）
    foot_font = ImageFont.truetype(str(FONT_MONO_FALLBACK), 20)
    foot_text = "weelume.com"
    fbox = foot_font.getbbox(foot_text)
    fw = fbox[2] - fbox[0]
    draw.text((WIDTH - pad - 28 - fw, HEIGHT - pad - 32), foot_text, font=foot_font, fill=MUTED)

    # 左下小标识
    mark_font = ImageFont.truetype(str(FONT_REG), 18)
    draw.text(
        (pad + 28, HEIGHT - pad - 36),
        "把别人验证过的经验，变成你的方法。",
        font=mark_font,
        fill=MUTED,
    )

    img.convert("RGB").save(OUTPUT, format="PNG", optimize=True)
    size_kb = OUTPUT.stat().st_size / 1024
    print(f"Wrote {OUTPUT} ({size_kb:.1f}KB, {WIDTH}x{HEIGHT})")


if __name__ == "__main__":
    main()
