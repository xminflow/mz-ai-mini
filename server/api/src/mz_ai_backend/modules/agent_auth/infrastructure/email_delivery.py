from __future__ import annotations

import asyncio
import smtplib
from email.message import EmailMessage

from ..domain import AgentEmailConfigMissingException, AgentEmailDeliveryFailedException


class SmtpEmailLoginDeliveryGateway:
    """SMTP gateway for ua-agent email login codes."""

    def __init__(
        self,
        *,
        host: str | None,
        port: int,
        username: str | None,
        password: str | None,
        use_ssl: bool,
        from_address: str | None,
        from_name: str | None,
    ) -> None:
        self._host = host.strip() if isinstance(host, str) else ""
        self._port = port
        self._username = username.strip() if isinstance(username, str) else ""
        self._password = password.strip() if isinstance(password, str) else ""
        self._use_ssl = use_ssl
        self._from_address = from_address.strip() if isinstance(from_address, str) else ""
        self._from_name = from_name.strip() if isinstance(from_name, str) else ""

    async def send_login_code(self, *, email: str, verification_code: str) -> None:
        if (
            self._host == ""
            or self._username == ""
            or self._password == ""
            or self._from_address == ""
        ):
            raise AgentEmailConfigMissingException()
        message = EmailMessage()
        message["Subject"] = "微域生光 登录验证码"
        message["From"] = (
            f"{self._from_name} <{self._from_address}>"
            if self._from_name != ""
            else self._from_address
        )
        message["To"] = email
        message.set_content(self._build_text_body(verification_code))
        message.add_alternative(
            self._build_html_body(verification_code),
            subtype="html",
        )

        try:
            await asyncio.to_thread(self._send_message, message)
        except AgentEmailConfigMissingException:
            raise
        except Exception as exc:
            raise AgentEmailDeliveryFailedException() from exc

    def _send_message(self, message: EmailMessage) -> None:
        if self._use_ssl:
            with smtplib.SMTP_SSL(self._host, self._port, timeout=15) as client:
                client.login(self._username, self._password)
                client.send_message(message)
            return
        with smtplib.SMTP(self._host, self._port, timeout=15) as client:
            client.starttls()
            client.login(self._username, self._password)
            client.send_message(message)

    def _build_text_body(self, verification_code: str) -> str:
        return (
            "微域生光 登录验证码\n\n"
            f"验证码：{verification_code}\n"
            "有效期10分钟，请勿泄露于他人。"
        )

    def _build_html_body(self, verification_code: str) -> str:
        return f"""\
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background:#ffffff;font-family:Arial,'PingFang SC','Microsoft YaHei',sans-serif;color:#111111;">
    <div style="max-width:680px;margin:0 auto;padding:40px 20px;">
      <div style="border:1px solid #e5e5e5;border-radius:24px;overflow:hidden;background:#ffffff;">
        <div style="padding:24px 32px;border-bottom:1px solid #ececec;">
          <div style="font-size:13px;font-weight:700;letter-spacing:.24em;color:#111111;">微域生光</div>
          <div style="margin-top:10px;font-size:28px;line-height:1.2;font-weight:700;color:#111111;">登录验证码</div>
          <div style="margin-top:10px;font-size:15px;line-height:1.9;color:#444444;">你正在登录微域生光账号，请使用下方验证码完成验证。</div>
        </div>
        <div style="padding:32px;">
          <div style="font-size:13px;font-weight:700;letter-spacing:.12em;color:#777777;text-transform:uppercase;">One-time code</div>
          <div style="margin-top:14px;font-size:15px;line-height:1.8;color:#444444;">验证码</div>
          <div style="margin:14px 0 22px;font-size:40px;font-weight:800;letter-spacing:.3em;color:#111111;background:#fafafa;border:1px solid #d9d9d9;border-radius:18px;padding:22px 24px;text-align:center;">{verification_code}</div>
          <div style="font-size:14px;line-height:1.9;color:#666666;">有效期10分钟，请勿泄露于他人。</div>
        </div>
      </div>
    </div>
  </body>
</html>
"""
