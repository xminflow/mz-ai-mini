"""Shared WeChat Pay gateway, DTOs, and exceptions.

Usage:
- Import WechatPayV3Gateway for WeChat Pay APIv3 integration.
- Import payment DTOs for order creation and callback parsing.
- Import payment exceptions for error handling.

Development rules:
- All types here are generic WeChat Pay contracts, not module-specific.
- Do not place business logic here; keep it in module use cases.
"""

from __future__ import annotations

import json
import time
import uuid
from datetime import datetime
from http import HTTPStatus
from typing import Any

from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, ConfigDict

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import BusinessException, SystemException


# ---------------------------------------------------------------------------
# DTOs
# ---------------------------------------------------------------------------


class WechatPayPaymentParams(BaseModel):
    """Mini program payment fields used by wx.requestPayment."""

    model_config = ConfigDict(frozen=True)

    time_stamp: str
    nonce_str: str
    package: str
    sign_type: str
    pay_sign: str


class WechatPayCreateOrderRequest(BaseModel):
    """Outbound payload for creating a WeChat Pay JSAPI order."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    amount_fen: int
    description: str
    payer_openid: str


class WechatPayCreateOrderResult(BaseModel):
    """Outbound result returned by WeChat Pay gateway."""

    model_config = ConfigDict(frozen=True)

    prepay_id: str
    payment_params: WechatPayPaymentParams


class WechatPayNotification(BaseModel):
    """Verified and decrypted WeChat Pay callback content."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    transaction_id: str | None
    trade_state: str
    amount_fen: int
    payer_openid: str | None
    success_time: datetime | None
    raw_payload: str


# ---------------------------------------------------------------------------
# Exceptions
# ---------------------------------------------------------------------------


class WechatPayNotifyInvalidException(BusinessException):
    """Raised when WeChat Pay callback payload cannot be verified."""

    def __init__(self, *, message: str = "WeChat Pay callback is invalid.") -> None:
        super().__init__(
            error_code=ErrorCode.PAYMENT_WECHAT_NOTIFY_INVALID,
            message=message,
            http_status=HTTPStatus.BAD_REQUEST,
        )


class WechatPayNotifyMismatchException(BusinessException):
    """Raised when callback order data mismatches persisted order data."""

    def __init__(
        self, *, message: str = "WeChat Pay callback does not match order."
    ) -> None:
        super().__init__(
            error_code=ErrorCode.PAYMENT_WECHAT_NOTIFY_MISMATCH,
            message=message,
            http_status=HTTPStatus.CONFLICT,
        )


class WechatPayOrderCreateFailedException(SystemException):
    """Raised when creating WeChat Pay order fails."""

    def __init__(self, *, message: str = "Failed to create WeChat Pay order.") -> None:
        super().__init__(
            error_code=ErrorCode.PAYMENT_WECHAT_ORDER_CREATE_FAILED,
            message=message,
            http_status=HTTPStatus.BAD_GATEWAY,
        )


class WechatPayConfigMissingException(SystemException):
    """Raised when WeChat Pay runtime configuration is missing."""

    def __init__(
        self,
        *,
        message: str = "WeChat Pay configuration is missing.",
    ) -> None:
        super().__init__(
            error_code=ErrorCode.PAYMENT_WECHAT_CONFIG_MISSING,
            message=message,
            http_status=HTTPStatus.INTERNAL_SERVER_ERROR,
        )


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _parse_iso_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    normalized = value.strip()
    if normalized == "":
        return None
    if normalized.endswith("Z"):
        normalized = normalized.replace("Z", "+00:00")
    parsed = datetime.fromisoformat(normalized)
    if parsed.tzinfo is not None:
        return parsed.replace(tzinfo=None)
    return parsed


