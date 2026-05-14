from __future__ import annotations

from ..dtos import (
    AgentAccountSummary,
    AgentAuthenticationResult,
    AgentSessionIssue,
    AgentTokenPair,
    build_access_token_expiry,
    build_refresh_token_expiry,
)


async def issue_agent_auth_tokens(
    *,
    account_repository,
    token_service,
    snowflake_id_generator,
    account,
    access_token_ttl_seconds: int,
    refresh_token_ttl_days: int,
) -> AgentAuthenticationResult:
    """Issue one standard ua-agent token pair for the provided account."""

    access_token = token_service.generate_token()
    refresh_token = token_service.generate_token()
    access_token_expires_at = build_access_token_expiry(
        ttl_seconds=access_token_ttl_seconds
    )
    refresh_token_expires_at = build_refresh_token_expiry(
        ttl_days=refresh_token_ttl_days
    )
    await account_repository.create_session(
        AgentSessionIssue(
            session_id=snowflake_id_generator.generate(),
            account_id=account.account_id,
            refresh_token_hash=token_service.hash_token(refresh_token),
            refresh_token_expires_at=refresh_token_expires_at,
            access_token_id=snowflake_id_generator.generate(),
            access_token_hash=token_service.hash_token(access_token),
            access_token_expires_at=access_token_expires_at,
        )
    )
    return AgentAuthenticationResult(
        account=AgentAccountSummary(
            account_id=account.account_id,
            username=account.username,
            email=account.email,
            status=account.status,
            created_at=account.created_at,
        ),
        tokens=AgentTokenPair(
            access_token=access_token,
            access_token_expires_at=access_token_expires_at,
            refresh_token=refresh_token,
            refresh_token_expires_at=refresh_token_expires_at,
        ),
    )
