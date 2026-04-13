from __future__ import annotations

from datetime import date
from enum import StrEnum

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
    field_validator,
    model_validator,
)

from ..application import (
    BusinessCaseDetailResult,
    BusinessCaseDocumentContent,
    BusinessCaseDocumentResult,
    BusinessCaseDocumentsResult,
    BusinessCaseListItemResult,
    CreateBusinessCaseCommand,
    DeleteBusinessCaseResult,
    ListBusinessCasesResult,
    ReplaceBusinessCaseCommand,
)
from ..domain import (
    BusinessCaseDocumentType,
    BusinessCaseIndustry,
    BusinessCaseStatus,
    BusinessCaseType,
)


def _serialize_business_id(value: str | int) -> str:
    return str(value)


def _strip_required_text(value: str, *, field_name: str) -> str:
    normalized = value.strip()
    if normalized == "":
        raise ValueError(f"{field_name} must not be blank.")
    return normalized


def _validate_non_blank_text(value: str, *, field_name: str) -> str:
    if value.strip() == "":
        raise ValueError(f"{field_name} must not be blank.")
    return value


def _normalize_tags(value: tuple[str, ...], *, field_name: str) -> tuple[str, ...]:
    normalized_tags: list[str] = []
    seen: set[str] = set()

    for raw_tag in value:
        normalized_tag = _strip_required_text(raw_tag, field_name=field_name)
        if normalized_tag in seen:
            continue
        seen.add(normalized_tag)
        normalized_tags.append(normalized_tag)

    if not normalized_tags:
        raise ValueError(f"{field_name} must not be empty.")
    if len(normalized_tags) > 10:
        raise ValueError(f"{field_name} must contain at most 10 items.")

    return tuple(normalized_tags)


class AdminBusinessCaseStatusFilter(StrEnum):
    """Admin list status filters exposed through HTTP query parameters."""

    ALL = "all"
    DRAFT = "draft"
    PUBLISHED = "published"


class BusinessCaseDocumentUpsertRequest(BaseModel):
    """HTTP payload for one business case document."""

    model_config = ConfigDict(frozen=True)

    title: str
    markdown_content: str

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        return _strip_required_text(value, field_name="title")

    @field_validator("markdown_content")
    @classmethod
    def validate_markdown_content(cls, value: str) -> str:
        return _validate_non_blank_text(value, field_name="markdown_content")


class BusinessCaseDocumentsUpsertRequest(BaseModel):
    """HTTP payload containing one business case document set."""

    model_config = ConfigDict(frozen=True)

    business_case: BusinessCaseDocumentUpsertRequest
    market_research: BusinessCaseDocumentUpsertRequest
    business_model: BusinessCaseDocumentUpsertRequest | None = None
    ai_business_upgrade: BusinessCaseDocumentUpsertRequest
    how_to_do: BusinessCaseDocumentUpsertRequest | None = None

    def to_document_contents(
        self,
        case_type: BusinessCaseType,
    ) -> tuple[BusinessCaseDocumentContent, ...]:
        """Convert the HTTP payload into application document content DTOs."""

        document_contents: list[BusinessCaseDocumentContent] = [
            BusinessCaseDocumentContent(
                document_type=BusinessCaseDocumentType.BUSINESS_CASE,
                title=self.business_case.title,
                markdown_content=self.business_case.markdown_content,
            ),
            BusinessCaseDocumentContent(
                document_type=BusinessCaseDocumentType.MARKET_RESEARCH,
                title=self.market_research.title,
                markdown_content=self.market_research.markdown_content,
            ),
        ]
        if self.business_model is None:
            raise ValueError("documents.business_model is required.")
        document_contents.append(
            BusinessCaseDocumentContent(
                document_type=BusinessCaseDocumentType.BUSINESS_MODEL,
                title=self.business_model.title,
                markdown_content=self.business_model.markdown_content,
            )
        )
        document_contents.append(
            BusinessCaseDocumentContent(
                document_type=BusinessCaseDocumentType.AI_BUSINESS_UPGRADE,
                title=self.ai_business_upgrade.title,
                markdown_content=self.ai_business_upgrade.markdown_content,
            )
        )

        if case_type == BusinessCaseType.PROJECT and self.how_to_do is not None:
            document_contents.append(
                BusinessCaseDocumentContent(
                    document_type=BusinessCaseDocumentType.HOW_TO_DO,
                    title=self.how_to_do.title,
                    markdown_content=self.how_to_do.markdown_content,
                )
            )

        return tuple(document_contents)


