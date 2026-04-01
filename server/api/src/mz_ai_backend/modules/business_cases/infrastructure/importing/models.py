from __future__ import annotations

from pathlib import Path

from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

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


def _validate_http_url(value: str, *, field_name: str) -> str:
    normalized = _strip_required_text(value, field_name=field_name)
    if not normalized.startswith(("http://", "https://")):
        raise ValueError(f"{field_name} must start with http:// or https://.")
    return normalized.rstrip("/")


class CaseImportDocumentConfig(BaseModel):
    """One document definition loaded from a case directory config file."""

    model_config = ConfigDict(frozen=True)

    file: str

    @field_validator("file")
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
    cover: str
    industry: BusinessCaseIndustry = BusinessCaseIndustry.OTHER
    tags: tuple[str, ...]
    rework: CaseImportDocumentConfig
    ai_driven_analysis: CaseImportDocumentConfig
    market: CaseImportDocumentConfig

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
    industry: BusinessCaseIndustry
    tags: tuple[str, ...]
    cover_image_url: str
    documents: tuple[CaseImportDocumentPayload, ...]

    @field_validator("title", "summary", "cover_image_url")
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


class CaseImportResult(BaseModel):
    """Result returned after one case directory is imported."""

    model_config = ConfigDict(frozen=True)

    case_id: str
    uploaded_asset_count: int
    title: str


class CaseImportCloudBaseSettings(BaseSettings):
    """CloudBase HTTP API settings required by the case import tool."""

    model_config = SettingsConfigDict(
        env_file=SERVER_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
        frozen=True,
        populate_by_name=True,
    )

    env_id: str = Field(validation_alias="MZ_AI_CASE_IMPORT_CLOUDBASE_ENV_ID")
    api_key: str = Field(validation_alias="MZ_AI_CASE_IMPORT_CLOUDBASE_API_KEY")
    cli_api_key_id: str | None = Field(
        default=None,
        validation_alias="MZ_AI_CASE_IMPORT_CLOUDBASE_CLI_API_KEY_ID",
    )
    cli_api_key: str | None = Field(
        default=None,
        validation_alias="MZ_AI_CASE_IMPORT_CLOUDBASE_CLI_API_KEY",
    )
    cli_token: str | None = Field(
        default=None,
        validation_alias="MZ_AI_CASE_IMPORT_CLOUDBASE_CLI_TOKEN",
    )

    @field_validator("env_id", "api_key")
    @classmethod
    def validate_required_fields(cls, value: str, info) -> str:
        return _strip_required_text(value, field_name=info.field_name)

    @field_validator("cli_api_key_id", "cli_api_key", "cli_token")
    @classmethod
    def validate_optional_fields(cls, value: str | None, info) -> str | None:
        if value is None:
            return None
        return _strip_required_text(value, field_name=info.field_name)

    @classmethod
    def from_env(cls) -> "CaseImportCloudBaseSettings":
        """Build CloudBase settings from the process environment."""

        try:
            return cls()
        except ValidationError as exc:
            missing_keys = [
                "MZ_AI_CASE_IMPORT_CLOUDBASE_ENV_ID"
                if error["loc"] == ("env_id",)
                else "MZ_AI_CASE_IMPORT_CLOUDBASE_API_KEY"
                for error in exc.errors()
                if error["type"] == "missing"
            ]
            if not missing_keys:
                raise

            joined_keys = ", ".join(missing_keys)
            raise ValueError(
                f"Missing CloudBase environment variables: {joined_keys}."
            ) from exc

    @property
    def has_cli_credentials(self) -> bool:
        return self.cli_api_key_id is not None and self.cli_api_key is not None


class CloudBaseUploadTicket(BaseModel):
    """One upload ticket returned by the CloudBase HTTP API."""

    model_config = ConfigDict(frozen=True, populate_by_name=True)

    object_id: str = Field(alias="objectId")
    upload_url: str = Field(alias="uploadUrl")
    authorization: str
    token: str
    cloud_object_meta: str = Field(alias="cloudObjectMeta")
    cloud_object_id: str = Field(alias="cloudObjectId")

    @field_validator(
        "object_id",
        "authorization",
        "token",
        "cloud_object_meta",
        "cloud_object_id",
    )
    @classmethod
    def validate_required_fields(cls, value: str, info) -> str:
        return _strip_required_text(value, field_name=info.field_name)

    @field_validator("upload_url")
    @classmethod
    def validate_upload_url(cls, value: str) -> str:
        return _validate_http_url(value, field_name="upload_url")


class ResolvedLocalAsset(BaseModel):
    """One local asset resolved within the case directory boundary."""

    model_config = ConfigDict(frozen=True)

    source_path: Path
    relative_path: str
