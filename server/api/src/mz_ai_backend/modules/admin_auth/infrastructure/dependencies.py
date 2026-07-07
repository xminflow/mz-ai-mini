from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated

from fastapi import Depends, Header

from mz_ai_backend.core.config import Settings
from mz_ai_backend.core.dependencies import get_settings_dependency
from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import UnauthorizedException

from ..application import AdminIdentity, AdminLoginUseCase
from .services import ConfigAdminCredentialVerifier, HmacAdminTokenService


def get_admin_token_service(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> HmacAdminTokenService:
    return HmacAdminTokenService(secret=settings.admin_token_secret)


def get_admin_login_use_case(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
    token_service: Annotated[HmacAdminTokenService, Depends(get_admin_token_service)],
) -> AdminLoginUseCase:
    verifier = ConfigAdminCredentialVerifier(
        username=settings.admin_username,
        password=settings.admin_password,
    )
    return AdminLoginUseCase(
        credential_verifier=verifier,
        token_service=token_service,
        token_ttl_minutes=settings.admin_token_ttl_minutes,
    )


def require_admin(
    token_service: Annotated[HmacAdminTokenService, Depends(get_admin_token_service)],
    authorization: Annotated[str | None, Header(alias="Authorization")] = None,
) -> AdminIdentity:
    """解析 Bearer 令牌并校验；缺失/非法/过期一律 401。"""

    prefix = "Bearer "
    if authorization is None or not authorization.startswith(prefix):
        raise UnauthorizedException(
            error_code=ErrorCode.ADMIN_UNAUTHORIZED, message="Missing admin token."
        )
    token = authorization[len(prefix):].strip()
    if token == "":
        raise UnauthorizedException(
            error_code=ErrorCode.ADMIN_UNAUTHORIZED, message="Missing admin token."
        )
    return token_service.verify(token=token, now=datetime.now(UTC))
