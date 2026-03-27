from __future__ import annotations

from typing import Protocol

from ...domain import BusinessCase
from ..dtos import (
    BusinessCaseCursor,
    BusinessCasePageSlice,
    BusinessCaseRegistration,
    BusinessCaseReplacement,
    BusinessCaseStatus,
)


class BusinessCaseRepository(Protocol):
    """Contract for business case aggregate persistence."""

    async def create(self, registration: BusinessCaseRegistration) -> BusinessCase:
        """Create a business case aggregate and return the persisted entity."""

    async def get_by_case_id(self, case_id: str) -> BusinessCase | None:
        """Return the business case aggregate for the given business id."""

    async def replace(self, replacement: BusinessCaseReplacement) -> BusinessCase | None:
        """Fully replace a business case aggregate and return the persisted entity."""

    async def delete(self, case_id: str) -> bool:
        """Logically delete a business case aggregate."""

    async def list_admin(
        self,
        *,
        limit: int,
        cursor: BusinessCaseCursor | None,
        status: BusinessCaseStatus | None,
    ) -> BusinessCasePageSlice:
        """Return one admin-facing list slice ordered by creation time."""

    async def list_public(
        self,
        *,
        limit: int,
        cursor: BusinessCaseCursor | None,
        tag: str | None,
    ) -> BusinessCasePageSlice:
        """Return one public-facing list slice ordered by publish time."""
