from __future__ import annotations
from collections.abc import Iterable
from datetime import datetime

from sqlalchemy import Select, and_, desc, or_, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.core.exceptions import InternalServerException

from ..application.dtos import (
    BusinessCaseCursor,
    BusinessCaseListItemResult,
    BusinessCasePageSlice,
    BusinessCaseRegistration,
    BusinessCaseReplacement,
)
from ..domain import (
    BusinessCase,
    BusinessCaseDocument,
    BusinessCaseIndustry,
    BusinessCaseDocumentType,
    BusinessCaseDocuments,
    BusinessCaseStatus,
)
from .models import BusinessCaseDocumentModel, BusinessCaseModel


_AVAILABLE_INDUSTRIES = tuple(industry.value for industry in BusinessCaseIndustry)


def _normalize_loaded_tags(tags: object) -> tuple[str, ...]:
    if not isinstance(tags, list):
        raise InternalServerException(message="Business case tags are invalid.")

    normalized_tags: list[str] = []
    for tag in tags:
        if not isinstance(tag, str):
            raise InternalServerException(message="Business case tags are invalid.")

        normalized_tag = tag.strip()
        if normalized_tag == "":
            raise InternalServerException(message="Business case tags are invalid.")
        normalized_tags.append(normalized_tag)

    return tuple(normalized_tags)


def _normalize_loaded_industry(industry: object) -> BusinessCaseIndustry:
    if not isinstance(industry, str):
        raise InternalServerException(message="Business case industry is invalid.")

    normalized_industry = industry.strip()
    if normalized_industry == "":
        raise InternalServerException(message="Business case industry is invalid.")

    try:
        return BusinessCaseIndustry(normalized_industry)
    except ValueError as exc:
        raise InternalServerException(
            message="Business case industry is invalid."
        ) from exc


