from __future__ import annotations

from datetime import datetime
from typing import Protocol

from ..dtos import AdminIdentity, AdminTokenResult


class AdminCredentialVerifier(Protocol):
    """Verify admin username/password against the configured account."""

    def verify(self, *, username: str, password: str) -> bool: ...


class AdminTokenService(Protocol):
    """Issue and verify stateless admin tokens."""

    def issue(self, *, username: str, now: datetime, ttl_minutes: int) -> AdminTokenResult: ...

    def verify(self, *, token: str, now: datetime) -> AdminIdentity: ...
