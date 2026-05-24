from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import Select, and_, desc, or_, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.core.exceptions import InternalServerException

from ..application.dtos import (
    TrackAnalysisCursor,
    TrackAnalysisListItemResult,
    TrackAnalysisPageSlice,
    TrackAnalysisUpsertCommand,
)
from ..domain import (
    TrackAnalysis,
    TrackAnalysisStatus,
    TrackReport,
    TrackReportMeta,
)
from .models import TrackAnalysisModel


def _normalize_tags(tags: object) -> tuple[str, ...]:
    if tags is None:
        return ()
    if not isinstance(tags, list):
        raise InternalServerException(message="Track analysis tags are invalid.")

    normalized: list[str] = []
    for tag in tags:
        if not isinstance(tag, str):
            raise InternalServerException(message="Track analysis tags are invalid.")
        stripped = tag.strip()
        if stripped == "":
            continue
        normalized.append(stripped)
    return tuple(normalized)


def _normalize_status(value: object) -> TrackAnalysisStatus:
    if not isinstance(value, str):
        raise InternalServerException(message="Track analysis status is invalid.")
    try:
        return TrackAnalysisStatus(value)
    except ValueError as exc:
        raise InternalServerException(
            message="Track analysis status is invalid."
        ) from exc


def _normalize_key_numbers(value: object) -> dict[str, float] | None:
    if value is None:
        return None
    if not isinstance(value, dict):
        raise InternalServerException(
            message="Track analysis key_numbers payload is invalid."
        )
    normalized: dict[str, float] = {}
    for key, raw in value.items():
        if not isinstance(key, str):
            raise InternalServerException(
                message="Track analysis key_numbers payload is invalid."
            )
        if isinstance(raw, bool):
            raise InternalServerException(
                message="Track analysis key_numbers payload is invalid."
            )
        if not isinstance(raw, (int, float)):
            raise InternalServerException(
                message="Track analysis key_numbers payload is invalid."
            )
        normalized[key] = float(raw)
    return normalized


def _normalize_reports(
    reports: object,
    report_order: object,
) -> tuple[tuple[TrackReport, ...], tuple[TrackReportMeta, ...]]:
    if not isinstance(reports, dict):
        raise InternalServerException(
            message="Track analysis reports payload is invalid."
        )
    if not isinstance(report_order, list):
        raise InternalServerException(
            message="Track analysis report_order payload is invalid."
        )

    keys: list[str] = []
    for raw_key in report_order:
        if not isinstance(raw_key, str) or raw_key.strip() == "":
            raise InternalServerException(
                message="Track analysis report_order payload is invalid."
            )
        keys.append(raw_key)

    if not keys:
        keys = list(reports.keys())

    items: list[TrackReport] = []
    metas: list[TrackReportMeta] = []
    for key in keys:
        if key not in reports:
            raise InternalServerException(
                message="Track analysis report_order references missing key.",
                details={"key": key},
            )
        payload = reports[key]
        if not isinstance(payload, dict):
            raise InternalServerException(
                message="Track analysis report payload is invalid.",
                details={"key": key},
            )
        try:
            title = str(payload["title"])
            type_ = str(payload["type"])
            sections = int(payload["sections"])
            charts = int(payload["charts"])
            description = str(payload["description"])
            html = str(payload["html"])
        except (KeyError, TypeError, ValueError) as exc:
            raise InternalServerException(
                message="Track analysis report payload is invalid.",
                details={"key": key},
            ) from exc

        items.append(
            TrackReport(
                key=key,
                title=title,
                type=type_,
                sections=sections,
                charts=charts,
                description=description,
                html=html,
            )
        )
        metas.append(
            TrackReportMeta(
                key=key,
                title=title,
                type=type_,
                sections=sections,
                charts=charts,
                description=description,
            )
        )

    return tuple(items), tuple(metas)


