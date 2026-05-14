from __future__ import annotations

from email.message import EmailMessage

import pytest

from mz_ai_backend.modules.agent_auth.infrastructure.email_delivery import (
    SmtpEmailLoginDeliveryGateway,
)


def test_email_login_gateway_builds_chinese_html_message(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: dict[str, EmailMessage] = {}

    async def fake_to_thread(func, message):
        captured["message"] = message
        return None

    monkeypatch.setattr(
        "mz_ai_backend.modules.agent_auth.infrastructure.email_delivery.asyncio.to_thread",
        fake_to_thread,
    )

    gateway = SmtpEmailLoginDeliveryGateway(
        host="smtp.example.com",
        port=465,
        username="no-reply@example.com",
        password="secret",
        use_ssl=True,
        from_address="no-reply@example.com",
        from_name="微域生光",
    )

    import asyncio

    asyncio.run(gateway.send_login_code(email="xminflow@gmail.com", verification_code="123456"))

    message = captured["message"]
    assert message["Subject"] == "微域生光 登录验证码"
    assert message["To"] == "xminflow@gmail.com"
    assert message.is_multipart() is True
    payload = message.get_payload()
    assert len(payload) == 2
    assert "验证码：123456" in payload[0].get_content()
    assert "微域生光" in payload[1].get_content()
    assert "有效期10分钟，请勿泄露于他人。" in payload[1].get_content()
