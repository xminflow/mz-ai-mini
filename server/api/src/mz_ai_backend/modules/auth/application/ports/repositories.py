from __future__ import annotations

from typing import Protocol

from ...domain import User
from ..dtos import AuthorizedUserProfile, UserRegistration


class UserRepository(Protocol):
    """Contract for auth user persistence."""

    async def get_by_openid(self, openid: str) -> User | None:
        """Return the active user for the given openid."""

    async def create(self, registration: UserRegistration) -> User:
        """Create a new user and return the persisted entity."""

    async def update_profile(self, *, openid: str, profile: AuthorizedUserProfile) -> User:
        """Persist the current user's authorized profile and return the updated entity."""
