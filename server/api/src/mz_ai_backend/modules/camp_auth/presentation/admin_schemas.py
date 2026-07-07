from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

from ..application.admin_dtos import (
    CampAccountAdminPage,
    CampAccountAdminView,
    UpdateCampAccountMembershipCommand,
    UpdateCampAccountStatusCommand,
)
from ..domain import CampAccountStatus


class CampAccountAdminResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    account_id: str
    username: str
    email: str | None
    status: str
    membership_tier: str
    membership_started_at: datetime | None
    membership_expires_at: datetime | None
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_view(cls, view: CampAccountAdminView) -> "CampAccountAdminResponse":
        return cls(
            account_id=str(view.account_id),
            username=view.username,
            email=view.email,
            status=view.status.value,
            membership_tier=view.membership_tier,
            membership_started_at=view.membership_started_at,
            membership_expires_at=view.membership_expires_at,
            is_deleted=view.is_deleted,
            created_at=view.created_at,
            updated_at=view.updated_at,
        )


class CampAccountAdminPageResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    items: list[CampAccountAdminResponse]
    total: int
    page: int
    page_size: int

    @classmethod
    def from_page(cls, page: CampAccountAdminPage) -> "CampAccountAdminPageResponse":
        return cls(
            items=[CampAccountAdminResponse.from_view(v) for v in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
        )


class UpdateCampAccountStatusRequest(BaseModel):
    model_config = ConfigDict(frozen=True)

    status: Literal["active", "disabled"]

    def to_command(self, *, account_id: int) -> UpdateCampAccountStatusCommand:
        return UpdateCampAccountStatusCommand(
            account_id=account_id, status=CampAccountStatus(self.status)
        )


class UpdateCampAccountMembershipRequest(BaseModel):
    model_config = ConfigDict(frozen=True)

    tier: Literal["none", "basic", "premium"]
    expires_at: datetime | None = None

    def to_command(self, *, account_id: int) -> UpdateCampAccountMembershipCommand:
        return UpdateCampAccountMembershipCommand(
            account_id=account_id, tier=self.tier, expires_at=self.expires_at
        )


class CampAccountDeleteResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    deleted: bool
