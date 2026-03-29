from __future__ import annotations

import pytest

from mz_ai_backend.modules.membership.domain import WechatPayConfigMissingException
from mz_ai_backend.modules.membership.infrastructure.dependencies import (
    _normalize_private_key_text,
)


@pytest.mark.parametrize(
    ("raw_value", "expected"),
    (
        (
            "-----BEGIN PRIVATE KEY-----\\nABCDEF\\n-----END PRIVATE KEY-----",
            "ABCDEF",
        ),
        (
            "-----BEGIN PRIVATE KEY-----\r\nABC\r\nDEF\r\n-----END PRIVATE KEY-----",
            "ABCDEF",
        ),
        (
            "'-----BEGIN PRIVATE KEY-----\nABCD\n-----END PRIVATE KEY-----'",
            "ABCD",
        ),
        (
            "ABCD\nEFGH",
            "ABCDEFGH",
        ),
    ),
)
def test_normalize_private_key_text_handles_multiple_input_formats(
    raw_value: str,
    expected: str,
) -> None:
    assert _normalize_private_key_text(raw_value) == expected


def test_normalize_private_key_text_rejects_blank_value() -> None:
    with pytest.raises(WechatPayConfigMissingException):
        _normalize_private_key_text("   ")
