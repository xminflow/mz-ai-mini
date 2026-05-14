from __future__ import annotations

from datetime import date, datetime
from pathlib import Path

import pytest

from mz_ai_backend.modules.business_cases.application import (
    CreateBusinessCaseCommand,
)
from mz_ai_backend.modules.business_cases.domain import (
    BusinessCase,
    BusinessCaseDocument,
    BusinessCaseIndustry,
    BusinessCaseDocumentType,
    BusinessCaseDocuments,
    BusinessCaseStatus,
    BusinessCaseType,
)
from mz_ai_backend.modules.business_cases.infrastructure.importing import (
    BusinessCaseDirectoryImporter,
    CosStorageClient,
    CosStorageSettings,
)
from mz_ai_backend.modules.business_cases.infrastructure.importing.directory_loader import (
    extract_markdown_title,
    load_case_import_config,
    rewrite_markdown_local_images,
)


CASE_ID = "case-4"
COS_APP_ID = "1250000000"
COS_BUCKET_NAME = "weelume-pro"
COS_REGION = "ap-guangzhou"
COS_HOST = f"{COS_BUCKET_NAME}-{COS_APP_ID}.cos.{COS_REGION}.myqcloud.com"
COS_ENDPOINT = f"https://{COS_HOST}"


class StubRepository:
    def __init__(self, *, existing_case: BusinessCase | None) -> None:
        self._existing_case = existing_case
        self.requested_case_ids: list[str] = []
        self.hard_deleted_case_ids: list[str] = []
        self.release_connection_call_count = 0
        self.events: list[str] = []

    async def get_by_case_id(self, case_id: str) -> BusinessCase | None:
        self.requested_case_ids.append(case_id)
        self.events.append("get_by_case_id")
        return self._existing_case

    async def hard_delete_by_case_id(self, case_id: str) -> bool:
        self.hard_deleted_case_ids.append(case_id)
        self.events.append("hard_delete_by_case_id")
        return self._existing_case is not None

    async def release_connection(self) -> None:
        self.release_connection_call_count += 1
        self.events.append("release_connection")


class StubCreateBusinessCaseUseCase:
    def __init__(self) -> None:
        self.executed_command: CreateBusinessCaseCommand | None = None

    async def execute(self, command: CreateBusinessCaseCommand):
        self.executed_command = command
        return None


class StubAssetUploader:
    def __init__(self, *, events: list[str] | None = None) -> None:
        self.calls: list[tuple[Path, str]] = []
        self.deleted_cloud_directories: list[str] = []
        self._events = events

    def upload_file(self, *, local_path: Path, object_key: str) -> str:
        self.calls.append((local_path, object_key))
        if self._events is not None:
            self._events.append("upload_file")
        return f"{COS_ENDPOINT}/{object_key}"

    def delete_directory(self, *, cloud_directory: str) -> None:
        self.deleted_cloud_directories.append(cloud_directory)
        if self._events is not None:
            self._events.append("delete_directory")


def test_load_case_import_config_reads_expected_fields(tmp_path: Path) -> None:
    _write_case_directory(
        tmp_path,
        config_text=(
            "case_id: case-4\n"
            "type: case\n"
            "title: 宠物新零售行业创业案例\n"
            "desc: 围绕宠物健康知识输出和社群运营\n"
            "data_cutoff_date: 2026-04-13\n"
            "freshness_months: 3\n"
            "cover: images\\cover\\image_01.png\n"
            "industry: 消费\n"
            "relationships:\n"
            "  - case_id: case-26\n"
            "    type: 同行业\n"
            "    reason: 同属AI赛道\n"
            "tags:\n"
            "  - 宠物\n"
            "  - 新零售\n"
            "summary:\n"
            "  file: summary.md\n"
            "rework:\n"
            "  file: rework.md\n"
            "ai_driven_analysis:\n"
            "  file: ai_driven_analysis.md\n"
            "market:\n"
            "  file: market_analysis_report.md\n"
            "business_model:\n"
            "  file: business_model.md\n"
        ),
    )

    config = load_case_import_config(tmp_path)

    assert config.case_id == CASE_ID
    assert config.type == BusinessCaseType.CASE
    assert config.title == "宠物新零售行业创业案例"
    assert config.summary.file == "summary.md"
    assert config.data_cutoff_date == date(2026, 4, 13)
    assert config.freshness_months == 3
    assert config.industry == BusinessCaseIndustry.CONSUMER
    assert len(config.relationships) == 1
    assert config.relationships[0].case_id == "case-26"
    assert config.relationships[0].type == "同行业"
    assert config.relationships[0].reason == "同属AI赛道"
    assert config.tags == ("宠物", "新零售")
    assert config.rework.file == "rework.md"
    assert config.business_model is not None
    assert config.business_model.file == "business_model.md"


