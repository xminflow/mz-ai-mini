"""把 sets/v0X/*.html.tmpl 用陈厂长真实 script.json 渲染成 sets/v0X/preview/*.html。

仅用于 gallery 审核，不影响主管线。

用法（在 studio-kit 目录运行）：
  uv run python .claude/skills/blogger-breakdown-shortvideo/templates/cover-variants/render_previews.py
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

# 让 studio_kit 可被导入
_KIT_ROOT = Path(__file__).resolve().parents[4]  # studio-kit/
sys.path.insert(0, str(_KIT_ROOT / "src"))

from studio_kit.core.contracts import ScriptDoc
from studio_kit.render.slide_renderer import generate_slide_html


SCRIPT_PATH = Path(
    r"D:\code\weelume-base\studio-kit\output\shortvideos"
    r"\MS4wLjABAAAAp4rTM-CEtfeT42Iv8wgclUTmjAelf9HUCJvuFq7ddtg"
    r"\20260521T023305Z\script.json"
)
SETS_ROOT = Path(__file__).resolve().parent / "sets"


def main() -> None:
    script = ScriptDoc.model_validate(json.loads(SCRIPT_PATH.read_text(encoding="utf-8")))

    variants = sorted(p for p in SETS_ROOT.iterdir() if p.is_dir())
    if not variants:
        print(f"[err] no sets/v0X found under {SETS_ROOT}")
        return

    rendered = 0
    for variant_dir in variants:
        preview_dir = variant_dir / "preview"
        preview_dir.mkdir(exist_ok=True)

        # 切换模板目录到当前套
        os.environ["STUDIO_KIT_TEMPLATE_DIR"] = str(variant_dir)

        for slide in script.slides:
            out = preview_dir / f"{slide.index:02d}-{slide.slide_type}.html"
            generate_slide_html(slide, out)
            rendered += 1
            print(f"[ok] {variant_dir.name}/{out.name}")

    print(f"\nrendered {rendered} preview files across {len(variants)} variants")


if __name__ == "__main__":
    main()
