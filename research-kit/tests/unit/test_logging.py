"""日志脱敏与配置幂等性。"""

from __future__ import annotations

import logging
from pathlib import Path

from research_kit.core.logging import configure_logging, mask_sensitive


def test_mask_sensitive_redacts_api_key() -> None:
    masked = mask_sensitive({"anthropic_api_key": "sk-1234567890abcdef"})
    assert masked["anthropic_api_key"] != "sk-1234567890abcdef"
    assert "sk-1" in masked["anthropic_api_key"]


def test_mask_sensitive_recurses() -> None:
    masked = mask_sensitive({"upstream": {"authorization": "Bearer abcdef123456"}})
    assert masked["upstream"]["authorization"] != "Bearer abcdef123456"


def test_mask_sensitive_passes_through_safe_fields() -> None:
    masked = mask_sensitive({"workspace": "/path", "focus_count": 5})
    assert masked == {"workspace": "/path", "focus_count": 5}


def test_configure_logging_is_idempotent(tmp_path: Path) -> None:
    log_file = tmp_path / "test.log"
    configure_logging(level="DEBUG", log_file=log_file)
    configure_logging(level="DEBUG", log_file=log_file)
    root = logging.getLogger()
    # 不应累积 handler
    assert len(root.handlers) == 2  # 1 stream + 1 file
