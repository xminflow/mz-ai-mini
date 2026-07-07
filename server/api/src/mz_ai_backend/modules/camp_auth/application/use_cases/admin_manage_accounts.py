from __future__ import annotations

from datetime import UTC, datetime

from mz_ai_backend.core.exceptions import NotFoundException, ValidationException

from ..admin_dtos import (
    CampAccountAdminFilter,
    CampAccountAdminPage,
    CampAccountAdminView,
    DeleteCampAccountCommand,
    GetCampAccountQuery,
    ListCampAccountsQuery,
    UpdateCampAccountMembershipCommand,
    UpdateCampAccountStatusCommand,
)
from ..ports.admin_repositories import CampAccountAdminRepository

ALLOWED_MEMBERSHIP_TIERS = ("none", "basic", "premium")


class ListCampAccountsUseCase:
    def __init__(self, *, repository: CampAccountAdminRepository) -> None:
        self._repository = repository

    async def execute(self, query: ListCampAccountsQuery) -> CampAccountAdminPage:
        filter_ = CampAccountAdminFilter(
            keyword=query.keyword,
            status=query.status,
            include_deleted=query.include_deleted,
        )
        offset = (query.page - 1) * query.page_size
        items = await self._repository.list_admin_accounts(
            filter_=filter_, offset=offset, limit=query.page_size
        )
        total = await self._repository.count_admin_accounts(filter_=filter_)
        return CampAccountAdminPage(
            items=items, total=total, page=query.page, page_size=query.page_size
        )


class GetCampAccountUseCase:
    def __init__(self, *, repository: CampAccountAdminRepository) -> None:
        self._repository = repository

    async def execute(self, query: GetCampAccountQuery) -> CampAccountAdminView:
        view = await self._repository.get_admin_account_by_id(query.account_id)
        if view is None:
            raise NotFoundException(message="Camp account not found.")
        return view


class UpdateCampAccountStatusUseCase:
    def __init__(self, *, repository: CampAccountAdminRepository) -> None:
        self._repository = repository

    async def execute(
        self, command: UpdateCampAccountStatusCommand
    ) -> CampAccountAdminView:
        updated = await self._repository.update_account_status(
            account_id=command.account_id, status=command.status
        )
        if updated is None:
            raise NotFoundException(message="Camp account not found.")
        return updated


class UpdateCampAccountMembershipUseCase:
    def __init__(self, *, repository: CampAccountAdminRepository) -> None:
        self._repository = repository

    async def execute(
        self, command: UpdateCampAccountMembershipCommand
    ) -> CampAccountAdminView:
        if command.tier not in ALLOWED_MEMBERSHIP_TIERS:
            raise ValidationException(
                message=f"Invalid membership tier: {command.tier}."
            )
        existing = await self._repository.get_admin_account_by_id(command.account_id)
        if existing is None or existing.is_deleted:
            raise NotFoundException(message="Camp account not found.")

        if command.tier == "none":
            started_at: datetime | None = None
            expires_at: datetime | None = None
        else:
            if command.expires_at is None:
                raise ValidationException(
                    message="expires_at is required for a non-none membership tier."
                )
            started_at = existing.membership_started_at or datetime.now(UTC).replace(
                tzinfo=None
            )
            expires_at = command.expires_at

        updated = await self._repository.update_account_membership(
            account_id=command.account_id,
            tier=command.tier,
            started_at=started_at,
            expires_at=expires_at,
        )
        if updated is None:
            raise NotFoundException(message="Camp account not found.")
        return updated


class DeleteCampAccountUseCase:
    def __init__(self, *, repository: CampAccountAdminRepository) -> None:
        self._repository = repository

    async def execute(self, command: DeleteCampAccountCommand) -> None:
        deleted = await self._repository.soft_delete_account(
            account_id=command.account_id
        )
        if not deleted:
            raise NotFoundException(message="Camp account not found.")
