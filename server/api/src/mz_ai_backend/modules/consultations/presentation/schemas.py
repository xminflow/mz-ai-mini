from __future__ import annotations

import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from mz_ai_backend.modules.auth.application import MiniProgramIdentity

from ..application import CreateConsultationRequestCommand, CreateConsultationRequestResult


PHONE_PATTERN = re.compile(r"^1\d{10}$")
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _strip_required_text(value: str, *, field_name: str) -> str:
    normalized = value.strip()
    if normalized == "":
        raise ValueError(f"{field_name} must not be blank.")
    return normalized


class CreateConsultationRequestPayload(BaseModel):
    """HTTP payload for creating one consultation request."""

    model_config = ConfigDict(frozen=True)

    phone: str
    email: str
    business_type: str
    business_type_other: str | None = None
    business_description: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        normalized = _strip_required_text(value, field_name="phone")
        if PHONE_PATTERN.fullmatch(normalized) is None:
            raise ValueError("phone must be a valid mainland China mobile number.")
        return normalized

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = _strip_required_text(value, field_name="email")
        if EMAIL_PATTERN.fullmatch(normalized) is None:
            raise ValueError("email must be a valid email address.")
        return normalized

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

    def to_command(
        self,
        *,
        identity: MiniProgramIdentity,
    ) -> CreateConsultationRequestCommand:
        return CreateConsultationRequestCommand(
            identity=identity,
            phone=self.phone,
            email=self.email,
            business_type=self.business_type,
            business_type_other=self.business_type_other,
            business_description=self.business_description,
        )


class CreateConsultationRequestResponse(BaseModel):
    """HTTP response payload for a newly created consultation request."""

    model_config = ConfigDict(frozen=True)

    consultation_id: str
    submitted_at: datetime

    @classmethod
    def from_result(
        cls,
        result: CreateConsultationRequestResult,
    ) -> "CreateConsultationRequestResponse":
        return cls(
            consultation_id=str(result.consultation_id),
            submitted_at=result.submitted_at,
        )
