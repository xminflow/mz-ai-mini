from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from mz_ai_backend.modules.auth.application import MiniProgramIdentity

from ..domain import ConsultationBusinessType


def _strip_required_text(value: str, *, field_name: str) -> str:
    normalized = value.strip()
    if normalized == "":
        raise ValueError(f"{field_name} must not be blank.")
    return normalized


class AuthenticatedConsultationUser(BaseModel):
    """Current authenticated user summary required for consultation creation."""

    model_config = ConfigDict(frozen=True)

    user_id: int
    openid: str


class CreateConsultationRequestCommand(BaseModel):
    """Input command for creating one consultation request."""

    model_config = ConfigDict(frozen=True)

    identity: MiniProgramIdentity
    phone: str
    email: str
    business_type: str
    business_type_other: str | None = None
    business_description: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        return _strip_required_text(value, field_name="phone")

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return _strip_required_text(value, field_name="email")

    @field_validator("business_type")
    @classmethod
    def validate_business_type(cls, value: str) -> str:
        return _strip_required_text(value, field_name="business_type")

    @field_validator("business_type_other")
    @classmethod
    def validate_business_type_other(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None

    @field_validator("business_description")
    @classmethod
    def validate_business_description(cls, value: str) -> str:
        return _strip_required_text(value, field_name="business_description")


class ConsultationRequestRegistration(BaseModel):
    """Registration payload for a new consultation request."""

    model_config = ConfigDict(frozen=True)

    consultation_id: int
    user_id: int
    openid: str
    phone: str
    email: str
    business_type: ConsultationBusinessType
    business_type_other: str | None
    business_description: str
    created_at: datetime


class CreateConsultationRequestResult(BaseModel):
    """Result returned after creating one consultation request."""

    model_config = ConfigDict(frozen=True)

    consultation_id: int
    submitted_at: datetime
