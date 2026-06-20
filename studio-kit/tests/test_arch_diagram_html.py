"""架构图 HTML 生成器测试（Task 2）。"""
from __future__ import annotations

import re

from studio_kit.core.contracts import ArchDoc
from studio_kit.render.arch_diagram import build_diagram_html, BRAND


def _doc() -> ArchDoc:
    return ArchDoc.model_validate({
        "slug": "im", "run_id": "r1", "title": "标题T",
        "diagram": {"layers": [
            {"id": "client", "title": "客户端层", "accent": "#4DA3FF",
             "nodes": [{"id": "client.mobile", "title": "iOS/Android", "sub": "本地库"}]},
            {"id": "logic", "title": "业务逻辑层", "accent": "#A78BFA",
             "nodes": [{"id": "logic.msg", "title": "消息服务"},
                       {"id": "logic.user", "title": "用户服务"}]},
        ]},
        "segments": [{"index": 0, "narration": "x", "highlight": "all"}],
    })


def test_all_ids_and_brand_present() -> None:
    html = build_diagram_html(_doc(), "all")
    assert 'data-layer-id="client"' in html
    assert 'data-layer-id="logic"' in html
    assert 'data-node-id="logic.msg"' in html
    assert "标题T" in html
    assert BRAND in html
    assert "weelume" not in html.lower()  # 可见层禁域名


def test_highlight_all_has_no_dim() -> None:
    html = build_diagram_html(_doc(), "all")
    assert "dim" not in html


def test_layer_highlight_dims_others() -> None:
    html = build_diagram_html(_doc(), "client")
    # client 层标签块不 dim，logic 层 dim
    assert _layer_block(html, "logic").count("dim") >= 1
    assert "dim" not in _layer_block(html, "client")


def test_node_highlight_keeps_layer_dims_siblings() -> None:
    html = build_diagram_html(_doc(), ["logic.msg"])
    # 所属 logic 层整体不 dim，但兄弟框 logic.user dim、目标框 logic.msg 不 dim 且 glow
    assert "dim" not in _node_block(html, "logic.msg")
    assert "glow" in _node_block(html, "logic.msg")
    assert "dim" in _node_block(html, "logic.user")
    assert "dim" not in _layer_label_block(html, "logic")


# ── 辅助函数 ──────────────────────────────────────────────────────────

def _layer_block(html: str, lid: str) -> str:
    """定位含 data-layer-id="<lid>" 的开标签，返回其 class="..." 属性串。"""
    # 匹配形如 <div class="..." data-layer-id="<lid>" ...>（属性顺序任意）
    pattern = r'<[^>]*data-layer-id="' + re.escape(lid) + r'"[^>]*>'
    m = re.search(pattern, html)
    if m is None:
        raise AssertionError(f"未找到 data-layer-id={lid!r} 的开标签")
    tag = m.group(0)
    cm = re.search(r'class="([^"]*)"', tag)
    return cm.group(1) if cm else ""


def _node_block(html: str, nid: str) -> str:
    """定位含 data-node-id="<nid>" 的开标签，返回其 class="..." 属性串。"""
    pattern = r'<[^>]*data-node-id="' + re.escape(nid) + r'"[^>]*>'
    m = re.search(pattern, html)
    if m is None:
        raise AssertionError(f"未找到 data-node-id={nid!r} 的开标签")
    tag = m.group(0)
    cm = re.search(r'class="([^"]*)"', tag)
    return cm.group(1) if cm else ""


def _layer_label_block(html: str, lid: str) -> str:
    """返回层 lid 对应的 .layer 开标签的 class 串。

    语义：test_node_highlight_keeps_layer_dims_siblings 断言 "dim" not in 返回值，
    表示所属层整体未被压暗——因此这里直接复用 _layer_block，取层开标签的 class。
    """
    return _layer_block(html, lid)
