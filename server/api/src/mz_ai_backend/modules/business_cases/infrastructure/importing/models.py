from __future__ import annotations

from datetime import date
from pathlib import Path

from pydantic import (
    BaseModel,
    ConfigDict,
    field_validator,
    model_validator,
)

from ...domain import BusinessCaseDocumentType, BusinessCaseIndustry, BusinessCaseType

SERVER_ENV_FILE = Path(__file__).resolve().parents[7] / ".env"


def _strip_required_text(value: str, *, field_name: str) -> str:
    normalized = value.strip()
    if normalized == "":
        raise ValueError(f"{field_name} must not be blank.")
    return normalized


def _normalize_tags(tags: tuple[str, ...]) -> tuple[str, ...]:
    normalized_tags: list[str] = []
    seen: set[str] = set()

    for raw_tag in tags:
        normalized_tag = _strip_required_text(raw_tag, field_name="tags")
        if normalized_tag in seen:
            continue
        seen.add(normalized_tag)
        normalized_tags.append(normalized_tag)

    if not normalized_tags:
        raise ValueError("tags must not be empty.")
    if len(normalized_tags) > 10:
        raise ValueError("tags must contain at most 10 items.")
    return tuple(normalized_tags)


class CaseImportDocumentConfig(BaseModel):
    """One document definition loaded from a case directory config file."""

    model_config = ConfigDict(frozen=True)

    file: str

    @field_validator("file")
    @classmethod
    def validate_required_fields(cls, value: str, info) -> str:
        return _strip_required_text(value, field_name=info.field_name)


class CaseImportRelationshipConfig(BaseModel):
    """One relationship entry loaded from a case directory config file."""

    model_config = ConfigDict(frozen=True)

    case_id: str
    type: str
    reason: str

    @field_validator("case_id", "type", "reason")
    @classmethod
    def validate_required_fields(cls, value: str, info) -> str:
        return _strip_required_text(value, field_name=info.field_name)


class CaseImportConfig(BaseModel):
    """Structured case directory config loaded from config.yml."""

    model_config = ConfigDict(frozen=True)

    case_id: str
    type: BusinessCaseType
    title: str
    desc: str
    summary: CaseImportDocumentConfig
    cover: str
    data_cutoff_date: date
    freshness_months: int
    industry: BusinessCaseIndustry = BusinessCaseIndustry.OTHER
    tags: tuple[str, ...]
    relationships: tuple[CaseImportRelationshipConfig, ...] = ()
    rework: CaseImportDocumentConfig
    ai_driven_analysis: CaseImportDocumentConfig
    market: CaseImportDocumentConfig
    business_model: CaseImportDocumentConfig | None = None
    how_to_do: CaseImportDocumentConfig | None = None

    @field_validator("title", "desc", "cover")
    @classmethod
    def validate_text_fields(cls, value: str, info) -> str:
        return _strip_required_text(value, field_name=info.field_name)

    @field_validator("case_id")
    @classmethod
    def validate_case_id(cls, value: str) -> str:
        return _strip_required_text(value, field_name="case_id")

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, value: tuple[str, ...]) -> tuple[str, ...]:
        return _normalize_tags(value)

    @field_validator("freshness_months")
    @classmethod
    def validate_freshness_months(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("freshness_months must be greater than 0.")
        return value

    @model_validator(mode="after")
    def validate_project_documents(self) -> "CaseImportConfig":
        if self.type == BusinessCaseType.PROJECT and self.how_to_do is None:
            raise ValueError("how_to_do is required for project imports.")

        if self.type == BusinessCaseType.CASE and self.how_to_do is not None:
            raise ValueError("how_to_do is only supported for project imports.")

        if self.business_model is None:
            raise ValueError("business_model is required for all imports.")

        return self


class CaseImportDocumentPayload(BaseModel):
    """Resolved document payload ready for business case replacement."""

    model_config = ConfigDict(frozen=True)

    document_type: BusinessCaseDocumentType
    title: str
    markdown_content: str

    @field_validator("title", "markdown_content")
    @classmethod
    def validate_required_fields(cls, value: str, info) -> str:
        return _strip_required_text(value, field_name=info.field_name)


class CaseImportPayload(BaseModel):
    """Resolved business case payload ready for replacement."""

    model_config = ConfigDict(frozen=True)

    case_id: str
    type: BusinessCaseType
    title: str
    summary: str
    summary_markdown: str
    data_cutoff_date: date
    freshness_months: int
    industry: BusinessCaseIndustry
    tags: tuple[str, ...]
    cover_image_url: str
    documents: tuple[CaseImportDocumentPayload, ...]

    @field_validator("title", "summary", "summary_markdown", "cover_image_url")
    @classmethod
    def validate_text_fields(cls, value: str, info) -> str:
        return _strip_required_text(value, field_name=info.field_name)

    @field_validator("case_id")
    @classmethod
    def validate_case_id(cls, value: str) -> str:
        return _strip_required_text(value, field_name="case_id")

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, value: tuple[str, ...]) -> tuple[str, ...]:
        return _normalize_tags(value)

    @field_validator("freshness_months")
    @classmethod
    def validate_payload_freshness_months(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("freshness_months must be greater than 0.")
        return value


class CaseImportResult(BaseModel):
    """Result returned after one case directory is imported."""

    model_config = ConfigDict(frozen=True)

    case_id: str
    uploaded_asset_count: int
    title: str


class ResolvedLocalAsset(BaseModel):
    """One local asset resolved within the case directory boundary."""

    model_config = ConfigDict(frozen=True)

    source_path: Path
    relative_path: str
