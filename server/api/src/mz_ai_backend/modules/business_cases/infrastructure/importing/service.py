from __future__ import annotations

from pathlib import Path
from typing import Protocol
from urllib.parse import urlsplit

from ...application import (
    BusinessCaseDocumentContent,
    CreateBusinessCaseCommand,
    CreateBusinessCaseUseCase,
)
from ...domain import BusinessCaseDocumentType, BusinessCaseStatus, BusinessCaseType
from ..repositories import SqlAlchemyBusinessCaseRepository
from .directory_loader import (
    extract_markdown_image_destinations,
    extract_markdown_title,
    load_case_import_config,
    resolve_local_asset,
    rewrite_markdown_local_images,
)
from .models import (
    CaseImportConfig,
    CaseImportDocumentPayload,
    CaseImportPayload,
    CaseImportResult,
)


class AssetUploader(Protocol):
    """Upload one local asset and return its remote reference."""

    def upload_file(self, *, local_path: Path, object_key: str) -> str: ...


class AssetManager(AssetUploader, Protocol):
    """Upload and delete CloudBase assets used by the importer."""

    def delete_directory(self, *, cloud_directory: str) -> None: ...


class BusinessCaseDirectoryImporter:
    """Import one local case directory by recreating the target business case."""

    def __init__(
        self,
        *,
        business_case_repository: SqlAlchemyBusinessCaseRepository,
        create_use_case: CreateBusinessCaseUseCase,
        asset_manager: AssetManager,
    ) -> None:
        self._business_case_repository = business_case_repository
        self._create_use_case = create_use_case
        self._asset_manager = asset_manager

    async def import_case(self, *, case_dir: Path) -> CaseImportResult:
        """Recreate the target business case from one local case directory."""

        case_config = self._parse_case_source(case_dir=case_dir)
        self._validate_case_source(case_dir=case_dir, case_config=case_config)
        await self._recreate_existing_case(case_id=case_config.case_id)
        payload, uploaded_asset_count = self._publish_case_payload(
            case_dir=case_dir,
            case_config=case_config,
        )
        return await self._persist_case_payload(
            payload=payload,
            uploaded_asset_count=uploaded_asset_count,
        )

    def _parse_case_source(self, *, case_dir: Path) -> CaseImportConfig:
        return load_case_import_config(case_dir)

    def _validate_case_source(
        self,
        *,
        case_dir: Path,
        case_config: CaseImportConfig,
    ) -> None:
        _validate_local_case_assets(case_dir=case_dir, case_config=case_config)

    async def _recreate_existing_case(self, *, case_id: str) -> None:
        existing_case = await self._business_case_repository.get_by_case_id(case_id)
        if existing_case is None:
            await self._business_case_repository.release_connection()
            return

        self._asset_manager.delete_directory(
            cloud_directory=_build_case_cloud_directory(case_id)
        )
        deleted = await self._business_case_repository.hard_delete_by_case_id(case_id)
        if not deleted:
            raise RuntimeError(
                f"Business case '{case_id}' disappeared before recreation."
            )

        await self._business_case_repository.release_connection()

    def _publish_case_payload(
        self,
        *,
        case_dir: Path,
        case_config: CaseImportConfig,
    ) -> tuple[CaseImportPayload, int]:
        asset_publisher = _AssetPublisher(
            case_dir=case_dir,
            case_id=case_config.case_id,
            asset_uploader=self._asset_manager,
        )
        document_payloads = tuple(
            self._build_document_payload(
                case_dir=case_dir,
                document_type=document_type,
                markdown_reference=markdown_reference,
                asset_publisher=asset_publisher,
            )
            for document_type, markdown_reference in _iter_document_import_specs(
                case_config
            )
        )

        payload = CaseImportPayload(
            case_id=case_config.case_id,
            type=case_config.type,
            title=case_config.title,
            summary=case_config.desc,
            summary_markdown=self._build_markdown_content(
                case_dir=case_dir,
                markdown_reference=case_config.summary.file,
                asset_publisher=asset_publisher,
            ),
            data_cutoff_date=case_config.data_cutoff_date,
            freshness_months=case_config.freshness_months,
            industry=case_config.industry,
            tags=case_config.tags,
            cover_image_url=asset_publisher.publish_reference(case_config.cover),
            documents=document_payloads,
        )
        return payload, asset_publisher.uploaded_asset_count

    async def _persist_case_payload(
        self,
        *,
        payload: CaseImportPayload,
        uploaded_asset_count: int,
    ) -> CaseImportResult:
        await self._create_use_case.execute(_build_create_command(payload))
        return CaseImportResult(
            case_id=payload.case_id,
            uploaded_asset_count=uploaded_asset_count,
            title=payload.title,
        )

    def _build_document_payload(
        self,
        *,
        case_dir: Path,
        document_type: BusinessCaseDocumentType,
        markdown_reference: str,
        asset_publisher: "_AssetPublisher",
    ) -> CaseImportDocumentPayload:
        markdown_asset = resolve_local_asset(case_dir, markdown_reference)
        markdown_content = markdown_asset.source_path.read_text(encoding="utf-8")
        title = extract_markdown_title(markdown_content)
        rewritten_markdown = rewrite_markdown_local_images(
            markdown_content,
            resolve_uploaded_url=asset_publisher.publish_reference,
        )
        return CaseImportDocumentPayload(
            document_type=document_type,
            title=title,
            markdown_content=rewritten_markdown,
        )

    def _build_markdown_content(
        self,
        *,
        case_dir: Path,
        markdown_reference: str,
        asset_publisher: "_AssetPublisher",
    ) -> str:
        markdown_asset = resolve_local_asset(case_dir, markdown_reference)
        markdown_content = markdown_asset.source_path.read_text(encoding="utf-8")
        extract_markdown_title(markdown_content)
        return rewrite_markdown_local_images(
            markdown_content,
            resolve_uploaded_url=asset_publisher.publish_reference,
        )