def test_load_case_import_config_rejects_missing_case_id(tmp_path: Path) -> None:
    _write_case_directory(
        tmp_path,
        config_text=(
            "title: 宠物新零售行业创业案例\n"
            "desc: 围绕宠物健康知识输出和社群运营\n"
            "data_cutoff_date: 2026-04-13\n"
            "freshness_months: 3\n"
            "cover: images/cover/image_01.png\n"
            "tags:\n"
            "  - 宠物\n"
            "summary:\n"
            "  file: summary.md\n"
            "rework:\n"
            "  file: rework.md\n"
            "ai_driven_analysis:\n"
            "  file: ai_driven_analysis.md\n"
            "market:\n"
            "  file: market_analysis_report.md\n"
        ),
    )

    with pytest.raises(Exception) as exc_info:
        load_case_import_config(tmp_path)

    assert "case_id" in str(exc_info.value)


def test_load_case_import_config_rejects_missing_type(tmp_path: Path) -> None:
    _write_case_directory(
        tmp_path,
        config_text=(
            "case_id: case-4\n"
            "title: 宠物新零售行业创业案例\n"
            "desc: 围绕宠物健康知识输出和社群运营\n"
            "data_cutoff_date: 2026-04-13\n"
            "freshness_months: 3\n"
            "cover: images/cover/image_01.png\n"
            "tags:\n"
            "  - 宠物\n"
            "summary:\n"
            "  file: summary.md\n"
            "rework:\n"
            "  file: rework.md\n"
            "ai_driven_analysis:\n"
            "  file: ai_driven_analysis.md\n"
            "market:\n"
            "  file: market_analysis_report.md\n"
        ),
    )

    with pytest.raises(Exception) as exc_info:
        load_case_import_config(tmp_path)

    assert "type" in str(exc_info.value)


def test_load_case_import_config_rejects_project_without_how_to_do(tmp_path: Path) -> None:
    _write_case_directory(
        tmp_path,
        config_text=(
            "case_id: case-4\n"
            "type: project\n"
            "title: 宠物新零售行业创业案例\n"
            "desc: 围绕宠物健康知识输出和社群运营\n"
            "data_cutoff_date: 2026-04-13\n"
            "freshness_months: 3\n"
            "cover: images/cover/image_01.png\n"
            "tags:\n"
            "  - 宠物\n"
            "summary:\n"
            "  file: summary.md\n"
            "rework:\n"
            "  file: rework.md\n"
            "ai_driven_analysis:\n"
            "  file: ai_driven_analysis.md\n"
            "market:\n"
            "  file: market_analysis_report.md\n"
            "business_model:\n"
            "  file: business_model.md\n"
        ),
    )

    with pytest.raises(Exception) as exc_info:
        load_case_import_config(tmp_path)

    assert "how_to_do" in str(exc_info.value)


