from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator


class AdminLoginCommand(BaseModel):
    """Input command for admin username/password login."""

    model_config = ConfigDict(frozen=True)

    username: str
    password: str

    @field_validator("username", "password")
    @classmethod
    def _not_blank(cls, value: str) -> str:
        normalized = value.strip()
        if normalized == "":
            raise ValueError("must not be blank.")
        return normalized


class AdminTokenResult(BaseModel):
    """Issued admin token plus its absolute expiry."""

    model_config = ConfigDict(frozen=True)

    token: str
    expires_at: datetime


class AdminIdentity(BaseModel):
    """Authenticated admin identity resolved from a token."""

    model_config = ConfigDict(frozen=True)

    username: str
