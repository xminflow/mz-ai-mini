from __future__ import annotations

from datetime import datetime
from typing import Protocol

from ...domain import CampAccountStatus
from ..admin_dtos import CampAccountAdminFilter, CampAccountAdminView


class CampAccountAdminRepository(Protocol):
    """管理端对 camp 账号的读写契约。"""

    async def list_admin_accounts(
        self, *, filter_: CampAccountAdminFilter, offset: int, limit: int
    ) -> list[CampAccountAdminView]: ...

    async def count_admin_accounts(self, *, filter_: CampAccountAdminFilter) -> int: ...

    async def get_admin_account_by_id(self, account_id: int) -> CampAccountAdminView | None: ...

    async def update_account_status(
        self, *, account_id: int, status: CampAccountStatus
    ) -> CampAccountAdminView | None: ...

    async def update_account_membership(
        self,
        *,
        account_id: int,
        tier: str,
        started_at: datetime | None,
        expires_at: datetime | None,
    ) -> CampAccountAdminView | None: ...

    async def soft_delete_account(self, *, account_id: int) -> bool: ...
