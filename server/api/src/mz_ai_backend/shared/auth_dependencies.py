"""共享鉴权 FastAPI 依赖：解析可选 Bearer token 和会员状态检查。

供博主洞察、赛道分析等内容模块的付费墙端点复用，避免重复实现。
"""
from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.core.dependencies import get_async_session_dependency
from mz_ai_backend.modules.account_membership.domain import AccountMembershipOrderNotFoundException
from mz_ai_backend.modules.account_membership.infrastructure.repositories import (
    SqlAlchemyAccountMembershipRepository,
)
from mz_ai_backend.modules.agent_auth.application.dtos import GetCurrentAgentAccountQuery
from mz_ai_backend.modules.agent_auth.application.use_cases.get_current_agent_account import (
    GetCurrentAgentAccountUseCase,
)
from mz_ai_backend.modules.agent_auth.domain import (
    AgentAccessTokenExpiredException,
    AgentAccountDisabledException,
)
from mz_ai_backend.modules.agent_auth.infrastructure.dependencies import (
    get_get_current_agent_account_use_case,
)


def get_account_membership_repository(
    session: Annotated[AsyncSession, Depends(get_async_session_dependency)],
) -> SqlAlchemyAccountMembershipRepository:
    return SqlAlchemyAccountMembershipRepository(session=session)


async def get_optional_account_id(
    authorization: Annotated[str | None, Header(alias="Authorization")] = None,
    use_case: Annotated[
        GetCurrentAgentAccountUseCase,
        Depends(get_get_current_agent_account_use_case),
    ] = ...,
) -> int | None:
    """从 Authorization: Bearer 头中解析 account_id；token 缺失或无效时返回 None 而非抛异常。"""
    if authorization is None:
        return None
    prefix = "Bearer "
    if not authorization.startswith(prefix):
        return None
    token = authorization[len(prefix):].strip()
    if token == "":
        return None
    try:
        account = await use_case.execute(GetCurrentAgentAccountQuery(access_token=token))
        return account.account_id
    except (AgentAccessTokenExpiredException, AgentAccountDisabledException):
        return None


async def get_is_active_member(
    account_id: Annotated[int | None, Depends(get_optional_account_id)],
    repository: Annotated[
        SqlAlchemyAccountMembershipRepository,
        Depends(get_account_membership_repository),
    ],
) -> bool:
    """检查当前账户是否拥有有效会员资格。未登录或账户不存在时返回 False。"""
    if account_id is None:
        return False
    now = datetime.now(UTC).replace(tzinfo=None)
    try:
        snapshot = await repository.get_membership_snapshot(account_id=account_id, now=now)
        return snapshot.is_active
    except AccountMembershipOrderNotFoundException:
        return False


__all__ = ["get_optional_account_id", "get_is_active_member"]
