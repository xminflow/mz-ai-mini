from __future__ import annotations

import base64
import hmac
import json
from datetime import datetime, timedelta
from hashlib import sha256

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import InternalServerException, UnauthorizedException

from ..application.dtos import AdminIdentity, AdminTokenResult


class ConfigAdminCredentialVerifier:
    """基于配置单账号的凭据校验，使用 compare_digest 防时序侧信道。"""

    def __init__(self, *, username: str | None, password: str | None) -> None:
        if not username or not password:
            raise InternalServerException(message="Admin credentials are not configured.")
        self._username = username
        self._password = password

    def verify(self, *, username: str, password: str) -> bool:
        user_ok = hmac.compare_digest(self._username, username)
        pass_ok = hmac.compare_digest(self._password, password)
        return user_ok and pass_ok


class HmacAdminTokenService:
    """无状态令牌：payload=base64url(json{sub,exp})，signature=HMAC-SHA256(secret,payload)。"""

    def __init__(self, *, secret: str | None) -> None:
        if not secret or secret.strip() == "":
            raise InternalServerException(message="Admin token secret is not configured.")
        self._secret = secret.encode("utf-8")

    def _sign(self, payload_b64: bytes) -> str:
        return hmac.new(self._secret, payload_b64, sha256).hexdigest()

    def issue(self, *, username: str, now: datetime, ttl_minutes: int) -> AdminTokenResult:
        expires_at = now + timedelta(minutes=ttl_minutes)
        payload = {"sub": username, "exp": int(expires_at.timestamp())}
        payload_b64 = base64.urlsafe_b64encode(
            json.dumps(payload, separators=(",", ":")).encode("utf-8")
        )
        token = f"{payload_b64.decode('ascii')}.{self._sign(payload_b64)}"
        return AdminTokenResult(token=token, expires_at=expires_at)

    def verify(self, *, token: str, now: datetime) -> AdminIdentity:
        if not token.isascii():
            raise self._unauthorized("Invalid admin token.")
        parts = token.split(".", 1)
        if len(parts) != 2:
            raise self._unauthorized("Invalid admin token.")
        payload_b64 = parts[0].encode("utf-8")
        if not hmac.compare_digest(self._sign(payload_b64), parts[1]):
            raise self._unauthorized("Invalid admin token.")
        try:
            payload = json.loads(base64.urlsafe_b64decode(payload_b64))
            exp = int(payload["exp"])
            username = str(payload["sub"])
        except (ValueError, KeyError, TypeError):
            raise self._unauthorized("Invalid admin token.")
        if exp <= int(now.timestamp()):
            raise self._unauthorized("Admin token expired.")
        return AdminIdentity(username=username)

    @staticmethod
    def _unauthorized(message: str) -> UnauthorizedException:
        return UnauthorizedException(
            error_code=ErrorCode.ADMIN_UNAUTHORIZED,
            message=message,
        )
