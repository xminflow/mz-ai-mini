from __future__ import annotations

import hashlib
import json
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import UTC, datetime

from ..application.ports import (
    OfficialWechatEvent,
    OfficialWechatQrTicket,
    OfficialWechatUserProfile,
)
from ..domain import AgentWechatCallbackInvalidException, AgentWechatConfigMissingException


class WechatOfficialAccountGateway:
    """Stdlib-based gateway for WeChat official account login operations."""

    _ACCESS_TOKEN_URL = (
        "https://api.weixin.qq.com/cgi-bin/token"
        "?grant_type=client_credential&appid={appid}&secret={secret}"
    )
    _CREATE_QR_URL = "https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token={access_token}"
    _SHOW_QR_URL = "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket={ticket}"
    _USER_INFO_URL = (
        "https://api.weixin.qq.com/cgi-bin/user/info"
        "?access_token={access_token}&openid={openid}&lang=zh_CN"
    )

    def __init__(self, *, appid: str, app_secret: str, token: str) -> None:
        if not appid or not app_secret or not token:
            raise AgentWechatConfigMissingException()
        self._appid = appid
        self._app_secret = app_secret
        self._token = token

    def verify_callback_signature(
        self,
        *,
        signature: str | None,
        timestamp: str | None,
        nonce: str | None,
    ) -> bool:
        if signature is None or timestamp is None or nonce is None:
            return False
        parts = sorted([self._token, timestamp, nonce])
        digest = hashlib.sha1("".join(parts).encode("utf-8")).hexdigest()
        return digest == signature

    def parse_callback_event(self, xml_body: str) -> OfficialWechatEvent:
        try:
            root = ET.fromstring(xml_body)
        except ET.ParseError as exc:
            raise AgentWechatCallbackInvalidException(message="WeChat callback XML is invalid.") from exc

        values = {child.tag: (child.text or "").strip() for child in root}
        event_type = values.get("Event")
        openid = values.get("FromUserName")
        event_time_raw = values.get("CreateTime")
        if not event_type or not openid or not event_time_raw.isdigit():
            raise AgentWechatCallbackInvalidException(message="WeChat callback payload is incomplete.")
        event_time = datetime.fromtimestamp(int(event_time_raw), UTC).replace(tzinfo=None)
        return OfficialWechatEvent(
            event_type=event_type,
            official_openid=openid,
            event_key=values.get("EventKey") or None,
            ticket=values.get("Ticket") or None,
            event_time=event_time,
        )

    async def create_temporary_qr_ticket(
        self,
        *,
        scene_key: str,
        expire_seconds: int,
    ) -> OfficialWechatQrTicket:
        access_token = await self._get_access_token()
        payload = {
            "expire_seconds": expire_seconds,
            "action_name": "QR_STR_SCENE",
            "action_info": {"scene": {"scene_str": scene_key}},
        }
        data = await self._post_json(
            self._CREATE_QR_URL.format(access_token=urllib.parse.quote(access_token)),
            payload,
        )
        ticket = _require_string(data, "ticket")
        expires_in = _require_int(data, "expire_seconds")
        return OfficialWechatQrTicket(
            ticket=ticket,
            expires_in_seconds=expires_in,
            qr_code_url=self._SHOW_QR_URL.format(ticket=urllib.parse.quote(ticket)),
        )

    async def get_user_profile(
        self,
        *,
        official_openid: str,
    ) -> OfficialWechatUserProfile:
        access_token = await self._get_access_token()
        url = self._USER_INFO_URL.format(
            access_token=urllib.parse.quote(access_token),
            openid=urllib.parse.quote(official_openid),
        )
        data = await self._get_json(url)
        subscribe = int(data.get("subscribe", 0))
        return OfficialWechatUserProfile(
            official_openid=official_openid,
            subscribed=subscribe == 1,
        )

    async def _get_access_token(self) -> str:
        data = await self._get_json(
            self._ACCESS_TOKEN_URL.format(
                appid=urllib.parse.quote(self._appid),
                secret=urllib.parse.quote(self._app_secret),
            )
        )
        return _require_string(data, "access_token")

    async def _get_json(self, url: str) -> dict[str, object]:
        request = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(request, timeout=15) as response:
            payload = json.loads(response.read().decode("utf-8"))
        return _validate_wechat_response(payload)

    async def _post_json(self, url: str, payload: dict[str, object]) -> dict[str, object]:
        request = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=15) as response:
            body = json.loads(response.read().decode("utf-8"))
        return _validate_wechat_response(body)


def _validate_wechat_response(payload: object) -> dict[str, object]:
    if not isinstance(payload, dict):
        raise AgentWechatCallbackInvalidException(message="WeChat response payload must be an object.")
    errcode = payload.get("errcode")
    if isinstance(errcode, int) and errcode != 0:
        errmsg = payload.get("errmsg")
        raise AgentWechatCallbackInvalidException(
            message=f"WeChat API request failed: {errmsg if isinstance(errmsg, str) else errcode}."
        )
    return payload


def _require_string(payload: dict[str, object], key: str) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or value.strip() == "":
        raise AgentWechatCallbackInvalidException(message=f"WeChat response field {key} is invalid.")
    return value


def _require_int(payload: dict[str, object], key: str) -> int:
    value = payload.get(key)
    if not isinstance(value, int):
        raise AgentWechatCallbackInvalidException(message=f"WeChat response field {key} is invalid.")
    return value
