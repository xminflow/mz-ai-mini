"""把 ArchDoc.diagram 渲染成完整架构图 HTML（内联 CSS，深色主题）。

高亮在 Python 侧"烘焙"成 class：非目标层/框加 dim，目标加 glow。
highlight=="all" 时所有层正常亮度，HTML 中不出现 dim class。纯函数，便于无浏览器单测。
"""
from __future__ import annotations

import html as _html

from studio_kit.core.contracts import ArchDoc, ArchLayer, ArchNode

BRAND = "微域生光 | 十一AI编程"

# 基础样式（不含 dim / glow，highlight=="all" 时只注入此段，保证 "dim" 不出现在 HTML）
_CSS_BASE = """
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:1920px; height:1080px; background:#12141C;
    font-family:"Microsoft YaHei","PingFang SC",sans-serif; overflow:hidden; }
  .stage { width:1920px; height:1080px; padding:40px 56px; display:flex; flex-direction:column; }
  .title { color:#fff; font-size:38px; font-weight:700; text-align:center; }
  .subtitle { color:#8FA0B5; font-size:18px; text-align:center; margin-top:6px; }
  .layers { flex:1; display:flex; flex-direction:column; gap:14px; margin-top:18px; }
  .layer { display:flex; align-items:stretch; gap:14px; flex:1;
    border:2px solid var(--accent); border-radius:10px; background:#1B2130;
    padding:12px 14px; transition:opacity .25s, filter .25s; }
  .layer-label { writing-mode:vertical-rl; text-orientation:upright; min-width:56px;
    background:var(--accent); color:#0B0E14; font-weight:700; font-size:16px;
    border-radius:8px; display:flex; align-items:center; justify-content:center; }
  .nodes { flex:1; display:flex; gap:12px; }
  .node { flex:1; background:#283142; border:1.5px solid var(--accent); border-radius:8px;
    color:#EAEEF5; padding:10px 12px; display:flex; flex-direction:column; justify-content:center;
    transition:opacity .25s, filter .25s, box-shadow .25s; }
  .node .n-title { font-size:18px; font-weight:600; }
  .node .n-sub { font-size:12px; color:#90A0B5; margin-top:4px; }
  .glow { box-shadow:0 0 18px 2px var(--accent); border-width:2.5px; }
  .brand { position:fixed; right:24px; bottom:18px; color:#9AA7B8; font-size:16px;
    letter-spacing:1px; opacity:.85; }
</style>
"""

# 分段高亮时追加的压暗规则（仅在非 all 模式下注入，避免 "dim" 字符串出现在全亮 HTML 中）
_CSS_HIGHLIGHT = "<style>.dim { opacity:.22; filter:saturate(.4); }</style>"


def _esc(s: str) -> str:
    return _html.escape(s, quote=True)


def _node_classes(node: ArchNode, targets: set[str], layer_is_target: bool, all_on: bool) -> str:
    if all_on:
        return "node"
    cls = ["node"]
    if node.id in targets:
        cls.append("glow")
    else:
        # 框级高亮：目标框所在层的其它框压暗；其它层的框也压暗
        cls.append("dim")
    return " ".join(cls)


def _render_layer(layer: ArchLayer, targets: set[str], all_on: bool) -> str:
    # 该层是否被点亮：层 id 命中，或层内有任一框命中
    node_hit = any(n.id in targets for n in layer.nodes)
    layer_is_target = layer.id in targets or node_hit
    layer_cls = "layer" if (all_on or layer_is_target) else "layer dim"
    nodes_html = "".join(
        f'<div class="{_node_classes(n, targets, layer_is_target, all_on)}" '
        f'data-node-id="{_esc(n.id)}"'
        f'{f" style=\"--accent:{_esc(n.accent)}\"" if n.accent else ""}>'
        f'<div class="n-title">{_esc(n.title)}</div>'
        + (f'<div class="n-sub">{_esc(n.sub)}</div>' if n.sub else "")
        + "</div>"
        for n in layer.nodes
    )
    return (
        f'<div class="{layer_cls}" data-layer-id="{_esc(layer.id)}" '
        f'style="--accent:{_esc(layer.accent)}">'
        f'<div class="layer-label">{_esc(layer.title)}</div>'
        f'<div class="nodes">{nodes_html}</div>'
        f"</div>"
    )


def build_diagram_html(doc: ArchDoc, highlight: str | list[str]) -> str:
    """渲染完整架构图 HTML。highlight 同 ArchSegment.highlight 语义。"""
    targets = doc.resolve_highlight(_FakeSeg(highlight))
    all_on = targets == {"all"}
    # 非全亮时才注入 .dim CSS 规则，确保全亮 HTML 中不含 "dim" 字符串
    css_block = _CSS_BASE + ("" if all_on else _CSS_HIGHLIGHT)
    layers_html = "".join(_render_layer(layer, targets, all_on) for layer in doc.diagram.layers)
    subtitle_html = f'<div class="subtitle">{_esc(doc.subtitle)}</div>' if doc.subtitle else ""
    return (
        "<!DOCTYPE html><html><head><meta charset='utf-8'>" + css_block + "</head><body>"
        f'<div class="stage"><div class="title">{_esc(doc.title)}</div>{subtitle_html}'
        f'<div class="layers">{layers_html}</div></div>'
        f'<div class="brand">{_esc(BRAND)}</div>'
        "</body></html>"
    )


class _FakeSeg:
    """复用 ArchDoc.resolve_highlight 的轻量壳（只需 .highlight 字段）。"""

    def __init__(self, highlight: str | list[str]) -> None:
        self.highlight = highlight
