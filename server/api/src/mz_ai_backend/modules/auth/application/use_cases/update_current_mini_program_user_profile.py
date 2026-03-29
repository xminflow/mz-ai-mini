from __future__ import annotations

from mz_ai_backend.core.logging import get_logger

from ...domain import UserDisabledException, UserNotFoundException, UserStatus
from ..dtos import (
    AuthenticatedUserSummary,
    UpdateCurrentMiniProgramUserProfileCommand,
    UpdateCurrentMiniProgramUserProfileResult,
    build_membership_summary,
)
from ..ports import UserRepository


auth_logger = get_logger("mz_ai_backend.auth")


class UpdateCurrentMiniProgramUserProfileUseCase:
    """Persist the current trusted mini program user's authorized profile."""

    def __init__(self, *, user_repository: UserRepository) -> None:
        self._user_repository = user_repository

    async def execute(
        self,
        command: UpdateCurrentMiniProgramUserProfileCommand,
    ) -> UpdateCurrentMiniProgramUserProfileResult:
        user = await self._user_repository.get_by_openid(command.identity.openid)
        if user is None:
            raise UserNotFoundException()

        if user.status != UserStatus.ACTIVE:
            raise UserDisabledException()

        updated_user = await self._user_repository.update_profile(
            openid=command.identity.openid,
            profile=command.profile,
        )
        auth_logger.info(
            "auth.profile_synced user_id=%s app_id=%s",
            updated_user.user_id,
            command.identity.app_id,
        )
        return UpdateCurrentMiniProgramUserProfileResult(
            user=AuthenticatedUserSummary(
                user_id=updated_user.user_id,
                openid=updated_user.openid,
                union_id=updated_user.union_id,
                nickname=updated_user.nickname,
                avatar_url=updated_user.avatar_url,
                status=updated_user.status,
                membership=build_membership_summary(
                    membership_tier=updated_user.membership_tier,
                    membership_started_at=updated_user.membership_started_at,
                    membership_expires_at=updated_user.membership_expires_at,
                ),
            )
        )
