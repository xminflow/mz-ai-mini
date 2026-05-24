from __future__ import annotations

from datetime import datetime
from typing import Protocol

from pydantic import BaseModel, ConfigDict


class CurrentTimeProvider(Protocol):
    """Contract for retrieving the current time."""

    def now(self) -> datetime:
        """Return the current naive UTC datetime."""


class SnowflakeIdGenerator(Protocol):
    """Contract for generating unique submission ids."""

    def generate(self) -> int:
        """Return one unique snowflake id."""


class MembershipStatus(BaseModel):
    """Minimal membership snapshot consumed by the submissions module."""

    model_config = ConfigDict(frozen=True)

    account_id: int
    is_active: bool
    expires_at: datetime | None
    tier: str


class MembershipStatusReader(Protocol):
    """Contract for reading a member's current membership status."""

    async def get_status(
        self,
        *,
        account_id: int,
        now: datetime,
    ) -> MembershipStatus:
        """Return the current membership status for the given account."""
