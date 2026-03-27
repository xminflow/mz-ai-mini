from __future__ import annotations

from pathlib import Path
from typing import Protocol

from ...application import (
    BusinessCaseDocumentContent,
    CreateBusinessCaseCommand,
    CreateBusinessCaseUseCase,
    ReplaceBusinessCaseCommand,
    ReplaceBusinessCaseUseCase,
)
from ...domain import BusinessCaseDocumentType, BusinessCaseStatus
from ..repositories import SqlAlchemyBusinessCaseRepository
from .directory_loader import (
    extract_markdown_title,
    load_case_import_config,
    resolve_local_asset,
    rewrite_markdown_local_images,
)
from .models import CaseImportDocumentPayload, CaseImportPayload, CaseImportResult


class AssetUploader(Protocol):
    """Upload one local asset and return its remote reference."""

    def upload_file(self, *, local_path: Path, object_key: str) -> str: ...


class BusinessCaseDirectoryImporter:
    """Import one local case directory into an existing business case."""

    def __init__(
        self,
        *,
        business_case_repository: SqlAlchemyBusinessCaseRepository,
        create_use_case: CreateBusinessCaseUseCase,
        replace_use_case: ReplaceBusinessCaseUseCase,
        asset_uploader: AssetUploader,
    ) -> None:
        self._business_case_repository = business_case_repository
        self._create_use_case = create_use_case
        self._replace_use_case = replace_use_case
        self._asset_uploader = asset_uploader

    async def import_case(self, *, case_dir: Path) -> CaseImportResult:
        """Upload assets, then create or replace the target business case."""

        case_config = load_case_import_config(case_dir)
        existing_case = await self._business_case_repository.get_by_case_id(
            case_config.case_id
        )

        asset_publisher = _AssetPublisher(
            case_dir=case_dir,
            case_id=case_config.case_id,
            asset_uploader=self._asset_uploader,
        )
        payload = CaseImportPayload(
            case_id=case_config.case_id,
            title=case_config.title,
            summary=case_config.desc,
            tags=case_config.tags,
            cover_image_url=asset_publisher.publish_reference(case_config.cover),
            documents=(
                self._build_document_payload(
                    case_dir=case_dir,
                    document_type=BusinessCaseDocumentType.BUSINESS_CASE,
                    markdown_reference=case_config.rework.file,
                    cover_reference=case_config.rework.cover,
                    asset_publisher=asset_publisher,
                ),
                self._build_document_payload(
                    case_dir=case_dir,
                    document_type=BusinessCaseDocumentType.MARKET_RESEARCH,
                    markdown_reference=case_config.market.file,
                    cover_reference=case_config.market.cover,
                    asset_publisher=asset_publisher,
                ),
                self._build_document_payload(
                    case_dir=case_dir,
                    document_type=BusinessCaseDocumentType.AI_BUSINESS_UPGRADE,
                    markdown_reference=case_config.ai_driven_analysis.file,
                    cover_reference=case_config.ai_driven_analysis.cover,
                    asset_publisher=asset_publisher,
                ),
            ),
        )

        if existing_case is None:
            await self._create_use_case.execute(_build_create_command(payload))
        else:
            await self._replace_use_case.execute(_build_replace_command(payload))

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
        cover_reference: str,
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
            cover_image_url=asset_publisher.publish_reference(cover_reference),
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


def _build_replace_command(payload: CaseImportPayload) -> ReplaceBusinessCaseCommand:
    return ReplaceBusinessCaseCommand(
        case_id=payload.case_id,
        title=payload.title,
        summary=payload.summary,
        tags=payload.tags,
        cover_image_url=payload.cover_image_url,
        status=BusinessCaseStatus.PUBLISHED,
        documents=tuple(
            BusinessCaseDocumentContent(
                document_type=document.document_type,
                title=document.title,
                markdown_content=document.markdown_content,
                cover_image_url=document.cover_image_url,
            )
            for document in payload.documents
        ),
    )


def _build_create_command(payload: CaseImportPayload) -> CreateBusinessCaseCommand:
    return CreateBusinessCaseCommand(
        case_id=payload.case_id,
        title=payload.title,
        summary=payload.summary,
        tags=payload.tags,
        cover_image_url=payload.cover_image_url,
        status=BusinessCaseStatus.PUBLISHED,
        documents=tuple(
            BusinessCaseDocumentContent(
                document_type=document.document_type,
                title=document.title,
                markdown_content=document.markdown_content,
                cover_image_url=document.cover_image_url,
            )
            for document in payload.documents
        ),
    )
