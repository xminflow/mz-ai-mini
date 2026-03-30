from __future__ import annotations

from datetime import datetime
from typing import Protocol


class CurrentTimeProvider(Protocol):
    """Contract for retrieving the current time."""

    def now(self) -> datetime:
        """Return the current naive UTC datetime."""


class SnowflakeIdGenerator(Protocol):
    """Contract for generating business ids."""

    def generate(self) -> int:
        """Return one unique snowflake id."""
