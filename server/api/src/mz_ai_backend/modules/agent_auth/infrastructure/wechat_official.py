from __future__ import annotations

import base64
import hashlib
import json
import os
import secrets
import struct
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import UTC, datetime

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

from ..application.ports import (
    OfficialWechatInboundMessage,
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
    # 微信消息体 PKCS7 填充块大小固定为 32（见公众平台消息加解密规范）
    _AES_BLOCK_SIZE = 32
    _USER_INFO_URL = (
        "https://api.weixin.qq.com/cgi-bin/user/info"
        "?access_token={access_token}&openid={openid}&lang=zh_CN"
    )

    def __init__(
        self,
        *,
        appid: str,
        app_secret: str,
        token: str,
        encoding_aes_key: str | None = None,
    ) -> None:
        if not appid or not app_secret or not token:
            raise AgentWechatConfigMissingException()
        self._appid = appid
        self._app_secret = app_secret
        self._token = token
        # 43 字符的 base64 原始密钥（微信平台生成），解码后 32 字节用于 AES-256-CBC
        self._aes_key: bytes | None = (
            base64.b64decode(encoding_aes_key + "=") if encoding_aes_key else None
        )

    def verify_callback_signature(
        self,
        *,
        signature: str | None,
        timestamp: str | None,
        nonce: str | None,
    ) -> bool:
        """验证明文模式回调签名：SHA1(sort([token, timestamp, nonce]))"""
        if signature is None or timestamp is None or nonce is None:
            return False
        parts = sorted([self._token, timestamp, nonce])
        digest = hashlib.sha1("".join(parts).encode("utf-8")).hexdigest()
        return digest == signature

    def verify_msg_signature(
        self,
        *,
        msg_signature: str | None,
        timestamp: str | None,
        nonce: str | None,
        xml_body: str,
    ) -> bool:
        """验证安全模式回调签名：SHA1(sort([token, timestamp, nonce, encrypted_content]))"""
        if msg_signature is None or timestamp is None or nonce is None:
            return False
        encrypted = _extract_encrypt_content(xml_body)
        if encrypted is None:
            return False
        parts = sorted([self._token, timestamp, nonce, encrypted])
        digest = hashlib.sha1("".join(parts).encode("utf-8")).hexdigest()
        return digest == msg_signature

    def parse_inbound_message(self, xml_body: str) -> OfficialWechatInboundMessage:
        """解析入站回调消息，自动识别安全模式（含 <Encrypt> 节点则解密后再解析）。

        兼容事件消息（MsgType=event，带 Event）与普通消息（MsgType=text/image/... 无 Event），
        只要求 MsgType / FromUserName / CreateTime 三个所有消息都有的公共字段。
        """
        try:
            root = ET.fromstring(xml_body)
        except ET.ParseError as exc:
            raise AgentWechatCallbackInvalidException(message="WeChat callback XML is invalid.") from exc

        encrypted_node = root.find("Encrypt")
        if encrypted_node is not None and encrypted_node.text:
            # 安全模式：解密后重新解析内层 XML
            decrypted = self._decrypt_message(encrypted_node.text.strip())
            try:
                root = ET.fromstring(decrypted)
            except ET.ParseError as exc:
                raise AgentWechatCallbackInvalidException(
                    message="WeChat decrypted callback XML is invalid."
                ) from exc

        values = {child.tag: (child.text or "").strip() for child in root}
        msg_type = values.get("MsgType")
        openid = values.get("FromUserName")
        to_user_name = values.get("ToUserName")
        create_time_raw = values.get("CreateTime")
        if (
            not msg_type
            or not openid
            or not to_user_name
            or not create_time_raw
            or not create_time_raw.isdigit()
        ):
            raise AgentWechatCallbackInvalidException(message="WeChat callback payload is incomplete.")
        message_time = datetime.fromtimestamp(int(create_time_raw), UTC).replace(tzinfo=None)
        return OfficialWechatInboundMessage(
            msg_type=msg_type,
            official_openid=openid,
            to_user_name=to_user_name,
            event_type=values.get("Event") or None,
            event_key=values.get("EventKey") or None,
            ticket=values.get("Ticket") or None,
            content=values.get("Content") or None,
            message_time=message_time,
        )

    def build_subscribe_news_reply(
        self,
        *,
        to_user_openid: str,
        from_user_name: str,
        title: str,
        description: str,
        pic_url: str,
        url: str,
    ) -> str:
        """构造单图文被动回复 XML；安全模式下加密包裹，明文模式直接返回明文。"""
        create_time = int(time.time())
        plaintext = _render_news_xml(
            to_user=to_user_openid,
            from_user=from_user_name,
            create_time=create_time,
            title=title,
            description=description,
            pic_url=pic_url,
            url=url,
        )
        if self._aes_key is None:
            return plaintext
        return self._encrypt_reply(plaintext, timestamp=str(create_time), nonce=secrets.token_hex(8))

    def _encrypt_reply(self, plaintext: str, *, timestamp: str, nonce: str) -> str:
        """AES-256-CBC 加密被动回复消息体，并生成 msg_signature 外层包裹（安全模式）。

        明文结构与解密侧对齐：random(16) + 4字节大端长度 + 消息体 + appid，PKCS7(块=32) 填充。
        """
        if self._aes_key is None:
            raise AgentWechatCallbackInvalidException(
                message="WeChat encoding AES key is not configured."
            )
        key = self._aes_key
        iv = key[:16]
        msg = plaintext.encode("utf-8")
        raw = os.urandom(16) + struct.pack(">I", len(msg)) + msg + self._appid.encode("utf-8")
        pad_len = self._AES_BLOCK_SIZE - (len(raw) % self._AES_BLOCK_SIZE)
        pad_len = pad_len or self._AES_BLOCK_SIZE
        raw += bytes([pad_len]) * pad_len
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
        encryptor = cipher.encryptor()
        encrypt = base64.b64encode(encryptor.update(raw) + encryptor.finalize()).decode("utf-8")
        parts = sorted([self._token, timestamp, nonce, encrypt])
        signature = hashlib.sha1("".join(parts).encode("utf-8")).hexdigest()
        return (
            "<xml>"
            f"<Encrypt><![CDATA[{encrypt}]]></Encrypt>"
            f"<MsgSignature><![CDATA[{signature}]]></MsgSignature>"
            f"<TimeStamp>{timestamp}</TimeStamp>"
            f"<Nonce><![CDATA[{nonce}]]></Nonce>"
            "</xml>"
        )

    def _decrypt_message(self, encrypted: str) -> str:
        """AES-256-CBC 解密微信安全模式消息体"""
        if self._aes_key is None:
            raise AgentWechatCallbackInvalidException(
                message="WeChat encoding AES key is not configured."
            )
        key = self._aes_key
        iv = key[:16]
        try:
            ciphertext = base64.b64decode(encrypted)
            cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
            decryptor = cipher.decryptor()
            raw = decryptor.update(ciphertext) + decryptor.finalize()
            # 去除 PKCS7 填充
            pad = raw[-1]
            raw = raw[:-pad]
            # 跳过 16 字节随机前缀，读取 4 字节大端消息长度
            (msg_len,) = struct.unpack(">I", raw[16:20])
            return raw[20 : 20 + msg_len].decode("utf-8")
        except Exception as exc:
            raise AgentWechatCallbackInvalidException(
                message="WeChat message decryption failed."
            ) from exc

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


def _render_news_xml(
    *,
    to_user: str,
    from_user: str,
    create_time: int,
    title: str,
    description: str,
    pic_url: str,
    url: str,
) -> str:
    """渲染单图文被动回复明文 XML（CDATA 包裹文本字段，避免特殊字符破坏 XML）。"""
    return (
        "<xml>"
        f"<ToUserName><![CDATA[{to_user}]]></ToUserName>"
        f"<FromUserName><![CDATA[{from_user}]]></FromUserName>"
        f"<CreateTime>{create_time}</CreateTime>"
        "<MsgType><![CDATA[news]]></MsgType>"
        "<ArticleCount>1</ArticleCount>"
        "<Articles><item>"
        f"<Title><![CDATA[{title}]]></Title>"
        f"<Description><![CDATA[{description}]]></Description>"
        f"<PicUrl><![CDATA[{pic_url}]]></PicUrl>"
        f"<Url><![CDATA[{url}]]></Url>"
        "</item></Articles>"
        "</xml>"
    )


def _extract_encrypt_content(xml_body: str) -> str | None:
    """从外层 XML 提取 <Encrypt> 节点文本，用于 msg_signature 验证"""
    try:
        root = ET.fromstring(xml_body)
        node = root.find("Encrypt")
        if node is not None and node.text:
            return node.text.strip()
    except ET.ParseError:
        pass
    return None


def _validate_wechat_response(payload: object) -> dict[str, object]:
    if not isinstance(payload, dict):
        raise AgentWechatCallbackInvalidException(message="WeChat response payload must be an object.")
    errcode = payload.get("errcode")
    if isinstance(errcode, int) and errcode != 0:
        errmsg = payload.get("errmsg")
        raise AgentWechatCallbackInvalidException(
            message=f"WeChat API request failed: errcode={errcode}, errmsg={errmsg}."
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