def test_load_case_import_config_rejects_case_without_business_model(tmp_path: Path) -> None:
    _write_case_directory(
        tmp_path,
        config_text=(
            "case_id: case-4\n"
            "type: case\n"
            "title: 宠物新零售行业创业案例\n"
            "desc: 围绕宠物健康知识输出和社群运营\n"
            "data_cutoff_date: 2026-04-13\n"
            "freshness_months: 3\n"
            "cover: images/cover/image_01.png\n"
            "tags:\n"
            "  - 宠物\n"
            "summary:\n"
            "  file: summary.md\n"
            "rework:\n"
            "  file: rework.md\n"
            "ai_driven_analysis:\n"
            "  file: ai_driven_analysis.md\n"
            "market:\n"
            "  file: market_analysis_report.md\n"
        ),
    )

    with pytest.raises(Exception) as exc_info:
        load_case_import_config(tmp_path)

    assert "business_model" in str(exc_info.value)


def test_load_case_import_config_rejects_non_positive_freshness_months(
    tmp_path: Path,
) -> None:
    _write_case_directory(
        tmp_path,
        config_text=(
            "case_id: case-4\n"
            "type: case\n"
            "title: 宠物新零售行业创业案例\n"
            "desc: 围绕宠物健康知识输出和社群运营\n"
            "data_cutoff_date: 2026-04-13\n"
            "freshness_months: 0\n"
            "cover: images/cover/image_01.png\n"
            "industry: 消费\n"
            "tags:\n"
            "  - 宠物\n"
            "summary:\n"
            "  file: summary.md\n"
            "rework:\n"
            "  file: rework.md\n"
            "ai_driven_analysis:\n"
            "  file: ai_driven_analysis.md\n"
            "market:\n"
            "  file: market_analysis_report.md\n"
            "business_model:\n"
            "  file: business_model.md\n"
        ),
    )

    with pytest.raises(Exception) as exc_info:
        load_case_import_config(tmp_path)

    assert "freshness_months" in str(exc_info.value)


def test_extract_markdown_title_returns_first_h1() -> None:
    markdown_content = "\nIntro\n# Main Title\n## Secondary\n"

    assert extract_markdown_title(markdown_content) == "Main Title"


def test_rewrite_markdown_local_images_updates_only_local_references() -> None:
    markdown_content = (
        "![Local](images/local.png)\n"
        "![Remote](https://example.com/remote.png)\n"
    )

    rewritten_markdown = rewrite_markdown_local_images(
        markdown_content,
        resolve_uploaded_url=lambda reference: f"https://demo.example.com/{reference}",
    )

    assert "https://demo.example.com/images/local.png" in rewritten_markdown
    assert "https://example.com/remote.png" in rewritten_markdown


@pytest.mark.asyncio
async def test_business_case_directory_importer_recreates_existing_case_and_cleans_assets(
    tmp_path: Path,
) -> None:
    _write_case_directory(tmp_path)
    repository = StubRepository(existing_case=_build_existing_case())
    uploader = StubAssetUploader(events=repository.events)
    create_use_case = StubCreateBusinessCaseUseCase()
    importer = BusinessCaseDirectoryImporter(
        business_case_repository=repository,
        create_use_case=create_use_case,
        asset_manager=uploader,
    )

    result = await importer.import_case(case_dir=tmp_path)

    assert result.case_id == CASE_ID
    assert result.uploaded_asset_count == 6
    assert repository.hard_deleted_case_ids == [CASE_ID]
    assert repository.release_connection_call_count == 1
    assert uploader.deleted_cloud_directories == [f"business-cases/{CASE_ID}"]
    assert repository.events.index("release_connection") < repository.events.index(
        "upload_file"
    )
    assert create_use_case.executed_command is not None
    command = create_use_case.executed_command
    assert command.case_id == CASE_ID
    assert command.type == BusinessCaseType.CASE
    assert command.summary_markdown.startswith("# Summary Title")
    assert command.data_cutoff_date == date(2026, 4, 13)
    assert command.freshness_months == 3
    assert command.status == BusinessCaseStatus.PUBLISHED
    assert command.industry == BusinessCaseIndustry.CONSUMER
    assert command.documents[0].document_type == BusinessCaseDocumentType.BUSINESS_CASE
    assert command.documents[2].document_type == BusinessCaseDocumentType.BUSINESS_MODEL
    assert (
        f"{COS_ENDPOINT}/business-cases/"
        f"{CASE_ID}/images/summary_chart1/chart.png"
        in command.summary_markdown
    )
    assert (
        f"{COS_ENDPOINT}/business-cases/"
        f"{CASE_ID}/images/rework_chart1/chart.png"
        in command.documents[0].markdown_content
    )
    assert (
        f"{COS_ENDPOINT}/business-cases/"
        f"{CASE_ID}/images/business_model_chart1/chart.png"
        in command.documents[2].markdown_content
    )
    assert command.cover_image_url == (
        f"{COS_ENDPOINT}/business-cases/"
        f"{CASE_ID}/images/cover/image_01.png"
    )