def _escape_like_pattern(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def _to_document(model: BusinessCaseDocumentModel) -> BusinessCaseDocument:
    return BusinessCaseDocument(
        document_id=model.document_id,
        document_type=BusinessCaseDocumentType(model.document_type),
        title=model.title,
        markdown_content=model.markdown_content,
        is_deleted=model.is_deleted,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _to_documents(
    document_models: Iterable[BusinessCaseDocumentModel],
    *,
    case_id: str,
) -> BusinessCaseDocuments:
    document_map = {
        BusinessCaseDocumentType(model.document_type): _to_document(model)
        for model in document_models
    }
    required_types = {
        BusinessCaseDocumentType.BUSINESS_CASE,
        BusinessCaseDocumentType.MARKET_RESEARCH,
        BusinessCaseDocumentType.AI_BUSINESS_UPGRADE,
    }
    if set(document_map) != required_types:
        raise InternalServerException(
            message="Business case document set is incomplete.",
            details={"case_id": case_id},
        )

    return BusinessCaseDocuments(
        business_case=document_map[BusinessCaseDocumentType.BUSINESS_CASE],
        market_research=document_map[BusinessCaseDocumentType.MARKET_RESEARCH],
        ai_business_upgrade=document_map[BusinessCaseDocumentType.AI_BUSINESS_UPGRADE],
    )


def _to_aggregate(
    model: BusinessCaseModel,
    document_models: Iterable[BusinessCaseDocumentModel],
) -> BusinessCase:
    return BusinessCase(
        case_id=model.case_id,
        title=model.title,
        summary=model.summary,
        industry=_normalize_loaded_industry(model.industry),
        tags=_normalize_loaded_tags(model.tags),
        cover_image_url=model.cover_image_url,
        status=BusinessCaseStatus(model.status),
        published_at=model.published_at,
        created_at=model.created_at,
        updated_at=model.updated_at,
        documents=_to_documents(document_models, case_id=model.case_id),
        is_deleted=model.is_deleted,
    )


def _to_list_item(model: BusinessCaseModel) -> BusinessCaseListItemResult:
    return BusinessCaseListItemResult(
        case_id=model.case_id,
        title=model.title,
        summary=model.summary,
        industry=_normalize_loaded_industry(model.industry),
        tags=_normalize_loaded_tags(model.tags),
        cover_image_url=model.cover_image_url,
        status=BusinessCaseStatus(model.status),
        published_at=model.published_at,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _apply_cursor(
    statement: Select[tuple[BusinessCaseModel]],
    *,
    sort_column,
    cursor: BusinessCaseCursor | None,
) -> Select[tuple[BusinessCaseModel]]:
    if cursor is None:
        return statement

    return statement.where(
        or_(
            sort_column < cursor.sort_value,
            and_(
                sort_column == cursor.sort_value,
                BusinessCaseModel.case_id < cursor.case_id,
            ),
        )
    )


class SqlAlchemyBusinessCaseRepository:
    """Persist business case aggregates through SQLAlchemy."""

    def __init__(self, *, session: AsyncSession) -> None:
        self._session = session

    async def create(self, registration: BusinessCaseRegistration) -> BusinessCase:
        case_model = BusinessCaseModel(
            case_id=registration.case_id,
            title=registration.title,
            summary=registration.summary,
            industry=registration.industry.value,
            tags=list(registration.tags),
            cover_image_url=registration.cover_image_url,
            status=registration.status.value,
            published_at=registration.published_at,
            is_deleted=False,
        )
        document_models = [
            BusinessCaseDocumentModel(
                document_id=document.document_id,
                case_id=registration.case_id,
                document_type=document.document_type.value,
                title=document.title,
                markdown_content=document.markdown_content,
                is_deleted=False,
            )
            for document in registration.documents
        ]

        self._session.add(case_model)
        self._session.add_all(document_models)
        await self._commit_or_raise("Failed to create business case.")
        aggregate = await self.get_by_case_id(registration.case_id)
        if aggregate is None:
            raise InternalServerException(
                message="Business case disappeared after creation.",
                details={"case_id": registration.case_id},
            )
        return aggregate

    async def get_by_case_id(self, case_id: str) -> BusinessCase | None:
        case_statement = select(BusinessCaseModel).where(
            BusinessCaseModel.case_id == case_id,
            BusinessCaseModel.is_deleted.is_(False),
        )
        case_result = await self._session.execute(case_statement)
        case_model = case_result.scalar_one_or_none()
        if case_model is None:
            return None

        document_statement = select(BusinessCaseDocumentModel).where(
            BusinessCaseDocumentModel.case_id == case_id,
            BusinessCaseDocumentModel.is_deleted.is_(False),
        )
        document_result = await self._session.execute(document_statement)
        document_models = document_result.scalars().all()
        return _to_aggregate(case_model, document_models)

    async def replace(self, replacement: BusinessCaseReplacement) -> BusinessCase | None:
        case_statement = select(BusinessCaseModel).where(
            BusinessCaseModel.case_id == replacement.case_id,
            BusinessCaseModel.is_deleted.is_(False),
        )
        case_result = await self._session.execute(case_statement)
        case_model = case_result.scalar_one_or_none()
        if case_model is None:
            return None

        document_statement = select(BusinessCaseDocumentModel).where(
            BusinessCaseDocumentModel.case_id == replacement.case_id,
            BusinessCaseDocumentModel.is_deleted.is_(False),
        )
        document_result = await self._session.execute(document_statement)
        document_models = document_result.scalars().all()
        document_model_map = {
            BusinessCaseDocumentType(model.document_type): model for model in document_models
        }

        required_types = {
            BusinessCaseDocumentType.BUSINESS_CASE,
            BusinessCaseDocumentType.MARKET_RESEARCH,
            BusinessCaseDocumentType.AI_BUSINESS_UPGRADE,
        }
        if set(document_model_map) != required_types:
            raise InternalServerException(
                message="Business case document set is incomplete.",
                details={"case_id": replacement.case_id},
            )

        case_model.title = replacement.title
        case_model.summary = replacement.summary
        case_model.industry = replacement.industry.value
        case_model.tags = list(replacement.tags)
        case_model.cover_image_url = replacement.cover_image_url
        case_model.status = replacement.status.value
        case_model.published_at = replacement.published_at

        for document in replacement.documents:
            model = document_model_map[document.document_type]
            model.title = document.title
            model.markdown_content = document.markdown_content

        await self._commit_or_raise("Failed to replace business case.")
        return await self.get_by_case_id(replacement.case_id)

    async def delete(self, case_id: str) -> bool:
        case_statement = select(BusinessCaseModel).where(
            BusinessCaseModel.case_id == case_id,
            BusinessCaseModel.is_deleted.is_(False),
        )
        case_result = await self._session.execute(case_statement)
        case_model = case_result.scalar_one_or_none()
        if case_model is None:
            return False

        document_statement = select(BusinessCaseDocumentModel).where(
            BusinessCaseDocumentModel.case_id == case_id,
            BusinessCaseDocumentModel.is_deleted.is_(False),
        )
        document_result = await self._session.execute(document_statement)
        document_models = document_result.scalars().all()

        case_model.is_deleted = True
        for document_model in document_models:
            document_model.is_deleted = True

        await self._commit_or_raise("Failed to delete business case.")
        return True

    async def hard_delete_by_case_id(self, case_id: str) -> bool:
        case_statement = select(BusinessCaseModel).where(
            BusinessCaseModel.case_id == case_id
        )
        case_result = await self._session.execute(case_statement)
        case_model = case_result.scalar_one_or_none()
        if case_model is None:
            return False

        document_statement = select(BusinessCaseDocumentModel).where(
            BusinessCaseDocumentModel.case_id == case_id
        )
        document_result = await self._session.execute(document_statement)
        document_models = document_result.scalars().all()

        for document_model in document_models:
            await self._session.delete(document_model)
        await self._session.delete(case_model)

        await self._commit_or_raise("Failed to hard delete business case.")
        return True

    async def list_admin(
        self,
        *,
        limit: int,
        cursor: BusinessCaseCursor | None,
        status: BusinessCaseStatus | None,
    ) -> BusinessCasePageSlice:
        statement = select(BusinessCaseModel).where(
            BusinessCaseModel.is_deleted.is_(False)
        )
        if status is not None:
            statement = statement.where(BusinessCaseModel.status == status.value)

        statement = _apply_cursor(
            statement,
            sort_column=BusinessCaseModel.created_at,
            cursor=cursor,
        ).order_by(
            desc(BusinessCaseModel.created_at),
            desc(BusinessCaseModel.case_id),
        ).limit(limit + 1)

        result = await self._session.execute(statement)
        models = result.scalars().all()
        items = tuple(_to_list_item(model) for model in models[:limit])
        return BusinessCasePageSlice(items=items, has_more=len(models) > limit)

    async def list_public(
        self,
        *,
        limit: int,
        cursor: BusinessCaseCursor | None,
        industry: BusinessCaseIndustry | None,
        keyword: str | None,
    ) -> BusinessCasePageSlice:
        statement = self._build_public_list_statement(
            industry=industry,
            keyword=keyword,
        )
        statement = _apply_cursor(
            statement,
            sort_column=BusinessCaseModel.published_at,
            cursor=cursor,
        ).order_by(
            desc(BusinessCaseModel.published_at),
            desc(BusinessCaseModel.case_id),
        ).limit(limit + 1)

        result = await self._session.execute(statement)
        models = result.scalars().all()
        items = tuple(_to_list_item(model) for model in models[:limit])
        return BusinessCasePageSlice(
            items=items,
            has_more=len(models) > limit,
            available_industries=_AVAILABLE_INDUSTRIES,
        )

    def _build_public_list_statement(
        self,
        *,
        industry: BusinessCaseIndustry | None,
        keyword: str | None,
    ) -> Select[tuple[BusinessCaseModel]]:
        statement = select(BusinessCaseModel).where(
            BusinessCaseModel.is_deleted.is_(False),
            BusinessCaseModel.status == BusinessCaseStatus.PUBLISHED.value,
            BusinessCaseModel.published_at.is_not(None),
        )
        if industry is not None:
            statement = statement.where(BusinessCaseModel.industry == industry.value)

        if keyword is None:
            return statement

        keyword_pattern = f"%{_escape_like_pattern(keyword)}%"
        document_match_exists = (
            select(BusinessCaseDocumentModel.case_id)
            .where(
                BusinessCaseDocumentModel.case_id == BusinessCaseModel.case_id,
                BusinessCaseDocumentModel.is_deleted.is_(False),
                or_(
                    BusinessCaseDocumentModel.title.like(
                        keyword_pattern,
                        escape="\\",
                    ),
                    BusinessCaseDocumentModel.markdown_content.like(
                        keyword_pattern,
                        escape="\\",
                    ),
                ),
            )
            .exists()
        )
        return statement.where(
            or_(
                BusinessCaseModel.title.like(keyword_pattern, escape="\\"),
                BusinessCaseModel.summary.like(keyword_pattern, escape="\\"),
                document_match_exists,
            )
        )

    async def _commit_or_raise(self, message: str) -> None:
        try:
            await self._session.commit()
        except SQLAlchemyError as exc:
            await self._session.rollback()
            raise InternalServerException(message=message) from exc
