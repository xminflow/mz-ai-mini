from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ..application import AdminIdentity, AdminLoginCommand, AdminTokenResult


class AdminLoginRequest(BaseModel):
    model_config = ConfigDict(frozen=True)

    username: str
    password: str

    def to_command(self) -> AdminLoginCommand:
        return AdminLoginCommand(username=self.username, password=self.password)


class AdminTokenResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    token: str
    expires_at: datetime

    @classmethod
    def from_result(cls, result: AdminTokenResult) -> "AdminTokenResponse":
        return cls(token=result.token, expires_at=result.expires_at)


class AdminMeResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    username: str

    @classmethod
    def from_identity(cls, identity: AdminIdentity) -> "AdminMeResponse":
        return cls(username=identity.username)
