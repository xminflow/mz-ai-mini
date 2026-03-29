from __future__ import annotations

import pytest

from mz_ai_backend.core.config import Settings
from mz_ai_backend.modules.membership.domain import WechatPayConfigMissingException
from mz_ai_backend.modules.membership.infrastructure.dependencies import (
    _normalize_private_key_text,
    _normalize_public_key_text,
    _resolve_optional_public_key,
    get_wechat_pay_gateway,
)


@pytest.mark.parametrize(
    ("raw_value", "expected"),
    (
        (
            "-----BEGIN PRIVATE KEY-----\\nABCDEF\\n-----END PRIVATE KEY-----",
            "ABCDEF",
        ),
        (
            "-----BEGIN PRIVATE KEY-----ABCDEF-----END PRIVATE KEY-----",
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


@pytest.mark.parametrize(
    ("raw_value", "expected"),
    (
        (
            "-----BEGIN PUBLIC KEY-----\\nABCDEF\\n-----END PUBLIC KEY-----",
            "ABCDEF",
        ),
        (
            "-----BEGIN PUBLIC KEY-----ABCDEF-----END PUBLIC KEY-----",
            "ABCDEF",
        ),
        (
            "-----BEGIN PUBLIC KEY-----\r\nABC\r\nDEF\r\n-----END PUBLIC KEY-----",
            "ABCDEF",
        ),
        (
            "'-----BEGIN PUBLIC KEY-----\nABCD\n-----END PUBLIC KEY-----'",
            "ABCD",
        ),
        (
            "ABCD\nEFGH",
            "ABCDEFGH",
        ),
    ),
)
def test_normalize_public_key_text_handles_multiple_input_formats(
    raw_value: str,
    expected: str,
) -> None:
    assert _normalize_public_key_text(raw_value) == expected


def _build_settings(**overrides: str | None) -> Settings:
    defaults: dict[str, str | None] = {
        "wechat_pay_mchid": "1900000109",
        "wechat_pay_appid": "wx1234567890",
        "wechat_pay_private_key": (
            "-----BEGIN PRIVATE KEY-----\nABCDEF\n-----END PRIVATE KEY-----"
        ),
        "wechat_pay_cert_serial_no": "7777777777",
        "wechat_pay_apiv3_key": "0123456789abcdef0123456789abcdef",
        "wechat_pay_notify_url": "https://example.com/api/v1/memberships/wechat-pay/notify",
    }
    defaults.update(overrides)
    return Settings(**defaults)


def test_resolve_optional_public_key_returns_none_when_not_configured() -> None:
    assert _resolve_optional_public_key(_build_settings()) == (None, None)


def test_resolve_optional_public_key_rejects_half_configured_pair() -> None:
    with pytest.raises(WechatPayConfigMissingException):
        _resolve_optional_public_key(
            _build_settings(wechat_pay_public_key="-----BEGIN PUBLIC KEY-----\nABC\n-----END PUBLIC KEY-----"),
        )

    with pytest.raises(WechatPayConfigMissingException):
        _resolve_optional_public_key(
            _build_settings(wechat_pay_public_key_id="PUB_KEY_ID"),
        )


def test_get_wechat_pay_gateway_passes_public_key_pair(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    captured: dict[str, str | None] = {}

    class StubGateway:
        def __init__(self, **kwargs: str | None) -> None:
            captured.update(kwargs)

    monkeypatch.setattr(
        "mz_ai_backend.modules.membership.infrastructure.dependencies.WechatPayV3Gateway",
        StubGateway,
    )

    gateway = get_wechat_pay_gateway(
        settings=_build_settings(
            wechat_pay_public_key=(
                "-----BEGIN PUBLIC KEY-----\nAABBCCDD\n-----END PUBLIC KEY-----"
            ),
            wechat_pay_public_key_id="PUB_KEY_ID",
        ),
    )

    assert isinstance(gateway, StubGateway)
    assert captured["public_key"] == "AABBCCDD"
    assert captured["public_key_id"] == "PUB_KEY_ID"


def test_get_wechat_pay_gateway_raises_clear_error_when_sdk_init_fails(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class BrokenGateway:
        def __init__(self, **kwargs: str | None) -> None:
            raise RuntimeError("boom")

    monkeypatch.setattr(
        "mz_ai_backend.modules.membership.infrastructure.dependencies.WechatPayV3Gateway",
        BrokenGateway,
    )

    with pytest.raises(
        WechatPayConfigMissingException,
        match="Failed to initialize WeChat Pay gateway",
    ):
        get_wechat_pay_gateway(settings=_build_settings())
