import pytest
from pydantic import ValidationError
from studio_kit.core.contracts import ArchDoc

def _doc(**over):
    base = {
        "slug": "im", "run_id": "r1", "title": "T",
        "diagram": {"layers": [
            {"id": "client", "title": "客户端层", "accent": "#4DA3FF",
             "nodes": [{"id": "client.mobile", "title": "iOS/Android"}]},
            {"id": "logic", "title": "业务逻辑层", "accent": "#A78BFA",
             "nodes": [{"id": "logic.msg", "title": "消息服务"},
                       {"id": "logic.user", "title": "用户服务"}]},
        ]},
        "segments": [
            {"index": 0, "narration": "总览", "highlight": "all"},
            {"index": 1, "narration": "客户端", "highlight": "client"},
            {"index": 2, "narration": "消息", "highlight": ["logic.msg"]},
        ],
    }
    base.update(over)
    return base

def test_valid_doc_parses():
    doc = ArchDoc.model_validate(_doc())
    assert doc.layer_ids() == {"client", "logic"}
    assert "logic.msg" in doc.node_ids()
    assert doc.resolve_highlight(doc.segments[0]) == {"all"}
    assert doc.resolve_highlight(doc.segments[1]) == {"client"}
    assert doc.resolve_highlight(doc.segments[2]) == {"logic.msg"}

def test_dangling_highlight_rejected():
    with pytest.raises(ValidationError):
        ArchDoc.model_validate(_doc(segments=[{"index": 0, "narration": "x", "highlight": "nope"}]))

def test_non_contiguous_index_rejected():
    with pytest.raises(ValidationError):
        ArchDoc.model_validate(_doc(segments=[{"index": 5, "narration": "x", "highlight": "all"}]))

def test_duplicate_layer_id_rejected():
    bad = _doc()
    bad["diagram"]["layers"][1]["id"] = "client"
    with pytest.raises(ValidationError):
        ArchDoc.model_validate(bad)

def test_empty_nodes_rejected():
    bad = _doc()
    bad["diagram"]["layers"][0]["nodes"] = []
    with pytest.raises(ValidationError):
        ArchDoc.model_validate(bad)

def test_empty_narration_rejected():
    with pytest.raises(ValidationError):
        ArchDoc.model_validate(_doc(segments=[{"index": 0, "narration": "  ", "highlight": "all"}]))
