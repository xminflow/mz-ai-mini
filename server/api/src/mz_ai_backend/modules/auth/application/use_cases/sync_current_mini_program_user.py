from __future__ import annotations

from mz_ai_backend.core.logging import get_logger

from ...domain import User, UserAlreadyExistsException, UserDisabledException, UserStatus
from ..dtos import (
    AuthenticatedUserSummary,
    EnsureCurrentMiniProgramUserCommand,
    EnsureCurrentMiniProgramUserResult,
    UserRegistration,
    build_membership_summary,
)
from ..ports import SnowflakeIdGenerator, UserRepository


auth_logger = get_logger("mz_ai_backend.auth")


class EnsureCurrentMiniProgramUserUseCase:
    """Ensure the current trusted mini program user exists in the database."""

    def __init__(
        self,
        *,
        user_repository: UserRepository,
        snowflake_id_generator: SnowflakeIdGenerator,
    ) -> None:
        self._user_repository = user_repository
        self._snowflake_id_generator = snowflake_id_generator

    async def execute(
        self,
        command: EnsureCurrentMiniProgramUserCommand,
    ) -> EnsureCurrentMiniProgramUserResult:
        user = await self._user_repository.get_by_openid(command.identity.openid)
        is_new_user = False

        if user is None:
            user, is_new_user = await self._register_new_user(
                openid=command.identity.openid,
                union_id=command.identity.union_id,
            )

        if user.status == UserStatus.DISABLED:
            raise UserDisabledException()

        auth_logger.info(
            "auth.cloud_identity_synced user_id=%s is_new_user=%s app_id=%s",
            user.user_id,
            is_new_user,
            command.identity.app_id,
        )
        return self._build_result(user=user, is_new_user=is_new_user)

    async def _register_new_user(
        self,
        *,
        openid: str,
        union_id: str | None,
    ) -> tuple[User, bool]:
        registration = UserRegistration(
            user_id=self._snowflake_id_generator.generate(),
            openid=openid,
            union_id=union_id,
            nickname=None,
            avatar_url=None,
            status=UserStatus.ACTIVE,
        )
        try:
            return await self._user_repository.create(registration), True
        except UserAlreadyExistsException:
            existing_user = await self._user_repository.get_by_openid(openid)
            if existing_user is None:
                raise
            return existing_user, False

    @staticmethod
    def _build_result(
        *,
        user: User,
        is_new_user: bool,
    ) -> EnsureCurrentMiniProgramUserResult:
        return EnsureCurrentMiniProgramUserResult(
            is_new_user=is_new_user,
            user=AuthenticatedUserSummary(
                user_id=user.user_id,
                openid=user.openid,
                union_id=user.union_id,
                nickname=user.nickname,
                avatar_url=user.avatar_url,
                status=user.status,
                membership=build_membership_summary(
                    membership_tier=user.membership_tier,
                    membership_started_at=user.membership_started_at,
                    membership_expires_at=user.membership_expires_at,
                ),
            ),
        )