class BusinessCaseUpsertRequest(BaseModel):
    """HTTP payload for creating or replacing a business case."""

    model_config = ConfigDict(frozen=True)

    type: BusinessCaseType
    title: str
    summary: str
    summary_markdown: str
    data_cutoff_date: date
    freshness_months: int = Field(gt=0)
    industry: BusinessCaseIndustry = BusinessCaseIndustry.OTHER
    tags: tuple[str, ...]
    cover_image_url: HttpUrl
    status: BusinessCaseStatus
    documents: BusinessCaseDocumentsUpsertRequest

    @field_validator("title", "summary")
    @classmethod
    def validate_text_fields(cls, value: str, info) -> str:
        return _strip_required_text(value, field_name=info.field_name)

    @field_validator("summary_markdown")
    @classmethod
    def validate_summary_markdown(cls, value: str) -> str:
        return _validate_non_blank_text(value, field_name="summary_markdown")

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, value: tuple[str, ...]) -> tuple[str, ...]:
        return _normalize_tags(value, field_name="tags")

    @model_validator(mode="after")
    def validate_document_set_for_type(self) -> "BusinessCaseUpsertRequest":
        if self.type == BusinessCaseType.PROJECT and self.documents.how_to_do is None:
            raise ValueError("documents.how_to_do is required for project.")

        if self.type == BusinessCaseType.CASE and self.documents.how_to_do is not None:
            raise ValueError("documents.how_to_do is only supported for project.")

        if self.documents.business_model is None:
            raise ValueError("documents.business_model is required.")

        return self

    def to_create_command(self) -> CreateBusinessCaseCommand:
        """Convert the HTTP payload into an application create command."""

        return CreateBusinessCaseCommand(
            type=self.type,
            title=self.title,
            summary=self.summary,
            summary_markdown=self.summary_markdown,
            data_cutoff_date=self.data_cutoff_date,
            freshness_months=self.freshness_months,
            industry=self.industry,
            tags=self.tags,
            cover_image_url=str(self.cover_image_url),
            status=self.status,
            documents=self.documents.to_document_contents(self.type),
        )

    def to_replace_command(self, *, case_id: str) -> ReplaceBusinessCaseCommand:
        """Convert the HTTP payload into an application replace command."""

        return ReplaceBusinessCaseCommand(
            case_id=case_id,
            type=self.type,
            title=self.title,
            summary=self.summary,
            summary_markdown=self.summary_markdown,
            data_cutoff_date=self.data_cutoff_date,
            freshness_months=self.freshness_months,
            industry=self.industry,
            tags=self.tags,
            cover_image_url=str(self.cover_image_url),
            status=self.status,
            documents=self.documents.to_document_contents(self.type),
        )


class BusinessCaseDocumentResponse(BaseModel):
    """HTTP response payload for one business case document."""

    model_config = ConfigDict(frozen=True)

    document_id: str
    title: str
    markdown_content: str

    @classmethod
    def from_result(
        cls,
        result: BusinessCaseDocumentResult,
    ) -> "BusinessCaseDocumentResponse":
        payload = result.model_dump(mode="json")
        payload["document_id"] = _serialize_business_id(result.document_id)
        return cls.model_validate(payload)


class BusinessCaseDocumentsResponse(BaseModel):
    """HTTP response payload for one business case document set."""

    model_config = ConfigDict(frozen=True)

    business_case: BusinessCaseDocumentResponse
    market_research: BusinessCaseDocumentResponse
    business_model: BusinessCaseDocumentResponse | None = None
    ai_business_upgrade: BusinessCaseDocumentResponse
    how_to_do: BusinessCaseDocumentResponse | None = None

    @classmethod
    def from_result(
        cls,
        result: BusinessCaseDocumentsResult,
    ) -> "BusinessCaseDocumentsResponse":
        return cls(
            business_case=BusinessCaseDocumentResponse.from_result(result.business_case),
            market_research=BusinessCaseDocumentResponse.from_result(
                result.market_research
            ),
            business_model=(
                BusinessCaseDocumentResponse.from_result(result.business_model)
                if result.business_model is not None
                else None
            ),
            ai_business_upgrade=BusinessCaseDocumentResponse.from_result(
                result.ai_business_upgrade
            ),
            how_to_do=(
                BusinessCaseDocumentResponse.from_result(result.how_to_do)
                if result.how_to_do is not None
                else None
            ),
        )


class BusinessCaseDetailResponse(BaseModel):
    """HTTP response payload for one business case detail."""

    model_config = ConfigDict(frozen=True)

    case_id: str
    type: BusinessCaseType
    title: str
    summary: str
    summary_markdown: str | None
    data_cutoff_date: date | None
    freshness_months: int | None
    industry: BusinessCaseIndustry
    tags: tuple[str, ...]
    cover_image_url: str
    status: str
    published_at: str | None
    created_at: str
    updated_at: str
    documents: BusinessCaseDocumentsResponse

    @classmethod
    def from_result(
        cls,
        result: BusinessCaseDetailResult,
    ) -> "BusinessCaseDetailResponse":
        payload = result.model_dump(mode="json")
        payload["case_id"] = _serialize_business_id(result.case_id)
        payload["documents"] = BusinessCaseDocumentsResponse.from_result(result.documents)
        return cls.model_validate(payload)


class BusinessCaseListItemResponse(BaseModel):
    """HTTP response payload for one business case list item."""

    model_config = ConfigDict(frozen=True)

    case_id: str
    type: BusinessCaseType
    title: str
    summary: str
    data_cutoff_date: date | None
    freshness_months: int | None
    industry: BusinessCaseIndustry
    tags: tuple[str, ...]
    cover_image_url: str
    status: str
    published_at: str | None
    created_at: str
    updated_at: str

    @classmethod
    def from_result(
        cls,
        result: BusinessCaseListItemResult,
    ) -> "BusinessCaseListItemResponse":
        payload = result.model_dump(mode="json")
        payload["case_id"] = _serialize_business_id(result.case_id)
        return cls.model_validate(payload)


class BusinessCaseListResponse(BaseModel):
    """HTTP response payload for one business case list slice."""

    model_config = ConfigDict(frozen=True)

    items: tuple[BusinessCaseListItemResponse, ...]
    next_cursor: str | None
    available_industries: tuple[str, ...]

    @classmethod
    def from_result(
        cls,
        result: ListBusinessCasesResult,
    ) -> "BusinessCaseListResponse":
        return cls(
            items=tuple(
                BusinessCaseListItemResponse.from_result(item) for item in result.items
            ),
            next_cursor=result.next_cursor,
            available_industries=result.available_industries,
        )


class DeleteBusinessCaseResponse(BaseModel):
    """HTTP response payload for one business case deletion."""

    model_config = ConfigDict(frozen=True)

    case_id: str

    @classmethod
    def from_result(
        cls,
        result: DeleteBusinessCaseResult,
    ) -> "DeleteBusinessCaseResponse":
        return cls(case_id=_serialize_business_id(result.case_id))
