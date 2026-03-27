from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..application.dtos import AuthorizedUserProfile, UserRegistration
from ..domain import User, UserAlreadyExistsException, UserNotFoundException, UserStatus
from .models import UserModel


def _to_domain_entity(model: UserModel) -> User:
    return User(
        user_id=model.user_id,
        openid=model.openid,
        union_id=model.union_id,
        nickname=model.nickname,
        avatar_url=model.avatar_url,
        status=UserStatus(model.status),
        is_deleted=model.is_deleted,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


class SqlAlchemyUserRepository:
    """Persist auth users through SQLAlchemy."""

    def __init__(self, *, session: AsyncSession) -> None:
        self._session = session

    async def get_by_openid(self, openid: str) -> User | None:
        statement = select(UserModel).where(
            UserModel.openid == openid,
            UserModel.is_deleted.is_(False),
        )
        result = await self._session.execute(statement)
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return _to_domain_entity(model)

    async def create(self, registration: UserRegistration) -> User:
        model = UserModel(
            user_id=registration.user_id,
            openid=registration.openid,
            union_id=registration.union_id,
            nickname=registration.nickname,
            avatar_url=registration.avatar_url,
            status=registration.status.value,
            is_deleted=False,
        )
        self._session.add(model)
        try:
            await self._session.commit()
        except IntegrityError as exc:
            await self._session.rollback()
            raise UserAlreadyExistsException() from exc

        await self._session.refresh(model)
        return _to_domain_entity(model)

    async def update_profile(self, *, openid: str, profile: AuthorizedUserProfile) -> User:
        statement = select(UserModel).where(
            UserModel.openid == openid,
            UserModel.is_deleted.is_(False),
        )
        result = await self._session.execute(statement)
        model = result.scalar_one_or_none()
        if model is None:
            raise UserNotFoundException()

        model.nickname = profile.nickname
        model.avatar_url = profile.avatar_url
        await self._session.commit()
        await self._session.refresh(model)
        return _to_domain_entity(model)