def _escape_like(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def _to_aggregate(model: TrackAnalysisModel) -> TrackAnalysis:
    reports, metas = _normalize_reports(model.reports, model.report_order)
    return TrackAnalysis(
        slug=model.slug,
        track_keyword=model.track_keyword,
        region=model.region,
        audience=model.audience,
        industry=model.industry,
        stance=model.stance,
        stance_summary=model.stance_summary,
        cover_image_url=model.cover_image_url,
        tags=_normalize_tags(model.tags),
        key_numbers=_normalize_key_numbers(model.key_numbers),
        data_sources_count=model.data_sources_count,
        is_free=model.is_free,
        status=_normalize_status(model.status),
        captured_at=model.captured_at,
        published_at=model.published_at,
        created_at=model.created_at,
        updated_at=model.updated_at,
        report_metas=metas,
        source_run_id=model.source_run_id,
        reports=reports,
        is_deleted=model.is_deleted,
    )


def _to_list_item(model: TrackAnalysisModel) -> TrackAnalysisListItemResult:
    _, metas = _normalize_reports(model.reports, model.report_order)
    return TrackAnalysisListItemResult(
        slug=model.slug,
        track_keyword=model.track_keyword,
        region=model.region,
        audience=model.audience,
        industry=model.industry,
        stance=model.stance,
        stance_summary=model.stance_summary,
        cover_image_url=model.cover_image_url,
        tags=_normalize_tags(model.tags),
        key_numbers=_normalize_key_numbers(model.key_numbers),
        data_sources_count=model.data_sources_count,
        is_free=model.is_free,
        status=_normalize_status(model.status),
        captured_at=model.captured_at,
        published_at=model.published_at,
        created_at=model.created_at,
        updated_at=model.updated_at,
        report_metas=metas,
    )


def _apply_cursor(
    statement: Select[tuple[TrackAnalysisModel]],
    *,
    cursor: TrackAnalysisCursor | None,
) -> Select[tuple[TrackAnalysisModel]]:
    if cursor is None:
        return statement
    # 排序键 (is_free DESC, published_at DESC, slug DESC) 下的严格“小于游标”比较。
    # is_free DESC 意味着 True 在前，因此“下一项”要么 is_free=False（cursor.is_free=True 时），
    # 要么同 is_free 下时间更早，要么同 is_free 同时间下 slug 更小。
    return statement.where(
        or_(
            TrackAnalysisModel.is_free < cursor.is_free,
            and_(
                TrackAnalysisModel.is_free == cursor.is_free,
                TrackAnalysisModel.published_at < cursor.sort_value,
            ),
            and_(
                TrackAnalysisModel.is_free == cursor.is_free,
                TrackAnalysisModel.published_at == cursor.sort_value,
                TrackAnalysisModel.slug < cursor.slug,
            ),
        )
    )


def _build_reports_payload(
    command: TrackAnalysisUpsertCommand,
) -> tuple[dict[str, Any], list[str]]:
    reports_obj: dict[str, Any] = {}
    order: list[str] = []
    for report in command.reports:
        key = report.key
        if key in reports_obj:
            raise InternalServerException(
                message="Duplicate report key in upsert payload.",
                details={"key": key},
            )
        reports_obj[key] = {
            "title": report.title,
            "type": report.type,
            "sections": report.sections,
            "charts": report.charts,
            "description": report.description,
            "html": report.html,
        }
        order.append(key)
    return reports_obj, order


class SqlAlchemyTrackAnalysisRepository:
    """通过 SQLAlchemy 持久化赛道分析聚合。"""

    def __init__(self, *, session: AsyncSession) -> None:
        self._session = session

    async def get_by_slug(self, slug: str) -> TrackAnalysis | None:
        statement = select(TrackAnalysisModel).where(
            TrackAnalysisModel.slug == slug,
            TrackAnalysisModel.is_deleted.is_(False),
        )
        result = await self._session.execute(statement)
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return _to_aggregate(model)

    async def upsert(
        self,
        *,
        command: TrackAnalysisUpsertCommand,
        now: datetime,
    ) -> TrackAnalysis:
        statement = select(TrackAnalysisModel).where(
            TrackAnalysisModel.slug == command.slug
        )
        result = await self._session.execute(statement)
        model = result.scalar_one_or_none()

        reports_payload, report_order = _build_reports_payload(command)
        published_at = (
            now if command.status == TrackAnalysisStatus.PUBLISHED else None
        )

        if model is None:
            model = TrackAnalysisModel(
                slug=command.slug,
                track_keyword=command.track_keyword,
                region=command.region,
                audience=command.audience,
                industry=command.industry,
                stance=command.stance,
                stance_summary=command.stance_summary,
                cover_image_url=command.cover_image_url,
                tags=list(command.tags),
                key_numbers=command.key_numbers,
                reports=reports_payload,
                report_order=report_order,
                data_sources_count=command.data_sources_count,
                source_run_id=command.source_run_id,
                captured_at=command.captured_at,
                published_at=published_at,
                is_free=command.is_free,
                status=command.status.value,
                is_deleted=False,
            )
            self._session.add(model)
        else:
            model.track_keyword = command.track_keyword
            model.region = command.region
            model.audience = command.audience
            model.industry = command.industry
            model.stance = command.stance
            model.stance_summary = command.stance_summary
            model.cover_image_url = command.cover_image_url
            model.tags = list(command.tags)
            model.key_numbers = command.key_numbers
            model.reports = reports_payload
            model.report_order = report_order
            model.data_sources_count = command.data_sources_count
            model.source_run_id = command.source_run_id
            model.captured_at = command.captured_at
            model.is_free = command.is_free
            model.status = command.status.value
            model.is_deleted = False
            if (
                command.status == TrackAnalysisStatus.PUBLISHED
                and model.published_at is None
            ):
                model.published_at = published_at

        await self._commit_or_raise("Failed to upsert track analysis.")

        refreshed = await self.get_by_slug(command.slug)
        if refreshed is None:
            raise InternalServerException(
                message="Track analysis disappeared after upsert.",
                details={"slug": command.slug},
            )
        return refreshed

    async def list_public(
        self,
        *,
        limit: int,
        cursor: TrackAnalysisCursor | None,
        industry: str | None,
        stance: str | None,
        keyword: str | None,
    ) -> TrackAnalysisPageSlice:
        statement = select(TrackAnalysisModel).where(
            TrackAnalysisModel.is_deleted.is_(False),
            TrackAnalysisModel.status == TrackAnalysisStatus.PUBLISHED.value,
            TrackAnalysisModel.published_at.is_not(None),
        )
        if industry is not None:
            statement = statement.where(TrackAnalysisModel.industry == industry)
        if stance is not None:
            statement = statement.where(TrackAnalysisModel.stance == stance)
        if keyword is not None:
            pattern = f"%{_escape_like(keyword)}%"
            statement = statement.where(
                or_(
                    TrackAnalysisModel.track_keyword.ilike(pattern, escape="\\"),
                    TrackAnalysisModel.stance_summary.ilike(pattern, escape="\\"),
                    TrackAnalysisModel.industry.ilike(pattern, escape="\\"),
                )
            )

        statement = _apply_cursor(statement, cursor=cursor).order_by(
            desc(TrackAnalysisModel.is_free),
            desc(TrackAnalysisModel.published_at),
            desc(TrackAnalysisModel.slug),
        ).limit(limit + 1)

        result = await self._session.execute(statement)
        models = result.scalars().all()
        items = tuple(_to_list_item(model) for model in models[:limit])

        industries_statement = (
            select(TrackAnalysisModel.industry)
            .where(
                TrackAnalysisModel.is_deleted.is_(False),
                TrackAnalysisModel.status == TrackAnalysisStatus.PUBLISHED.value,
                TrackAnalysisModel.industry.is_not(None),
            )
            .distinct()
        )
        industries_result = await self._session.execute(industries_statement)
        available_industries = tuple(
            row for row in industries_result.scalars().all() if row is not None
        )

        stances_statement = (
            select(TrackAnalysisModel.stance)
            .where(
                TrackAnalysisModel.is_deleted.is_(False),
                TrackAnalysisModel.status == TrackAnalysisStatus.PUBLISHED.value,
                TrackAnalysisModel.stance.is_not(None),
            )
            .distinct()
        )
        stances_result = await self._session.execute(stances_statement)
        available_stances = tuple(
            row for row in stances_result.scalars().all() if row is not None
        )

        return TrackAnalysisPageSlice(
            items=items,
            has_more=len(models) > limit,
            available_industries=available_industries,
            available_stances=available_stances,
        )

    async def _commit_or_raise(self, message: str) -> None:
        try:
            await self._session.commit()
        except SQLAlchemyError as exc:
            await self._session.rollback()
            raise InternalServerException(message=message) from exc
