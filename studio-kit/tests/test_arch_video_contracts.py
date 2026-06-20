# tests/test_arch_video_contracts.py
import pytest
from pydantic import ValidationError
from studio_kit.core.contracts import ArchVideoDoc

def _doc(**over):
    base = {
        "slug": "im", "run_id": "r1", "title": "T",
        "segments": [
            {"index": 0, "narration": "总览", "image": "images/arch.png"},
            {"index": 1, "narration": "客户端", "image": "images/arch.client.png"},
        ],
    }
    base.update(over)
    return base

def test_valid_doc_parses():
    doc = ArchVideoDoc.model_validate(_doc())
    assert len(doc.segments) == 2
    assert doc.segments[1].image == "images/arch.client.png"

def test_non_contiguous_index_rejected():
    with pytest.raises(ValidationError):
        ArchVideoDoc.model_validate(_doc(segments=[{"index": 3, "narration": "x", "image": "a.png"}]))

def test_empty_narration_rejected():
    with pytest.raises(ValidationError):
        ArchVideoDoc.model_validate(_doc(segments=[{"index": 0, "narration": " ", "image": "a.png"}]))

def test_empty_image_rejected():
    with pytest.raises(ValidationError):
        ArchVideoDoc.model_validate(_doc(segments=[{"index": 0, "narration": "x", "image": ""}]))

def test_empty_segments_rejected():
    with pytest.raises(ValidationError):
        ArchVideoDoc.model_validate(_doc(segments=[]))
