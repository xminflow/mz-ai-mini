from __future__ import annotations

import base64
import hashlib
import xml.etree.ElementTree as ET

from mz_ai_backend.modules.agent_auth.infrastructure.wechat_official import (
    WechatOfficialAccountGateway,
)

# 由 32 字节构造一个合法的 43 字符 EncodingAESKey（去掉 base64 末尾 '='，网关内部会补回）
_ENCODING_AES_KEY = base64.b64encode(bytes(range(32))).decode()[:-1]
_TOKEN = "unit-test-token"
_APPID = "wxunittest"


def _gateway(*, encoding_aes_key: str | None) -> WechatOfficialAccountGateway:
    return WechatOfficialAccountGateway(
        appid=_APPID,
        app_secret="unit-secret",
        token=_TOKEN,
        encoding_aes_key=encoding_aes_key,
    )


def test_news_reply_plaintext_mode_contains_fields() -> None:
    """明文模式：直接返回可读的单图文 XML。"""
    gateway = _gateway(encoding_aes_key=None)
    xml = gateway.build_subscribe_news_reply(
        to_user_openid="user-openid",
        from_user_name="gh_official",
        title="加入微域生光",
        description="可以联系下方客服人员进入社群",
        pic_url="http://example.com/qr.jpg",
        url="http://example.com/qr.jpg",
    )
    assert "<MsgType><![CDATA[news]]></MsgType>" in xml
    assert "<ToUserName><![CDATA[user-openid]]></ToUserName>" in xml
    assert "<FromUserName><![CDATA[gh_official]]></FromUserName>" in xml
    assert "加入微域生光" in xml


def test_news_reply_secure_mode_roundtrips_and_signs() -> None:
    """安全模式：加密包裹可被同一网关解密还原，且 msg_signature 校验通过。"""
    gateway = _gateway(encoding_aes_key=_ENCODING_AES_KEY)
    envelope = gateway.build_subscribe_news_reply(
        to_user_openid="user-openid",
        from_user_name="gh_official",
        title="加入微域生光",
        description="可以联系下方客服人员进入社群",
        pic_url="http://example.com/qr.jpg",
        url="http://example.com/qr.jpg",
    )

    root = ET.fromstring(envelope)
    encrypt = root.findtext("Encrypt")
    msg_signature = root.findtext("MsgSignature")
    timestamp = root.findtext("TimeStamp")
    nonce = root.findtext("Nonce")
    assert encrypt and msg_signature and timestamp and nonce

    # 1) 解密还原内层图文 XML
    decrypted = gateway._decrypt_message(encrypt)  # noqa: SLF001 测试复用解密验证加密对称性
    assert "<MsgType><![CDATA[news]]></MsgType>" in decrypted
    assert "user-openid" in decrypted
    assert "gh_official" in decrypted
    assert "加入微域生光" in decrypted

    # 2) 复算签名一致
    expected = hashlib.sha1("".join(sorted([_TOKEN, timestamp, nonce, encrypt])).encode("utf-8")).hexdigest()
    assert msg_signature == expected
