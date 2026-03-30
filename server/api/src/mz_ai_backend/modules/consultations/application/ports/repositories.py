from __future__ import annotations

from typing import Protocol

from ...domain import ConsultationRequest
from ..dtos import AuthenticatedConsultationUser, ConsultationRequestRegistration


class ConsultationRequestRepository(Protocol):
    """Contract for consultation request persistence."""

    async def create(
        self,
        registration: ConsultationRequestRegistration,
    ) -> ConsultationRequest:
        """Create a consultation request aggregate and return the persisted entity."""


class ConsultationUserReader(Protocol):
    """Contract for loading the current authenticated consultation user."""

    async def get_by_openid(self, openid: str) -> AuthenticatedConsultationUser | None:
        """Return the active authenticated user summary for the given openid."""