@pytest.mark.asyncio
async def test_business_case_directory_importer_creates_missing_case(
    tmp_path: Path,
) -> None:
    _write_case_directory(tmp_path)
    create_use_case = StubCreateBusinessCaseUseCase()
    repository = StubRepository(existing_case=None)
    uploader = StubAssetUploader(events=repository.events)
    importer = BusinessCaseDirectoryImporter(
        business_case_repository=repository,
        create_use_case=create_use_case,
        asset_manager=uploader,
    )

    result = await importer.import_case(case_dir=tmp_path)

    assert result.case_id == CASE_ID
    assert result.uploaded_asset_count == 6
    assert repository.hard_deleted_case_ids == []
    assert repository.release_connection_call_count == 1
    assert uploader.deleted_cloud_directories == []
    assert repository.events.index("release_connection") < repository.events.index(
        "upload_file"
    )
    assert create_use_case.executed_command is not None
    assert create_use_case.executed_command.case_id == CASE_ID
    assert create_use_case.executed_command.type == BusinessCaseType.CASE
    assert create_use_case.executed_command.summary_markdown.startswith("# Summary Title")
    assert create_use_case.executed_command.data_cutoff_date == date(2026, 4, 13)
    assert create_use_case.executed_command.freshness_months == 3
    assert create_use_case.executed_command.industry == BusinessCaseIndustry.CONSUMER
    assert create_use_case.executed_command.status == BusinessCaseStatus.PUBLISHED


@pytest.mark.asyncio
async def test_business_case_directory_importer_reads_project_how_to_do_markdown(
    tmp_path: Path,
) -> None:
    _write_case_directory(tmp_path, case_type=BusinessCaseType.PROJECT, include_how_to_do=True)
    create_use_case = StubCreateBusinessCaseUseCase()
    repository = StubRepository(existing_case=None)
    uploader = StubAssetUploader(events=repository.events)
    importer = BusinessCaseDirectoryImporter(
        business_case_repository=repository,
        create_use_case=create_use_case,
        asset_manager=uploader,
    )

    result = await importer.import_case(case_dir=tmp_path)

    assert result.case_id == CASE_ID
    assert result.uploaded_asset_count == 7
    assert repository.release_connection_call_count == 1
    assert create_use_case.executed_command is not None
    command = create_use_case.executed_command
    assert command.type == BusinessCaseType.PROJECT
    assert len(command.documents) == 5
    assert command.documents[2].document_type == BusinessCaseDocumentType.BUSINESS_MODEL
    assert command.documents[-1].document_type == BusinessCaseDocumentType.HOW_TO_DO
    assert (
        f"{COS_ENDPOINT}/business-cases/"
        f"{CASE_ID}/images/summary_chart1/chart.png"
        in command.summary_markdown
    )
    assert (
        f"{COS_ENDPOINT}/business-cases/"
        f"{CASE_ID}/images/how_to_do_chart1/chart.png"
        in command.documents[-1].markdown_content
    )


