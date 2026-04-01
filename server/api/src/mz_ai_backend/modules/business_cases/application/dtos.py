from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ..domain import BusinessCaseDocumentType, BusinessCaseIndustry, BusinessCaseStatus


class BusinessCaseDocumentContent(BaseModel):
    """Document content supplied by create and replace commands."""

    model_config = ConfigDict(frozen=True)

    document_type: BusinessCaseDocumentType
    title: str
    markdown_content: str


class CreateBusinessCaseCommand(BaseModel):
    """Input command for creating a business case aggregate."""

    model_config = ConfigDict(frozen=True)

    case_id: str | None = None
    title: str
    summary: str
    industry: BusinessCaseIndustry
    tags: tuple[str, ...]
    cover_image_url: str
    status: BusinessCaseStatus
    documents: tuple[BusinessCaseDocumentContent, ...]


class ReplaceBusinessCaseCommand(BaseModel):
    """Input command for fully replacing a business case aggregate."""

    model_config = ConfigDict(frozen=True)

    case_id: str
    title: str
    summary: str
    industry: BusinessCaseIndustry
    tags: tuple[str, ...]
    cover_image_url: str
    status: BusinessCaseStatus
    documents: tuple[BusinessCaseDocumentContent, ...]


class GetBusinessCaseQuery(BaseModel):
    """Input query for loading one business case by id."""

    model_config = ConfigDict(frozen=True)

    case_id: str


class DeleteBusinessCaseCommand(BaseModel):
    """Input command for deleting one business case by id."""

    model_config = ConfigDict(frozen=True)

    case_id: str


class ListAdminBusinessCasesQuery(BaseModel):
    """Input query for listing business cases in the admin view."""

    model_config = ConfigDict(frozen=True)

    limit: int
    cursor: str | None
    status: BusinessCaseStatus | None


class ListPublicBusinessCasesQuery(BaseModel):
    """Input query for listing published business cases."""

    model_config = ConfigDict(frozen=True)

    limit: int
    cursor: str | None
    industry: BusinessCaseIndustry | None
    keyword: str | None


class BusinessCaseDocumentRegistration(BaseModel):
    """Repository payload for one newly created business case document."""

    model_config = ConfigDict(frozen=True)

    document_id: int
    document_type: BusinessCaseDocumentType
    title: str
    markdown_content: str


class BusinessCaseRegistration(BaseModel):
    """Repository payload for creating a new business case aggregate."""

    model_config = ConfigDict(frozen=True)

    case_id: str
    title: str
    summary: str
    industry: BusinessCaseIndustry
    tags: tuple[str, ...]
    cover_image_url: str
    status: BusinessCaseStatus
    published_at: datetime | None
    documents: tuple[BusinessCaseDocumentRegistration, ...]


class BusinessCaseDocumentReplacement(BaseModel):
    """Repository payload for replacing one existing business case document."""

    model_config = ConfigDict(frozen=True)

    document_type: BusinessCaseDocumentType
    title: str
    markdown_content: str


class BusinessCaseReplacement(BaseModel):
    """Repository payload for fully replacing a business case aggregate."""

    model_config = ConfigDict(frozen=True)

    case_id: str
    title: str
    summary: str
    industry: BusinessCaseIndustry
    tags: tuple[str, ...]
    cover_image_url: str
    status: BusinessCaseStatus
    published_at: datetime | None
    documents: tuple[BusinessCaseDocumentReplacement, ...]


class BusinessCaseCursor(BaseModel):
    """Decoded cursor used by repository list queries."""

    model_config = ConfigDict(frozen=True)

    sort_value: datetime
    case_id: str


class BusinessCaseDocumentResult(BaseModel):
    """One business case document returned by the application layer."""

    model_config = ConfigDict(frozen=True)

    document_id: int
    title: str
    markdown_content: str


class BusinessCaseDocumentsResult(BaseModel):
    """Typed document payload returned by the application layer."""

    model_config = ConfigDict(frozen=True)

    business_case: BusinessCaseDocumentResult
    market_research: BusinessCaseDocumentResult
    ai_business_upgrade: BusinessCaseDocumentResult


class BusinessCaseDetailResult(BaseModel):
    """Business case detail returned by application use cases."""

    model_config = ConfigDict(frozen=True)

    case_id: str
    title: str
    summary: str
    industry: BusinessCaseIndustry
    tags: tuple[str, ...]
    cover_image_url: str
    status: BusinessCaseStatus
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
    documents: BusinessCaseDocumentsResult


class BusinessCaseListItemResult(BaseModel):
    """One business case list item returned by list use cases."""

    model_config = ConfigDict(frozen=True)

    case_id: str
    title: str
    summary: str
    industry: BusinessCaseIndustry
    tags: tuple[str, ...]
    cover_image_url: str
    status: BusinessCaseStatus
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime


class BusinessCasePageSlice(BaseModel):
    """Internal page slice returned by repository list queries."""

    model_config = ConfigDict(frozen=True)

    items: tuple[BusinessCaseListItemResult, ...]
    has_more: bool
    available_industries: tuple[str, ...] = ()


class ListBusinessCasesResult(BaseModel):
    """Business case list result returned by application use cases."""

    model_config = ConfigDict(frozen=True)

    items: tuple[BusinessCaseListItemResult, ...]
    next_cursor: str | None
    available_industries: tuple[str, ...] = ()


class DeleteBusinessCaseResult(BaseModel):
    """Business case deletion result returned by the application layer."""

    model_config = ConfigDict(frozen=True)

    case_id: str