class _AssetPublisher:
    def __init__(
        self,
        *,
        case_dir: Path,
        case_id: str,
        asset_uploader: AssetUploader,
    ) -> None:
        self._case_dir = case_dir
        self._case_id = case_id
        self._asset_uploader = asset_uploader
        self._uploaded_assets: dict[Path, str] = {}

    @property
    def uploaded_asset_count(self) -> int:
        return len(self._uploaded_assets)

    def publish_reference(self, reference: str) -> str:
        resolved_asset = resolve_local_asset(self._case_dir, reference)
        cached_url = self._uploaded_assets.get(resolved_asset.source_path)
        if cached_url is not None:
            return cached_url

        object_key = f"business-cases/{self._case_id}/{resolved_asset.relative_path}"
        uploaded_url = self._asset_uploader.upload_file(
            local_path=resolved_asset.source_path,
            object_key=object_key,
        )
        self._uploaded_assets[resolved_asset.source_path] = uploaded_url
        return uploaded_url


def _build_create_command(payload: CaseImportPayload) -> CreateBusinessCaseCommand:
    return CreateBusinessCaseCommand(
        case_id=payload.case_id,
        type=payload.type,
        title=payload.title,
        summary=payload.summary,
        summary_markdown=payload.summary_markdown,
        data_cutoff_date=payload.data_cutoff_date,
        freshness_months=payload.freshness_months,
        industry=payload.industry,
        tags=payload.tags,
        cover_image_url=payload.cover_image_url,
        status=BusinessCaseStatus.PUBLISHED,
        documents=tuple(
            BusinessCaseDocumentContent(
                document_type=document.document_type,
                title=document.title,
                markdown_content=document.markdown_content,
            )
            for document in payload.documents
        ),
    )


def _validate_local_case_assets(*, case_dir: Path, case_config: CaseImportConfig) -> None:
    resolve_local_asset(case_dir, case_config.cover)
    if case_config.business_model is None:
        raise ValueError("Import is missing business_model configuration.")

    document_references = [
        case_config.summary.file,
        case_config.rework.file,
        case_config.market.file,
        case_config.business_model.file,
        case_config.ai_driven_analysis.file,
    ]
    if case_config.type == BusinessCaseType.PROJECT:
        if case_config.how_to_do is None:
            raise ValueError("Project import is missing how_to_do configuration.")
        document_references.append(case_config.how_to_do.file)

    for document_reference in document_references:
        markdown_asset = resolve_local_asset(case_dir, document_reference)
        markdown_content = markdown_asset.source_path.read_text(encoding="utf-8")
        extract_markdown_title(markdown_content)
        for destination in extract_markdown_image_destinations(markdown_content):
            if urlsplit(destination).scheme == "":
                resolve_local_asset(case_dir, destination)


def _build_case_cloud_directory(case_id: str) -> str:
    return f"business-cases/{case_id}"


def _iter_document_import_specs(
    case_config: CaseImportConfig,
) -> tuple[tuple[BusinessCaseDocumentType, str], ...]:
    if case_config.business_model is None:
        raise ValueError("Import is missing business_model configuration.")

    document_specs = [
        (BusinessCaseDocumentType.BUSINESS_CASE, case_config.rework.file),
        (BusinessCaseDocumentType.MARKET_RESEARCH, case_config.market.file),
        (BusinessCaseDocumentType.BUSINESS_MODEL, case_config.business_model.file),
        (
            BusinessCaseDocumentType.AI_BUSINESS_UPGRADE,
            case_config.ai_driven_analysis.file,
        ),
    ]
    if case_config.type == BusinessCaseType.PROJECT:
        if case_config.how_to_do is None:
            raise ValueError("Project import is missing how_to_do configuration.")
        document_specs.append(
            (BusinessCaseDocumentType.HOW_TO_DO, case_config.how_to_do.file)
        )

    return tuple(document_specs)
