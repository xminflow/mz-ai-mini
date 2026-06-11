from __future__ import annotations

from datetime import UTC, datetime

from ..dtos import CampAccountSummary, GetCurrentCampAccountQuery
from ..ports import CampAccountRepository, TokenService
from ...domain import (
    CampAccessTokenExpiredException,
    CampAccountDisabledException,
    CampAccountStatus,
)


class GetCurrentCampAccountUseCase:
    """Resolve the current account from an access token."""

    def __init__(
        self,
        *,
        account_repository: CampAccountRepository,
        token_service: TokenService,
    ) -> None:
        self._account_repository = account_repository
        self._token_service = token_service

    async def execute(self, query: GetCurrentCampAccountQuery) -> CampAccountSummary:
        token_record = await self._account_repository.get_access_token_record(
            self._token_service.hash_token(query.access_token)
        )
        if token_record is None:
            raise CampAccessTokenExpiredException()
        now = datetime.now(UTC).replace(tzinfo=None)
        if token_record.expires_at <= now:
            raise CampAccessTokenExpiredException()

        session = await self._account_repository.get_session_by_id(token_record.session_id)
        if session is None or session.revoked_at is not None:
            raise CampAccessTokenExpiredException()

        account = await self._account_repository.get_account_by_id(session.account_id)
        if account is None or account.status != CampAccountStatus.ACTIVE:
            raise CampAccountDisabledException()
        return CampAccountSummary(
            account_id=account.account_id,
            username=account.username,
            email=account.email,
            status=account.status,
            created_at=account.created_at,
        )