def _safe_payload_preview(payload: Any) -> str:
    if isinstance(payload, dict):
        return json.dumps(payload, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    return str(payload)


def _normalize_wechat_payload(payload: Any) -> Any:
    if not isinstance(payload, str):
        return payload
    normalized = payload.strip()
    if normalized == "":
        return payload
    try:
        return json.loads(normalized)
    except json.JSONDecodeError:
        return payload


def _extract_wechat_error(payload: Any) -> tuple[str | None, str | None]:
    if not isinstance(payload, dict):
        return None, None
    code = payload.get("code")
    message = payload.get("message")
    normalized_code = code.strip() if isinstance(code, str) and code.strip() else None
    normalized_message = (
        message.strip() if isinstance(message, str) and message.strip() else None
    )
    return normalized_code, normalized_message


# ---------------------------------------------------------------------------
# Gateway
# ---------------------------------------------------------------------------


class WechatPayV3Gateway:
    """WeChat Pay APIv3 gateway powered by the wechatpayv3 package."""

    def __init__(
        self,
        *,
        mchid: str,
        appid: str,
        private_key: str,
        cert_serial_no: str,
        apiv3_key: str,
        notify_url: str,
        cert_dir: str | None,
        public_key: str | None,
        public_key_id: str | None,
    ) -> None:
        from wechatpayv3 import WeChatPay, WeChatPayType

        self._appid = appid
        self._wxpay = WeChatPay(
            wechatpay_type=WeChatPayType.MINIPROG,
            mchid=mchid,
            private_key=private_key,
            cert_serial_no=cert_serial_no,
            apiv3_key=apiv3_key,
            appid=appid,
            notify_url=notify_url,
            cert_dir=cert_dir,
            partner_mode=False,
            public_key=public_key,
            public_key_id=public_key_id,
        )

    async def create_order(
        self,
        request: WechatPayCreateOrderRequest,
    ) -> WechatPayCreateOrderResult:
        params = {
            "out_trade_no": request.order_no,
            "description": request.description,
            "amount": {"total": request.amount_fen},
            "payer": {"openid": request.payer_openid},
        }
        try:
            status_code, payload = await run_in_threadpool(self._wxpay.pay, **params)
        except Exception as exc:  # noqa: BLE001
            raise WechatPayOrderCreateFailedException(
                message=f"Calling WeChat Pay create order failed: {exc!s}",
            ) from exc

        parsed_payload = _normalize_wechat_payload(payload)

        payload_code, payload_message = _extract_wechat_error(parsed_payload)
        if payload_code is not None:
            details = payload_code
            if payload_message:
                details = f"{details}: {payload_message}"
            raise WechatPayOrderCreateFailedException(
                message=f"WeChat Pay create order failed: {details}",
            )

        if status_code != 200 or not isinstance(parsed_payload, dict):
            raise WechatPayOrderCreateFailedException(
                message=(
                    "Unexpected response from WeChat Pay create order: "
                    f"HTTP {status_code}, payload={_safe_payload_preview(parsed_payload)}"
                ),
            )

        prepay_id = parsed_payload.get("prepay_id")
        if not isinstance(prepay_id, str) or prepay_id.strip() == "":
            raise WechatPayOrderCreateFailedException(
                message=(
                    "WeChat Pay response does not contain prepay_id: "
                    f"{_safe_payload_preview(parsed_payload)}"
                ),
            )

        payment_params = self._build_payment_params(prepay_id=prepay_id.strip())
        return WechatPayCreateOrderResult(
            prepay_id=prepay_id.strip(),
            payment_params=payment_params,
        )

    def parse_notification(
        self,
        *,
        headers: dict[str, str],
        body: bytes,
    ) -> WechatPayNotification:
        try:
            payload = self._wxpay.callback(headers, body)
        except Exception as exc:  # noqa: BLE001
            raise WechatPayNotifyInvalidException() from exc

        if not isinstance(payload, dict):
            raise WechatPayNotifyInvalidException(
                message="WeChat Pay callback payload must be a JSON object.",
            )

        resource = payload.get("resource")
        if not isinstance(resource, dict):
            raise WechatPayNotifyInvalidException(
                message="WeChat Pay callback resource is missing.",
            )

        order_no = resource.get("out_trade_no")
        trade_state = resource.get("trade_state")
        amount = resource.get("amount")
        payer = resource.get("payer")
        transaction_id = resource.get("transaction_id")
        success_time = _parse_iso_datetime(resource.get("success_time"))

        if not isinstance(order_no, str) or order_no.strip() == "":
            raise WechatPayNotifyInvalidException(
                message="WeChat Pay callback order number is missing.",
            )
        if not isinstance(trade_state, str) or trade_state.strip() == "":
            raise WechatPayNotifyInvalidException(
                message="WeChat Pay callback trade state is missing.",
            )
        if not isinstance(amount, dict) or not isinstance(amount.get("total"), int):
            raise WechatPayNotifyInvalidException(
                message="WeChat Pay callback amount is invalid.",
            )

        payer_openid: str | None = None
        if isinstance(payer, dict) and isinstance(payer.get("openid"), str):
            payer_openid = payer["openid"].strip() or None

        return WechatPayNotification(
            order_no=order_no.strip(),
            transaction_id=transaction_id.strip()
            if isinstance(transaction_id, str) and transaction_id.strip()
            else None,
            trade_state=trade_state.strip(),
            amount_fen=amount["total"],
            payer_openid=payer_openid,
            success_time=success_time,
            raw_payload=json.dumps(
                payload,
                ensure_ascii=False,
                separators=(",", ":"),
                sort_keys=True,
            ),
        )

    def _build_payment_params(self, *, prepay_id: str) -> WechatPayPaymentParams:
        time_stamp = str(int(time.time()))
        nonce_str = uuid.uuid4().hex
        package = f"prepay_id={prepay_id}"
        sign_type = "RSA"
        pay_sign = self._wxpay.sign([self._appid, time_stamp, nonce_str, package])
        return WechatPayPaymentParams(
            time_stamp=time_stamp,
            nonce_str=nonce_str,
            package=package,
            sign_type=sign_type,
            pay_sign=pay_sign,
        )


__all__ = [
    "WechatPayConfigMissingException",
    "WechatPayCreateOrderRequest",
    "WechatPayCreateOrderResult",
    "WechatPayNotification",
    "WechatPayNotifyInvalidException",
    "WechatPayNotifyMismatchException",
    "WechatPayOrderCreateFailedException",
    "WechatPayPaymentParams",
    "WechatPayV3Gateway",
]
