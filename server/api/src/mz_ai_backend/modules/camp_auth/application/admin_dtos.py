from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from ..domain import CampAccountStatus


class CampAccountAdminView(BaseModel):
    """管理端账号视图：含真正生效的 membership_* 列，不含僵尸 enrollment_* 列。"""

    model_config = ConfigDict(frozen=True)

    account_id: int
    username: str
    email: str | None
    status: CampAccountStatus
    membership_tier: str
    membership_started_at: datetime | None
    membership_expires_at: datetime | None
    is_deleted: bool
    created_at: datetime
    updated_at: datetime


class CampAccountAdminFilter(BaseModel):
    model_config = ConfigDict(frozen=True)

    keyword: str | None = None
    status: CampAccountStatus | None = None
    include_deleted: bool = False


class CampAccountAdminPage(BaseModel):
    model_config = ConfigDict(frozen=True)

    items: list[CampAccountAdminView]
    total: int
    page: int
    page_size: int


class ListCampAccountsQuery(BaseModel):
    model_config = ConfigDict(frozen=True)

    keyword: str | None = None
    status: CampAccountStatus | None = None
    include_deleted: bool = False
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class GetCampAccountQuery(BaseModel):
    model_config = ConfigDict(frozen=True)

    account_id: int


class UpdateCampAccountStatusCommand(BaseModel):
    model_config = ConfigDict(frozen=True)

    account_id: int
    status: CampAccountStatus


class UpdateCampAccountMembershipCommand(BaseModel):
    model_config = ConfigDict(frozen=True)

    account_id: int
    tier: str  # 由用例做 {none,basic,premium} 白名单校验
    expires_at: datetime | None = None


class DeleteCampAccountCommand(BaseModel):
    model_config = ConfigDict(frozen=True)

    account_id: int
