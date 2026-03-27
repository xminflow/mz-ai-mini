from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class BusinessCaseStatus(StrEnum):
    """Supported business case statuses."""

    DRAFT = "draft"
    PUBLISHED = "published"


class BusinessCaseDocumentType(StrEnum):
    """Fixed document types belonging to one business case."""

    BUSINESS_CASE = "business_case"
    MARKET_RESEARCH = "market_research"
    AI_BUSINESS_UPGRADE = "ai_business_upgrade"


class BusinessCaseDocument(BaseModel):
    """Domain entity for one business case document."""

    model_config = ConfigDict(frozen=True)

    document_id: int
    document_type: BusinessCaseDocumentType
    title: str
    markdown_content: str
    cover_image_url: str
    is_deleted: bool
    created_at: datetime
    updated_at: datetime


class BusinessCaseDocuments(BaseModel):
    """Typed container for the three required business case documents."""

    model_config = ConfigDict(frozen=True)

    business_case: BusinessCaseDocument
    market_research: BusinessCaseDocument
    ai_business_upgrade: BusinessCaseDocument

    def iter_documents(self) -> tuple[BusinessCaseDocument, ...]:
        """Return the fixed document set in presentation order."""

        return (
            self.business_case,
            self.market_research,
            self.ai_business_upgrade,
        )


class BusinessCaseSummary(BaseModel):
    """Summary fields shown in business case list responses."""

    model_config = ConfigDict(frozen=True)

    case_id: str
    title: str
    summary: str
    tags: tuple[str, ...]
    cover_image_url: str
    status: BusinessCaseStatus
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime


class BusinessCase(BusinessCaseSummary):
    """Business case aggregate root."""

    documents: BusinessCaseDocuments
    is_deleted: bool
