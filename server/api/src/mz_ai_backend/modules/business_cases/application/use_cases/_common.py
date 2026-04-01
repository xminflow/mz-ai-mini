from __future__ import annotations

import base64
import json
from collections.abc import Callable
from datetime import datetime

from mz_ai_backend.core.exceptions import ValidationException

from ...domain import (
    BusinessCase,
    BusinessCaseDocument,
    BusinessCaseDocumentType,
    BusinessCaseDocuments,
    BusinessCaseInvalidDocumentSetException,
    BusinessCaseStatus,
    BusinessCaseType,
    required_document_types_for_case_type,
)
from ..dtos import (
    BusinessCaseCursor,
    BusinessCaseDetailResult,
    BusinessCaseDocumentContent,
    BusinessCaseDocumentRegistration,
    BusinessCaseDocumentReplacement,
    BusinessCaseDocumentResult,
    BusinessCaseDocumentsResult,
    BusinessCaseListItemResult,
    BusinessCasePageSlice,
    BusinessCaseRegistration,
    BusinessCaseReplacement,
    CreateBusinessCaseCommand,
    ListBusinessCasesResult,
    ReplaceBusinessCaseCommand,
)
from ..ports import SnowflakeIdGenerator


def validate_document_contents(
    case_type: BusinessCaseType,
    documents: tuple[BusinessCaseDocumentContent, ...],
) -> tuple[BusinessCaseDocumentContent, ...]:
    """Validate the document set for one business case type."""

    document_types = {document.document_type for document in documents}
    required_document_types = set(required_document_types_for_case_type(case_type))
    if (
        len(documents) != len(required_document_types)
        or document_types != required_document_types
    ):
        raise BusinessCaseInvalidDocumentSetException()
    return documents


def build_registration(
    command: CreateBusinessCaseCommand,
    *,
    case_id: str,
    published_at: datetime | None,
    snowflake_id_generator: SnowflakeIdGenerator,
) -> BusinessCaseRegistration:
    """Build a repository registration payload from a create command."""

    documents = tuple(
        BusinessCaseDocumentRegistration(
            document_id=snowflake_id_generator.generate(),
            document_type=document.document_type,
            title=document.title,
            markdown_content=document.markdown_content,
        )
        for document in validate_document_contents(command.type, command.documents)
    )
    return BusinessCaseRegistration(
        case_id=case_id,
        type=command.type,
        title=command.title,
        summary=command.summary,
        industry=command.industry,
        tags=command.tags,
        cover_image_url=command.cover_image_url,
        status=command.status,
        published_at=published_at,
        documents=documents,
    )


def build_replacement(
    command: ReplaceBusinessCaseCommand,
    *,
    current_documents: BusinessCaseDocuments,
    published_at: datetime | None,
    snowflake_id_generator: SnowflakeIdGenerator,
) -> BusinessCaseReplacement:
    """Build a repository replacement payload from a replace command."""

    existing_document_id_map = {
        document.document_type: document.document_id
        for document in current_documents.iter_documents()
    }
    documents = tuple(
        BusinessCaseDocumentReplacement(
            document_id=(
                existing_document_id_map[document.document_type]
                if document.document_type in existing_document_id_map
                else snowflake_id_generator.generate()
            ),
            document_type=document.document_type,
            title=document.title,
            markdown_content=document.markdown_content,
        )
        for document in validate_document_contents(command.type, command.documents)
    )
    return BusinessCaseReplacement(
        case_id=command.case_id,
        type=command.type,
        title=command.title,
        summary=command.summary,
        industry=command.industry,
        tags=command.tags,
        cover_image_url=command.cover_image_url,
        status=command.status,
        published_at=published_at,
        documents=documents,
    )


def _document_result(document: BusinessCaseDocument) -> BusinessCaseDocumentResult:
    return BusinessCaseDocumentResult(
        document_id=document.document_id,
        title=document.title,
        markdown_content=document.markdown_content,
    )


def _documents_result(
    documents: BusinessCaseDocuments,
) -> BusinessCaseDocumentsResult:
    return BusinessCaseDocumentsResult(
        business_case=_document_result(documents.business_case),
        market_research=_document_result(documents.market_research),
        ai_business_upgrade=_document_result(documents.ai_business_upgrade),
        how_to_do=(
            _document_result(documents.how_to_do)
            if documents.how_to_do is not None
            else None
        ),
    )


def build_detail_result(case: BusinessCase) -> BusinessCaseDetailResult:
    """Map a domain aggregate into the detail result DTO."""

    return BusinessCaseDetailResult(
        case_id=case.case_id,
        type=case.type,
        title=case.title,
        summary=case.summary,
        industry=case.industry,
        tags=case.tags,
        cover_image_url=case.cover_image_url,
        status=case.status,
        published_at=case.published_at,
        created_at=case.created_at,
        updated_at=case.updated_at,
        documents=_documents_result(case.documents),
    )


def encode_cursor(cursor: BusinessCaseCursor) -> str:
    """Encode an opaque cursor for infinite scrolling."""

    payload = {
        "sort_value": cursor.sort_value.isoformat(),
        "case_id": cursor.case_id,
    }
    return base64.urlsafe_b64encode(
        json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    ).decode("utf-8")


def decode_cursor(raw_cursor: str | None) -> BusinessCaseCursor | None:
    """Decode an opaque cursor into its stable ordering values."""

    if raw_cursor is None:
        return None

    try:
        padding = "=" * (-len(raw_cursor) % 4)
        decoded = base64.urlsafe_b64decode(f"{raw_cursor}{padding}").decode("utf-8")
        payload = json.loads(decoded)
        sort_value = datetime.fromisoformat(payload["sort_value"])
        case_id = _normalize_case_id(payload["case_id"])
    except (KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
        raise ValidationException(message="Pagination cursor is invalid.") from exc

    return BusinessCaseCursor(sort_value=sort_value, case_id=case_id)


def _normalize_case_id(value: object) -> str:
    case_id = str(value).strip()
    if case_id == "":
        raise ValueError("case_id must not be blank.")
    return case_id


def build_list_result(
    page: BusinessCasePageSlice,
    *,
    sort_value_resolver: Callable[[BusinessCaseListItemResult], datetime],
) -> ListBusinessCasesResult:
    """Map a repository page slice into the public list result DTO."""

    next_cursor = None
    if page.has_more and page.items:
        last_item = page.items[-1]
        next_cursor = encode_cursor(
            BusinessCaseCursor(
                sort_value=sort_value_resolver(last_item),
                case_id=last_item.case_id,
            )
        )

    return ListBusinessCasesResult(
        items=page.items,
        next_cursor=next_cursor,
        available_industries=page.available_industries,
    )


def resolve_published_at(
    *,
    current_status: BusinessCaseStatus | None,
    next_status: BusinessCaseStatus,
    current_published_at: datetime | None,
    now: datetime,
) -> datetime | None:
    """Resolve the persisted published_at value for the next status."""

    if next_status == BusinessCaseStatus.DRAFT:
        return None
    if current_status == BusinessCaseStatus.PUBLISHED and current_published_at is not None:
        return current_published_at
    return now
