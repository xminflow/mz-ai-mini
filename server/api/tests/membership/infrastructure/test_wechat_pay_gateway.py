from __future__ import annotations

import pytest

from mz_ai_backend.modules.membership.application.dtos import (
    WechatPayCreateOrderRequest,
    WechatPayPaymentParams,
)
from mz_ai_backend.modules.membership.domain import WechatPayOrderCreateFailedException
from mz_ai_backend.modules.membership.infrastructure.wechat_pay_gateway import (
    WechatPayV3Gateway,
)


class _StubWxPay:
    def __init__(self, result):
        self._result = result

    def pay(self, **kwargs):  # noqa: ANN003
        return self._result


def _build_gateway(result) -> WechatPayV3Gateway:  # noqa: ANN001
    gateway = WechatPayV3Gateway.__new__(WechatPayV3Gateway)
    gateway._appid = "wx-test-app-id"  # noqa: SLF001
    gateway._wxpay = _StubWxPay(result)  # noqa: SLF001
    return gateway


def _build_request() -> WechatPayCreateOrderRequest:
    return WechatPayCreateOrderRequest(
        order_no="202603290001",
        amount_fen=10,
        description="test",
        payer_openid="openid-10001",
    )


@pytest.mark.asyncio
async def test_create_order_raises_wechat_error_from_payload(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def _fake_run_in_threadpool(func, **kwargs):  # noqa: ANN001, ANN202
        return func(**kwargs)

    monkeypatch.setattr(
        "mz_ai_backend.shared.wechat_pay.run_in_threadpool",
        _fake_run_in_threadpool,
    )
    gateway = _build_gateway(
        (
            400,
            {
                "code": "PARAM_ERROR",
                "message": "openid and appid not match",
            },
        )
    )

    with pytest.raises(
        WechatPayOrderCreateFailedException,
        match="PARAM_ERROR: openid and appid not match",
    ):
        await gateway.create_order(_build_request())


@pytest.mark.asyncio
async def test_create_order_raises_wechat_error_from_json_string_payload(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def _fake_run_in_threadpool(func, **kwargs):  # noqa: ANN001, ANN202
        return func(**kwargs)

    monkeypatch.setattr(
        "mz_ai_backend.shared.wechat_pay.run_in_threadpool",
        _fake_run_in_threadpool,
    )
    gateway = _build_gateway(
        (
            400,
            '{"code":"PARAM_ERROR","message":"openid and appid not match"}',
        )
    )

    with pytest.raises(
        WechatPayOrderCreateFailedException,
        match="PARAM_ERROR: openid and appid not match",
    ):
        await gateway.create_order(_build_request())


@pytest.mark.asyncio
async def test_create_order_raises_network_error_message(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def _broken_run_in_threadpool(func, **kwargs):  # noqa: ANN001, ANN202
        raise TimeoutError("connect timeout")

    monkeypatch.setattr(
        "mz_ai_backend.shared.wechat_pay.run_in_threadpool",
        _broken_run_in_threadpool,
    )
    gateway = _build_gateway((200, {"prepay_id": "unused"}))

    with pytest.raises(
        WechatPayOrderCreateFailedException,
        match="connect timeout",
    ):
        await gateway.create_order(_build_request())


@pytest.mark.asyncio
async def test_create_order_raises_when_prepay_id_is_missing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def _fake_run_in_threadpool(func, **kwargs):  # noqa: ANN001, ANN202
        return func(**kwargs)

    monkeypatch.setattr(
        "mz_ai_backend.shared.wechat_pay.run_in_threadpool",
        _fake_run_in_threadpool,
    )
    gateway = _build_gateway((200, {"appid": "wx-test-app-id"}))

    with pytest.raises(
        WechatPayOrderCreateFailedException,
        match="does not contain prepay_id",
    ):
        await gateway.create_order(_build_request())


@pytest.mark.asyncio
async def test_create_order_returns_payment_params_when_successful(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def _fake_run_in_threadpool(func, **kwargs):  # noqa: ANN001, ANN202
        return func(**kwargs)

    monkeypatch.setattr(
        "mz_ai_backend.shared.wechat_pay.run_in_threadpool",
        _fake_run_in_threadpool,
    )

    gateway = _build_gateway((200, {"prepay_id": "wx-prepay-10001"}))

    def _stub_build_payment_params(self, *, prepay_id: str) -> WechatPayPaymentParams:
        assert prepay_id == "wx-prepay-10001"
        return WechatPayPaymentParams(
            time_stamp="12345",
            nonce_str="nonce",
            package=f"prepay_id={prepay_id}",
            sign_type="RSA",
            pay_sign="sign",
        )

    monkeypatch.setattr(
        WechatPayV3Gateway,
        "_build_payment_params",
        _stub_build_payment_params,
    )

    result = await gateway.create_order(_build_request())
    assert result.prepay_id == "wx-prepay-10001"
    assert result.payment_params.package == "prepay_id=wx-prepay-10001"


@pytest.mark.asyncio
async def test_create_order_returns_payment_params_when_json_string_payload(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def _fake_run_in_threadpool(func, **kwargs):  # noqa: ANN001, ANN202
        return func(**kwargs)

    monkeypatch.setattr(
        "mz_ai_backend.shared.wechat_pay.run_in_threadpool",
        _fake_run_in_threadpool,
    )

    gateway = _build_gateway((200, '{"prepay_id":"wx-prepay-20002"}'))

    def _stub_build_payment_params(self, *, prepay_id: str) -> WechatPayPaymentParams:
        assert prepay_id == "wx-prepay-20002"
        return WechatPayPaymentParams(
            time_stamp="12345",
            nonce_str="nonce",
            package=f"prepay_id={prepay_id}",
            sign_type="RSA",
            pay_sign="sign",
        )

    monkeypatch.setattr(
        WechatPayV3Gateway,
        "_build_payment_params",
        _stub_build_payment_params,
    )

    result = await gateway.create_order(_build_request())
    assert result.prepay_id == "wx-prepay-20002"
    assert result.payment_params.package == "prepay_id=wx-prepay-20002"
