from __future__ import annotations

from pathlib import Path
from typing import Protocol
from urllib.parse import urlsplit

from ...application import (
    BusinessCaseDocumentContent,
    CreateBusinessCaseCommand,
    CreateBusinessCaseUseCase,
)
from ...domain import BusinessCaseDocumentType, BusinessCaseStatus
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

        case_config = load_case_import_config(case_dir)
        _validate_local_case_assets(case_dir=case_dir, case_config=case_config)
        existing_case = await self._business_case_repository.get_by_case_id(
            case_config.case_id
        )
        if existing_case is not None:
            self._asset_manager.delete_directory(
                cloud_directory=_build_case_cloud_directory(case_config.case_id)
            )
            deleted = await self._business_case_repository.hard_delete_by_case_id(
                case_config.case_id
            )
            if not deleted:
                raise RuntimeError(
                    f"Business case '{case_config.case_id}' disappeared before recreation."
                )

        asset_publisher = _AssetPublisher(
            case_dir=case_dir,
            case_id=case_config.case_id,
            asset_uploader=self._asset_manager,
        )
        payload = CaseImportPayload(
            case_id=case_config.case_id,
            title=case_config.title,
            summary=case_config.desc,
            industry=case_config.industry,
            tags=case_config.tags,
            cover_image_url=asset_publisher.publish_reference(case_config.cover),
            documents=(
                self._build_document_payload(
                    case_dir=case_dir,
                    document_type=BusinessCaseDocumentType.BUSINESS_CASE,
                    markdown_reference=case_config.rework.file,
                    asset_publisher=asset_publisher,
                ),
                self._build_document_payload(
                    case_dir=case_dir,
                    document_type=BusinessCaseDocumentType.MARKET_RESEARCH,
                    markdown_reference=case_config.market.file,
                    asset_publisher=asset_publisher,
                ),
                self._build_document_payload(
                    case_dir=case_dir,
                    document_type=BusinessCaseDocumentType.AI_BUSINESS_UPGRADE,
                    markdown_reference=case_config.ai_driven_analysis.file,
                    asset_publisher=asset_publisher,
                ),
            ),
        )

        await self._create_use_case.execute(_build_create_command(payload))

        return CaseImportResult(
            case_id=payload.case_id,
            uploaded_asset_count=asset_publisher.uploaded_asset_count,
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
        title=payload.title,
        summary=payload.summary,
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
    for document_config in (
        case_config.rework,
        case_config.market,
        case_config.ai_driven_analysis,
    ):
        markdown_asset = resolve_local_asset(case_dir, document_config.file)
        markdown_content = markdown_asset.source_path.read_text(encoding="utf-8")
        extract_markdown_title(markdown_content)
        for destination in extract_markdown_image_destinations(markdown_content):
            if urlsplit(destination).scheme == "":
                resolve_local_asset(case_dir, destination)


def _build_case_cloud_directory(case_id: str) -> str:
    return f"business-cases/{case_id}"
