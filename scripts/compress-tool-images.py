"""一次性脚本：压缩 website/public/tool/ 下的 UI 截图。

通过 `uv run --with pillow python scripts/compress-tool-images.py` 执行。
- 目标最大宽度 1600（覆盖 2x DPR）。
- 使用 LANCZOS 重采样后做自适应调色板量化（256 色），UI 截图视觉损失基本不可察。
- 保留原文件名，原地替换。
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(r"D:\code\weelume-base\website\public\tool")
TARGETS = [
    "blogger.png",
    "chat.png",
    "content_diagnosis.png",
    "hot_analysis.png",
    "material.png",
]
MAX_WIDTH = 1600
PALETTE_COLORS = 256


def compress_one(path: Path) -> tuple[int, int, tuple[int, int], tuple[int, int]]:
    before_bytes = path.stat().st_size
    img = Image.open(path)
    src_size = img.size
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if "A" in img.mode else "RGB")

    width, height = img.size
    if width > MAX_WIDTH:
        new_height = round(height * MAX_WIDTH / width)
        img = img.resize((MAX_WIDTH, new_height), Image.LANCZOS)

    quantized = img.convert("RGB").quantize(
        colors=PALETTE_COLORS,
        method=Image.Quantize.MEDIANCUT,
        dither=Image.Dither.FLOYDSTEINBERG,
    )
    quantized.save(path, format="PNG", optimize=True)
    after_bytes = path.stat().st_size
    return before_bytes, after_bytes, src_size, img.size


def main() -> None:
    total_before = 0
    total_after = 0
    print(f"{'file':<24}{'before':>10}{'after':>10}{'ratio':>10}  src -> out")
    for name in TARGETS:
        path = ROOT / name
        before, after, src_size, out_size = compress_one(path)
        total_before += before
        total_after += after
        ratio = after / before if before else 0
        print(
            f"{name:<24}{before/1024:>8.1f}KB{after/1024:>8.1f}KB{ratio*100:>8.1f}%  "
            f"{src_size[0]}x{src_size[1]} -> {out_size[0]}x{out_size[1]}"
        )
    saved = total_before - total_after
    print(
        f"{'TOTAL':<24}{total_before/1024:>8.1f}KB{total_after/1024:>8.1f}KB"
        f"{(total_after/total_before)*100:>8.1f}%  saved {saved/1024:.1f}KB"
    )


if __name__ == "__main__":
    main()