def test_cos_settings_from_env_reads_required_values(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("MZ_AI_CASE_IMPORT_COS_APP_ID", COS_APP_ID)
    monkeypatch.setenv("MZ_AI_CASE_IMPORT_COS_REGION", COS_REGION)
    monkeypatch.setenv("MZ_AI_CASE_IMPORT_COS_SECRET_ID", "secret-id")
    monkeypatch.setenv("MZ_AI_CASE_IMPORT_COS_SECRET_KEY", "secret-key")

    settings = CosStorageSettings.from_env()

    assert settings.app_id == COS_APP_ID
    assert settings.bucket_name == COS_BUCKET_NAME
    assert settings.region == COS_REGION
    assert settings.secret_id == "secret-id"
    assert settings.secret_key == "secret-key"
    assert settings.session_token is None
    assert settings.host == COS_HOST


def test_cos_storage_client_uploads_file_with_sdk_client(tmp_path: Path) -> None:
    asset_path = tmp_path / "cover.png"
    asset_path.write_bytes(b"png")
    sdk_client = FakeCosSdkClient()

    client = CosStorageClient(settings=_build_cos_settings(), sdk_client=sdk_client)

    uploaded_reference = client.upload_file(
        local_path=asset_path,
        object_key="business-cases/case-4/images/cover.png",
    )

    assert uploaded_reference == (
        f"{COS_ENDPOINT}/"
        "business-cases/case-4/images/cover.png"
    )
    assert sdk_client.put_object_calls == [
        {
            "Bucket": f"{COS_BUCKET_NAME}-{COS_APP_ID}",
            "Body": b"png",
            "Key": "business-cases/case-4/images/cover.png",
            "ContentType": "image/png",
        }
    ]


def test_cos_storage_client_builds_sdk_client_with_session_token(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    captured_config: dict[str, object] = {}

    class FakeCosConfig:
        def __init__(self, **kwargs: object) -> None:
            captured_config.update(kwargs)

    class FakeCosS3Client:
        def __init__(self, config: FakeCosConfig) -> None:
            self.config = config

    monkeypatch.setattr("mz_ai_backend.shared.cos_storage.CosConfig", FakeCosConfig)
    monkeypatch.setattr("mz_ai_backend.shared.cos_storage.CosS3Client", FakeCosS3Client)

    CosStorageClient(
        settings=CosStorageSettings(
            app_id=COS_APP_ID,
            region=COS_REGION,
            secret_id="secret-id",
            secret_key="secret-key",
            session_token="session-token",
            bucket_name=COS_BUCKET_NAME,
        )
    )

    assert captured_config == {
        "Region": COS_REGION,
        "SecretId": "secret-id",
        "SecretKey": "secret-key",
        "Token": "session-token",
        "Scheme": "https",
    }


def test_cos_storage_client_deletes_files() -> None:
    sdk_client = FakeCosSdkClient()

    client = CosStorageClient(settings=_build_cos_settings(), sdk_client=sdk_client)

    client.delete_files(
        object_urls=(
            f"{COS_ENDPOINT}/business-cases/case-4/images/a.png",
            f"{COS_ENDPOINT}/business-cases/case-4/images/missing.png",
        )
    )

    assert sdk_client.delete_object_calls == [
        {
            "Bucket": f"{COS_BUCKET_NAME}-{COS_APP_ID}",
            "Key": "business-cases/case-4/images/a.png",
        },
        {
            "Bucket": f"{COS_BUCKET_NAME}-{COS_APP_ID}",
            "Key": "business-cases/case-4/images/missing.png",
        },
    ]


def test_cos_storage_client_deletes_directory_objects() -> None:
    sdk_client = FakeCosSdkClient(
        list_object_responses=[
            {
                "IsTruncated": "true",
                "NextContinuationToken": "token-2",
                "Contents": [{"Key": "business-cases/case-4/images/a.png"}],
            },
            {
                "IsTruncated": "false",
                "Contents": [{"Key": "business-cases/case-4/images/b.png"}],
            },
        ]
    )

    client = CosStorageClient(settings=_build_cos_settings(), sdk_client=sdk_client)

    client.delete_directory(cloud_directory=f"business-cases/{CASE_ID}")

    assert sdk_client.list_objects_calls == [
        {
            "Bucket": f"{COS_BUCKET_NAME}-{COS_APP_ID}",
            "Prefix": "business-cases/case-4/",
            "MaxKeys": "1000",
        },
        {
            "Bucket": f"{COS_BUCKET_NAME}-{COS_APP_ID}",
            "Prefix": "business-cases/case-4/",
            "MaxKeys": "1000",
            "ContinuationToken": "token-2",
        },
    ]
    assert [call["Key"] for call in sdk_client.delete_object_calls] == [
        "business-cases/case-4/images/a.png",
        "business-cases/case-4/images/b.png",
    ]


class FakeCosSdkClient:
    def __init__(self, *, list_object_responses: list[dict[str, object]] | None = None):
        self.put_object_calls: list[dict[str, object]] = []
        self.delete_object_calls: list[dict[str, object]] = []
        self.list_objects_calls: list[dict[str, object]] = []
        self._list_object_responses = list_object_responses or [
            {"IsTruncated": "false", "Contents": []}
        ]

    def put_object(self, **kwargs: object) -> None:
        self.put_object_calls.append(kwargs)

    def delete_object(self, **kwargs: object) -> None:
        self.delete_object_calls.append(kwargs)

    def list_objects(self, **kwargs: object) -> dict[str, object]:
        self.list_objects_calls.append(kwargs)
        return self._list_object_responses.pop(0)


def _build_cos_settings() -> CosStorageSettings:
    return CosStorageSettings(
        app_id=COS_APP_ID,
        region=COS_REGION,
        secret_id="secret-id",
        secret_key="secret-key",
        bucket_name=COS_BUCKET_NAME,
    )


def _write_case_directory(
    case_dir: Path,
    *,
    config_text: str | None = None,
    case_type: BusinessCaseType = BusinessCaseType.CASE,
    include_how_to_do: bool = False,
) -> None:
    (case_dir / "images" / "cover").mkdir(parents=True, exist_ok=True)
    (case_dir / "images" / "summary_chart1").mkdir(parents=True, exist_ok=True)
    (case_dir / "images" / "rework_chart1").mkdir(parents=True, exist_ok=True)
    (case_dir / "images" / "market_chart1").mkdir(parents=True, exist_ok=True)
    (case_dir / "images" / "business_model_chart1").mkdir(parents=True, exist_ok=True)
    (case_dir / "images" / "ai_chart1").mkdir(parents=True, exist_ok=True)
    if include_how_to_do:
        (case_dir / "images" / "how_to_do_chart1").mkdir(parents=True, exist_ok=True)
    for path in (
        case_dir / "images" / "cover" / "image_01.png",
        case_dir / "images" / "summary_chart1" / "chart.png",
        case_dir / "images" / "rework_chart1" / "chart.png",
        case_dir / "images" / "market_chart1" / "chart.png",
        case_dir / "images" / "business_model_chart1" / "chart.png",
        case_dir / "images" / "ai_chart1" / "chart.png",
    ):
        path.write_bytes(b"png")
    if include_how_to_do:
        (case_dir / "images" / "how_to_do_chart1" / "chart.png").write_bytes(b"png")

    (case_dir / "summary.md").write_text(
        "# Summary Title\n\n![Chart](images/summary_chart1/chart.png)\n",
        encoding="utf-8",
    )
    (case_dir / "rework.md").write_text(
        "# Rework Title\n\n![Chart](images/rework_chart1/chart.png)\n",
        encoding="utf-8",
    )
    (case_dir / "market_analysis_report.md").write_text(
        "# Market Title\n\n![Chart](images/market_chart1/chart.png)\n",
        encoding="utf-8",
    )
    (case_dir / "business_model.md").write_text(
        "# Business Model Title\n\n![Chart](images/business_model_chart1/chart.png)\n",
        encoding="utf-8",
    )
    (case_dir / "ai_driven_analysis.md").write_text(
        "# AI Title\n\n![Chart](images/ai_chart1/chart.png)\n",
        encoding="utf-8",
    )
    if include_how_to_do:
        (case_dir / "how_to_do.md").write_text(
            "# How To Do\n\n![Chart](images/how_to_do_chart1/chart.png)\n",
            encoding="utf-8",
        )
    (case_dir / "config.yml").write_text(
        config_text
        or (
            "case_id: case-4\n"
            f"type: {case_type.value}\n"
            "title: 宠物新零售行业创业案例\n"
            "desc: 围绕宠物健康知识输出和社群运营\n"
            "data_cutoff_date: 2026-04-13\n"
            "freshness_months: 3\n"
            "cover: images\\cover\\image_01.png\n"
            "industry: 消费\n"
            "relationships: []\n"
            "tags:\n"
            "  - 宠物\n"
            "  - 新零售\n"
            "summary:\n"
            "  file: summary.md\n"
            "rework:\n"
            "  file: rework.md\n"
            "ai_driven_analysis:\n"
            "  file: ai_driven_analysis.md\n"
            "market:\n"
            "  file: market_analysis_report.md\n"
            "business_model:\n"
            "  file: business_model.md\n"
            + (
                "how_to_do:\n"
                "  file: how_to_do.md\n"
                if include_how_to_do or case_type == BusinessCaseType.PROJECT
                else ""
            )
        ),
        encoding="utf-8",
    )


def _build_existing_case() -> BusinessCase:
    return BusinessCase(
        case_id=CASE_ID,
        type=BusinessCaseType.CASE,
        title="Existing Title",
        summary="Existing Summary",
        summary_markdown="# Existing Summary",
        data_cutoff_date=date(2026, 4, 13),
        freshness_months=3,
        industry=BusinessCaseIndustry.OTHER,
        tags=("旧标签",),
        cover_image_url=(
            f"{COS_ENDPOINT}/"
            f"business-cases/{CASE_ID}/images/cover/image_01.png"
        ),
        status=BusinessCaseStatus.DRAFT,
        published_at=None,
        created_at=_fixed_datetime(),
        updated_at=_fixed_datetime(),
        documents=BusinessCaseDocuments(
            business_case=_build_document(
                document_id=2001,
                document_type=BusinessCaseDocumentType.BUSINESS_CASE,
            ),
            market_research=_build_document(
                document_id=2002,
                document_type=BusinessCaseDocumentType.MARKET_RESEARCH,
            ),
            business_model=_build_document(
                document_id=2003,
                document_type=BusinessCaseDocumentType.BUSINESS_MODEL,
            ),
            ai_business_upgrade=_build_document(
                document_id=2004,
                document_type=BusinessCaseDocumentType.AI_BUSINESS_UPGRADE,
            ),
        ),
        is_deleted=False,
    )


def _build_document(
    *,
    document_id: int,
    document_type: BusinessCaseDocumentType,
) -> BusinessCaseDocument:
    document_slug = {
        BusinessCaseDocumentType.BUSINESS_CASE: "rework",
        BusinessCaseDocumentType.MARKET_RESEARCH: "market",
        BusinessCaseDocumentType.BUSINESS_MODEL: "business_model",
        BusinessCaseDocumentType.AI_BUSINESS_UPGRADE: "ai",
    }[document_type]
    return BusinessCaseDocument(
        document_id=document_id,
        document_type=document_type,
        title="Existing",
        markdown_content=(
            "# Existing\n\n"
            f"![Chart]({COS_ENDPOINT}/"
            f"business-cases/{CASE_ID}/images/{document_slug}_chart1/chart.png)\n"
        ),
        is_deleted=False,
        created_at=_fixed_datetime(),
        updated_at=_fixed_datetime(),
    )


def _fixed_datetime() -> datetime:
    return datetime(2026, 1, 1, 8, 0, 0)


