from __future__ import annotations

from datetime import UTC, datetime

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import UnauthorizedException

from ..dtos import AdminLoginCommand, AdminTokenResult
from ..ports import AdminCredentialVerifier, AdminTokenService


class AdminLoginUseCase:
    """校验配置凭据并签发无状态管理端令牌。"""

    def __init__(
        self,
        *,
        credential_verifier: AdminCredentialVerifier,
        token_service: AdminTokenService,
        token_ttl_minutes: int,
    ) -> None:
        self._credential_verifier = credential_verifier
        self._token_service = token_service
        self._token_ttl_minutes = token_ttl_minutes

    async def execute(self, command: AdminLoginCommand) -> AdminTokenResult:
        if not self._credential_verifier.verify(
            username=command.username, password=command.password
        ):
            raise UnauthorizedException(
                error_code=ErrorCode.ADMIN_INVALID_CREDENTIALS,
                message="Invalid admin username or password.",
            )
        return self._token_service.issue(
            username=command.username,
            now=datetime.now(UTC),
            ttl_minutes=self._token_ttl_minutes,
        )
