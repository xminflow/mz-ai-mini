from __future__ import annotations

from datetime import datetime
from typing import Protocol


class SnowflakeIdGenerator(Protocol):
    """Contract for generating snowflake business ids."""

    def generate(self) -> int:
        """Return a new snowflake identifier."""


class CurrentTimeProvider(Protocol):
    """Contract for retrieving the current application timestamp."""

    def now(self) -> datetime:
        """Return the current timestamp."""
