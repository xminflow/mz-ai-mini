from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import Select, and_, desc, or_, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.core.exceptions import InternalServerException

from ..application.dtos import (
    BloggerInsightCursor,
    BloggerInsightListItemResult,
    BloggerInsightPageSlice,
    BloggerInsightUpsertCommand,
)
from ..domain import (
    BloggerInsight,
    BloggerInsightPlatform,
    BloggerInsightStatus,
)
from .models import BloggerInsightModel


_AVAILABLE_PLATFORMS = tuple(platform.value for platform in BloggerInsightPlatform)


def _normalize_tags(tags: object) -> tuple[str, ...]:
    if tags is None:
        return ()
    if not isinstance(tags, list):
        raise InternalServerException(message="Blogger insight tags are invalid.")

    normalized: list[str] = []
    for tag in tags:
        if not isinstance(tag, str):
            raise InternalServerException(message="Blogger insight tags are invalid.")
        stripped = tag.strip()
        if stripped == "":
            continue
        normalized.append(stripped)
    return tuple(normalized)


def _normalize_platform(value: object) -> BloggerInsightPlatform:
    if not isinstance(value, str):
        raise InternalServerException(message="Blogger insight platform is invalid.")
    try:
        return BloggerInsightPlatform(value)
    except ValueError as exc:
        raise InternalServerException(
            message="Blogger insight platform is invalid."
        ) from exc


def _normalize_status(value: object) -> BloggerInsightStatus:
    if not isinstance(value, str):
        raise InternalServerException(message="Blogger insight status is invalid.")
    try:
        return BloggerInsightStatus(value)
    except ValueError as exc:
        raise InternalServerException(
            message="Blogger insight status is invalid."
        ) from exc


def _normalize_report_summary(value: object) -> dict[str, Any] | None:
    if value is None:
        return None
    if not isinstance(value, dict):
        raise InternalServerException(
            message="Blogger insight report summary is invalid."
        )
    return value


