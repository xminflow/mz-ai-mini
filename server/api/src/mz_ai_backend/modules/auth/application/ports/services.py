from __future__ import annotations

from typing import Protocol


class SnowflakeIdGenerator(Protocol):
    """Contract for generating business identifiers."""

    def generate(self) -> int:
        """Generate a business identifier."""
