from __future__ import annotations

from mz_ai_backend.modules.agent_auth.application.dtos import (
    build_access_token_expiry,
    build_refresh_token_expiry,
)

from ..dtos import (
    CampAccountSummary,
    CampAuthenticationResult,
    CampSessionIssue,
    CampTokenPair,
)


async def issue_camp_auth_tokens(
    *,
    account_repository,
    token_service,
    snowflake_id_generator,
    account,
    access_token_ttl_seconds: int,
    refresh_token_ttl_days: int,
) -> CampAuthenticationResult:
    """Issue one standard camp token pair for the provided account."""

    access_token = token_service.generate_token()
    refresh_token = token_service.generate_token()
    access_token_expires_at = build_access_token_expiry(
        ttl_seconds=access_token_ttl_seconds
    )
    refresh_token_expires_at = build_refresh_token_expiry(
        ttl_days=refresh_token_ttl_days
    )
    await account_repository.create_session(
        CampSessionIssue(
            session_id=snowflake_id_generator.generate(),
            account_id=account.account_id,
            refresh_token_hash=token_service.hash_token(refresh_token),
            refresh_token_expires_at=refresh_token_expires_at,
            access_token_id=snowflake_id_generator.generate(),
            access_token_hash=token_service.hash_token(access_token),
            access_token_expires_at=access_token_expires_at,
        )
    )
    return CampAuthenticationResult(
        account=CampAccountSummary(
            account_id=account.account_id,
            username=account.username,
            email=account.email,
            status=account.status,
            created_at=account.created_at,
        ),
        tokens=CampTokenPair(
            access_token=access_token,
            access_token_expires_at=access_token_expires_at,
            refresh_token=refresh_token,
            refresh_token_expires_at=refresh_token_expires_at,
        ),
    )