def _escape_like(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def _to_list_item(model: BloggerInsightModel) -> BloggerInsightListItemResult:
    return BloggerInsightListItemResult(
        slug=model.slug,
        platform=_normalize_platform(model.platform),
        display_name=model.display_name,
        avatar_url=model.avatar_url,
        fans_count=model.fans_count,
        total_works_count=model.total_works_count,
        industry=model.industry,
        positioning=model.positioning,
        tags=_normalize_tags(model.tags),
        cover_image_url=model.cover_image_url,
        is_free=model.is_free,
        status=_normalize_status(model.status),
        captured_at=model.captured_at,
        published_at=model.published_at,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _to_aggregate(model: BloggerInsightModel) -> BloggerInsight:
    return BloggerInsight(
        slug=model.slug,
        platform=_normalize_platform(model.platform),
        display_name=model.display_name,
        avatar_url=model.avatar_url,
        signature=model.signature,
        fans_count=model.fans_count,
        total_works_count=model.total_works_count,
        industry=model.industry,
        positioning=model.positioning,
        tags=_normalize_tags(model.tags),
        cover_image_url=model.cover_image_url,
        is_free=model.is_free,
        status=_normalize_status(model.status),
        captured_at=model.captured_at,
        published_at=model.published_at,
        created_at=model.created_at,
        updated_at=model.updated_at,
        report_html=model.report_html,
        report_summary=_normalize_report_summary(model.report_summary),
        source_run_id=model.source_run_id,
        is_deleted=model.is_deleted,
    )


def _apply_cursor(
    statement: Select[tuple[BloggerInsightModel]],
    *,
    cursor: BloggerInsightCursor | None,
) -> Select[tuple[BloggerInsightModel]]:
    if cursor is None:
        return statement
    # 排序键 (is_free DESC, published_at DESC, slug DESC) 下的严格“小于游标”比较。
    # is_free DESC 意味着 True 在前，因此“下一项”要么 is_free=False（cursor.is_free=True 时），
    # 要么同 is_free 下时间更早，要么同 is_free 同时间下 slug 更小。
    return statement.where(
        or_(
            BloggerInsightModel.is_free < cursor.is_free,
            and_(
                BloggerInsightModel.is_free == cursor.is_free,
                BloggerInsightModel.published_at < cursor.sort_value,
            ),
            and_(
                BloggerInsightModel.is_free == cursor.is_free,
                BloggerInsightModel.published_at == cursor.sort_value,
                BloggerInsightModel.slug < cursor.slug,
            ),
        )
    )


class SqlAlchemyBloggerInsightRepository:
    """通过 SQLAlchemy 持久化博主洞察聚合。"""

    def __init__(self, *, session: AsyncSession) -> None:
        self._session = session

    async def get_by_slug(self, slug: str) -> BloggerInsight | None:
        statement = select(BloggerInsightModel).where(
            BloggerInsightModel.slug == slug,
            BloggerInsightModel.is_deleted.is_(False),
        )
        result = await self._session.execute(statement)
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return _to_aggregate(model)

    async def upsert(
        self,
        *,
        command: BloggerInsightUpsertCommand,
        now: datetime,
    ) -> BloggerInsight:
        statement = select(BloggerInsightModel).where(
            BloggerInsightModel.slug == command.slug
        )
        result = await self._session.execute(statement)
        model = result.scalar_one_or_none()

        published_at = (
            now
            if command.status == BloggerInsightStatus.PUBLISHED
            else None
        )

        if model is None:
            model = BloggerInsightModel(
                slug=command.slug,
                platform=command.platform.value,
                display_name=command.display_name,
                avatar_url=command.avatar_url,
                signature=command.signature,
                fans_count=command.fans_count,
                total_works_count=command.total_works_count,
                industry=command.industry,
                positioning=command.positioning,
                tags=list(command.tags),
                cover_image_url=command.cover_image_url,
                report_html=command.report_html,
                report_summary=command.report_summary,
                source_run_id=command.source_run_id,
                captured_at=command.captured_at,
                published_at=published_at,
                is_free=command.is_free,
                status=command.status.value,
                is_deleted=False,
            )
            self._session.add(model)
        else:
            model.platform = command.platform.value
            model.display_name = command.display_name
            model.avatar_url = command.avatar_url
            model.signature = command.signature
            model.fans_count = command.fans_count
            model.total_works_count = command.total_works_count
            model.industry = command.industry
            model.positioning = command.positioning
            model.tags = list(command.tags)
            model.cover_image_url = command.cover_image_url
            model.report_html = command.report_html
            model.report_summary = command.report_summary
            model.source_run_id = command.source_run_id
            model.captured_at = command.captured_at
            model.is_free = command.is_free
            model.status = command.status.value
            model.is_deleted = False
            if command.status == BloggerInsightStatus.PUBLISHED and model.published_at is None:
                model.published_at = published_at

        await self._commit_or_raise("Failed to upsert blogger insight.")

        refreshed = await self.get_by_slug(command.slug)
        if refreshed is None:
            raise InternalServerException(
                message="Blogger insight disappeared after upsert.",
                details={"slug": command.slug},
            )
        return refreshed

    async def list_public(
        self,
        *,
        limit: int,
        cursor: BloggerInsightCursor | None,
        platform: BloggerInsightPlatform | None,
        industry: str | None,
        keyword: str | None,
    ) -> BloggerInsightPageSlice:
        statement = select(BloggerInsightModel).where(
            BloggerInsightModel.is_deleted.is_(False),
            BloggerInsightModel.status == BloggerInsightStatus.PUBLISHED.value,
            BloggerInsightModel.published_at.is_not(None),
        )
        if platform is not None:
            statement = statement.where(BloggerInsightModel.platform == platform.value)
        if industry is not None:
            statement = statement.where(BloggerInsightModel.industry == industry)
        if keyword is not None:
            pattern = f"%{_escape_like(keyword)}%"
            statement = statement.where(
                or_(
                    BloggerInsightModel.display_name.ilike(pattern, escape="\\"),
                    BloggerInsightModel.positioning.ilike(pattern, escape="\\"),
                    BloggerInsightModel.signature.ilike(pattern, escape="\\"),
                )
            )

        statement = _apply_cursor(statement, cursor=cursor).order_by(
            desc(BloggerInsightModel.is_free),
            desc(BloggerInsightModel.published_at),
            desc(BloggerInsightModel.slug),
        ).limit(limit + 1)

        result = await self._session.execute(statement)
        models = result.scalars().all()
        items = tuple(_to_list_item(model) for model in models[:limit])

        industries_statement = (
            select(BloggerInsightModel.industry)
            .where(
                BloggerInsightModel.is_deleted.is_(False),
                BloggerInsightModel.status == BloggerInsightStatus.PUBLISHED.value,
                BloggerInsightModel.industry.is_not(None),
            )
            .distinct()
        )
        industries_result = await self._session.execute(industries_statement)
        available_industries = tuple(
            row for row in industries_result.scalars().all() if row is not None
        )

        return BloggerInsightPageSlice(
            items=items,
            has_more=len(models) > limit,
            available_platforms=_AVAILABLE_PLATFORMS,
            available_industries=available_industries,
        )

    async def _commit_or_raise(self, message: str) -> None:
        try:
            await self._session.commit()
        except SQLAlchemyError as exc:
            await self._session.rollback()
            raise InternalServerException(message=message) from exc
