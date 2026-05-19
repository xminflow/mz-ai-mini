from __future__ import annotations

from datetime import UTC, datetime

from ..ports import AgentAccountRepository, TokenService
from ...domain import (
    AgentAccessTokenExpiredException,
    AgentAccountDisabledException,
    AgentAccountStatus,
)


async def resolve_current_account_id(
    *,
    account_repository: AgentAccountRepository,
    token_service: TokenService,
    access_token: str,
) -> int:
    """以 access_token 反查当前账号 id；与 GetCurrentAgentAccountUseCase 同一套校验逻辑。"""
    token_record = await account_repository.get_access_token_record(
        token_service.hash_token(access_token)
    )
    if token_record is None:
        raise AgentAccessTokenExpiredException()
    now = datetime.now(UTC).replace(tzinfo=None)
    if token_record.expires_at <= now:
        raise AgentAccessTokenExpiredException()

    session = await account_repository.get_session_by_id(token_record.session_id)
    if session is None or session.revoked_at is not None:
        raise AgentAccessTokenExpiredException()

    account = await account_repository.get_account_by_id(session.account_id)
    if account is None or account.status != AgentAccountStatus.ACTIVE:
        raise AgentAccountDisabledException()
    return account.account_id
