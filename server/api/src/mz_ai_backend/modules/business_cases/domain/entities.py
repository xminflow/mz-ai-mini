from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class BusinessCaseStatus(StrEnum):
    """Supported business case statuses."""

    DRAFT = "draft"
    PUBLISHED = "published"


class BusinessCaseType(StrEnum):
    """Supported business case content types."""

    CASE = "case"
    PROJECT = "project"


class BusinessCaseIndustry(StrEnum):
    """Supported business case industries."""

    TECHNOLOGY = "科技"
    CONSUMER = "消费"
    FINANCE = "金融"
    HEALTHCARE = "医疗"
    EDUCATION = "教育"
    ENTERPRISE_SERVICES = "企业服务"
    CONTENT_AND_CREATOR = "自媒体"
    ENTERTAINMENT = "娱乐"
    LOCAL_SERVICES = "本地生活"
    INDUSTRY_AND_SUPPLY_CHAIN = "工业与供应链"
    OTHER = "其他"


class BusinessCaseDocumentType(StrEnum):
    """Fixed document types belonging to one business case."""

    BUSINESS_CASE = "business_case"
    MARKET_RESEARCH = "market_research"
    BUSINESS_MODEL = "business_model"
    AI_BUSINESS_UPGRADE = "ai_business_upgrade"
    HOW_TO_DO = "how_to_do"


_PROJECT_BASE_DOCUMENT_TYPES = (
    BusinessCaseDocumentType.BUSINESS_CASE,
    BusinessCaseDocumentType.MARKET_RESEARCH,
    BusinessCaseDocumentType.AI_BUSINESS_UPGRADE,
)
_CASE_DOCUMENT_TYPES = (
    BusinessCaseDocumentType.BUSINESS_CASE,
    BusinessCaseDocumentType.MARKET_RESEARCH,
    BusinessCaseDocumentType.BUSINESS_MODEL,
    BusinessCaseDocumentType.AI_BUSINESS_UPGRADE,
)


def required_document_types_for_case_type(
    case_type: BusinessCaseType,
) -> tuple[BusinessCaseDocumentType, ...]:
    """Return the required document types for create and replace operations."""

    if case_type == BusinessCaseType.CASE:
        return _CASE_DOCUMENT_TYPES

    return (*_PROJECT_BASE_DOCUMENT_TYPES, BusinessCaseDocumentType.HOW_TO_DO)


def supports_loaded_document_types(
    case_type: BusinessCaseType,
    document_types: set[BusinessCaseDocumentType],
) -> bool:
    """Return whether one loaded document set is valid for the case type."""

    if case_type == BusinessCaseType.CASE:
        return document_types == set(_CASE_DOCUMENT_TYPES)

    base_document_type_set = set(_PROJECT_BASE_DOCUMENT_TYPES)
    return document_types in (
        base_document_type_set,
        base_document_type_set | {BusinessCaseDocumentType.HOW_TO_DO},
    )


class BusinessCaseDocument(BaseModel):
    """Domain entity for one business case document."""

    model_config = ConfigDict(frozen=True)

    document_id: int
    document_type: BusinessCaseDocumentType
    title: str
    markdown_content: str
    is_deleted: bool
    created_at: datetime
    updated_at: datetime


class BusinessCaseDocuments(BaseModel):
    """Typed container for one business case document set."""

    model_config = ConfigDict(frozen=True)

    business_case: BusinessCaseDocument
    market_research: BusinessCaseDocument
    business_model: BusinessCaseDocument | None = None
    ai_business_upgrade: BusinessCaseDocument
    how_to_do: BusinessCaseDocument | None = None

    def iter_documents(self) -> tuple[BusinessCaseDocument, ...]:
        """Return the document set in presentation order."""

        documents = [
            self.business_case,
            self.market_research,
        ]
        if self.business_model is not None:
            documents.append(self.business_model)
        documents.append(self.ai_business_upgrade)
        if self.how_to_do is not None:
            documents.append(self.how_to_do)
        return tuple(documents)


class BusinessCaseSummary(BaseModel):
    """Summary fields shown in business case list responses."""

    model_config = ConfigDict(frozen=True)

    case_id: str
    type: BusinessCaseType
    title: str
    summary: str
    industry: BusinessCaseIndustry
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
