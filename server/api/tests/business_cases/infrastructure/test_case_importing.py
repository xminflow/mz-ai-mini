from __future__ import annotations

import json
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
    CaseImportCloudBaseSettings,
    CloudBaseStorageClient,
)
from mz_ai_backend.modules.business_cases.infrastructure.importing.directory_loader import (
    extract_markdown_title,
    load_case_import_config,
    rewrite_markdown_local_images,
)


CASE_ID = "case-4"
CLOUDBASE_ENV_ID = "rlink-5g3hqx773b8980a1"


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
        return f"cloud://{CLOUDBASE_ENV_ID}.bucket/{object_key}"

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
        resolve_uploaded_url=lambda reference: f"cloud://demo.bucket/{reference}",
    )

    assert "cloud://demo.bucket/images/local.png" in rewritten_markdown
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
        f"cloud://{CLOUDBASE_ENV_ID}.bucket/business-cases/"
        f"{CASE_ID}/images/summary_chart1/chart.png"
        in command.summary_markdown
    )
    assert (
        f"cloud://{CLOUDBASE_ENV_ID}.bucket/business-cases/"
        f"{CASE_ID}/images/rework_chart1/chart.png"
        in command.documents[0].markdown_content
    )
    assert (
        f"cloud://{CLOUDBASE_ENV_ID}.bucket/business-cases/"
        f"{CASE_ID}/images/business_model_chart1/chart.png"
        in command.documents[2].markdown_content
    )
    assert command.cover_image_url == (
        f"cloud://{CLOUDBASE_ENV_ID}.bucket/business-cases/"
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
        f"cloud://{CLOUDBASE_ENV_ID}.bucket/business-cases/"
        f"{CASE_ID}/images/summary_chart1/chart.png"
        in command.summary_markdown
    )
    assert (
        f"cloud://{CLOUDBASE_ENV_ID}.bucket/business-cases/"
        f"{CASE_ID}/images/how_to_do_chart1/chart.png"
        in command.documents[-1].markdown_content
    )


def test_cloudbase_settings_from_env_reads_required_values(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("MZ_AI_CASE_IMPORT_CLOUDBASE_ENV_ID", CLOUDBASE_ENV_ID)
    monkeypatch.setenv("MZ_AI_CASE_IMPORT_CLOUDBASE_API_KEY", "api-key")

    settings = CaseImportCloudBaseSettings.from_env()

    assert settings.env_id == CLOUDBASE_ENV_ID
    assert settings.api_key == "api-key"


def test_cloudbase_storage_client_requests_upload_ticket_and_uploads_file(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    asset_path = tmp_path / "cover.png"
    asset_path.write_bytes(b"png")
    request_log: list[dict[str, object]] = []

    class FakeResponse:
        def __init__(self, *, status_code: int, payload: bytes = b"") -> None:
            self._status_code = status_code
            self._payload = payload

        def __enter__(self) -> "FakeResponse":
            return self

        def __exit__(self, exc_type, exc, tb) -> None:
            return None

        def getcode(self) -> int:
            return self._status_code

        def read(self) -> bytes:
            return self._payload

    def fake_urlopen(request, timeout: int):
        request_log.append(
            {
                "url": request.full_url,
                "method": request.get_method(),
                "headers": {key.lower(): value for key, value in request.header_items()},
                "data": request.data,
                "timeout": timeout,
            }
        )
        if request.get_method() == "POST":
            return FakeResponse(
                status_code=200,
                payload=json.dumps(
                    [
                        {
                            "objectId": "business-cases/case-4/images/cover.png",
                            "uploadUrl": "https://upload.example.com/cover.png",
                            "authorization": "upload-auth",
                            "token": "upload-token",
                            "cloudObjectMeta": "cloud-meta",
                            "cloudObjectId": (
                                f"cloud://{CLOUDBASE_ENV_ID}.bucket/"
                                "business-cases/case-4/images/cover.png"
                            ),
                        }
                    ]
                ).encode("utf-8"),
            )
        return FakeResponse(status_code=200)

    monkeypatch.setattr(
        "mz_ai_backend.modules.business_cases.infrastructure.importing."
        "cloudbase_client.urllib.request.urlopen",
        fake_urlopen,
    )

    client = CloudBaseStorageClient(
        settings=CaseImportCloudBaseSettings(
            env_id=CLOUDBASE_ENV_ID,
            api_key="api-key",
        )
    )

    uploaded_reference = client.upload_file(
        local_path=asset_path,
        object_key="business-cases/case-4/images/cover.png",
    )

    assert uploaded_reference == (
        f"cloud://{CLOUDBASE_ENV_ID}.bucket/"
        "business-cases/case-4/images/cover.png"
    )
    assert request_log[0]["url"] == (
        f"https://{CLOUDBASE_ENV_ID}.api.tcloudbasegateway.com"
        "/v1/storages/get-objects-upload-info"
    )
    assert request_log[0]["method"] == "POST"
    assert request_log[0]["headers"]["authorization"] == "Bearer api-key"
    assert json.loads(request_log[0]["data"].decode("utf-8")) == [
        {"objectId": "business-cases/case-4/images/cover.png"}
    ]
    assert request_log[1]["url"] == "https://upload.example.com/cover.png"
    assert request_log[1]["method"] == "PUT"
    assert request_log[1]["headers"]["authorization"] == "upload-auth"
    assert request_log[1]["headers"]["x-cos-security-token"] == "upload-token"
    assert request_log[1]["headers"]["x-cos-meta-fileid"] == "cloud-meta"
    assert request_log[1]["headers"]["content-type"] == "image/png"


def test_cloudbase_storage_client_deletes_files_in_batches_and_ignores_missing_items(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    request_log: list[dict[str, object]] = []

    class FakeResponse:
        def __init__(self, *, status_code: int, payload: bytes) -> None:
            self._status_code = status_code
            self._payload = payload

        def __enter__(self) -> "FakeResponse":
            return self

        def __exit__(self, exc_type, exc, tb) -> None:
            return None

        def getcode(self) -> int:
            return self._status_code

        def read(self) -> bytes:
            return self._payload

    def fake_urlopen(request, timeout: int):
        request_log.append(
            {
                "url": request.full_url,
                "method": request.get_method(),
                "headers": {key.lower(): value for key, value in request.header_items()},
                "data": request.data,
                "timeout": timeout,
            }
        )
        payload = [
            {"cloudObjectId": item["cloudObjectId"]}
            for item in json.loads(request.data.decode("utf-8"))
        ]
        if len(payload) > 1:
            payload[-1] = {
                "cloudObjectId": payload[-1]["cloudObjectId"],
                "code": "OBJECT_NOT_EXIST",
                "message": "Storage object not exists.",
            }
        return FakeResponse(status_code=200, payload=json.dumps(payload).encode("utf-8"))

    monkeypatch.setattr(
        "mz_ai_backend.modules.business_cases.infrastructure.importing."
        "cloudbase_client.urllib.request.urlopen",
        fake_urlopen,
    )

    client = CloudBaseStorageClient(
        settings=CaseImportCloudBaseSettings(
            env_id=CLOUDBASE_ENV_ID,
            api_key="api-key",
        )
    )

    client.delete_files(
        cloud_object_ids=(
            f"cloud://{CLOUDBASE_ENV_ID}.bucket/business-cases/case-4/images/a.png",
            f"cloud://{CLOUDBASE_ENV_ID}.bucket/business-cases/case-4/images/b.png",
            f"cloud://{CLOUDBASE_ENV_ID}.bucket/business-cases/case-4/images/c.png",
        )
    )

    assert len(request_log) == 1
    assert request_log[0]["url"] == (
        f"https://{CLOUDBASE_ENV_ID}.api.tcloudbasegateway.com"
        "/v1/storages/delete-objects"
    )
    assert request_log[0]["method"] == "POST"
    assert request_log[0]["headers"]["authorization"] == "Bearer api-key"
    assert json.loads(request_log[0]["data"].decode("utf-8")) == [
        {
            "cloudObjectId": (
                f"cloud://{CLOUDBASE_ENV_ID}.bucket/business-cases/case-4/images/a.png"
            )
        },
        {
            "cloudObjectId": (
                f"cloud://{CLOUDBASE_ENV_ID}.bucket/business-cases/case-4/images/b.png"
            )
        },
        {
            "cloudObjectId": (
                f"cloud://{CLOUDBASE_ENV_ID}.bucket/business-cases/case-4/images/c.png"
            )
        },
    ]


def test_cloudbase_storage_client_deletes_directory_via_tcb_cli(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    executed_commands: list[list[str]] = []

    def fake_run(command: list[str], **kwargs) -> object:
        executed_commands.append(command)

        class Result:
            returncode = 0
            stdout = "ok"
            stderr = ""

        return Result()

    monkeypatch.setattr(
        "mz_ai_backend.modules.business_cases.infrastructure.importing."
        "cloudbase_client.shutil.which",
        lambda executable: "C:/mock/tcb.cmd" if executable == "tcb" else None,
    )
    monkeypatch.setattr(
        "mz_ai_backend.modules.business_cases.infrastructure.importing."
        "cloudbase_client.subprocess.run",
        fake_run,
    )

    client = CloudBaseStorageClient(
        settings=CaseImportCloudBaseSettings(
            env_id=CLOUDBASE_ENV_ID,
            api_key="api-key",
        )
    )

    client.delete_directory(cloud_directory=f"business-cases/{CASE_ID}")

    assert executed_commands == [
        [
            "C:/mock/tcb.cmd",
            "storage",
            "delete",
            f"business-cases/{CASE_ID}",
            "--dir",
            "-e",
            CLOUDBASE_ENV_ID,
        ]
    ]


def test_cloudbase_storage_client_retries_directory_delete_after_cli_login(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    executed_commands: list[list[str]] = []

    def fake_run(command: list[str], **kwargs) -> object:
        executed_commands.append(command)

        class Result:
            def __init__(self, *, returncode: int, stdout: str = "", stderr: str = "") -> None:
                self.returncode = returncode
                self.stdout = stdout
                self.stderr = stderr

        if command[1:] == [
            "storage",
            "delete",
            f"business-cases/{CASE_ID}",
            "--dir",
            "-e",
            CLOUDBASE_ENV_ID,
        ] and len(executed_commands) == 1:
            return Result(
                returncode=1,
                stderr="No valid identity information, please use cloudbase login to login",
            )
        if command[1:3] == ["login", "--apiKeyId"]:
            return Result(returncode=0, stdout="login ok")
        return Result(returncode=0, stdout="delete ok")

    monkeypatch.setattr(
        "mz_ai_backend.modules.business_cases.infrastructure.importing."
        "cloudbase_client.shutil.which",
        lambda executable: "C:/mock/tcb.cmd" if executable == "tcb" else None,
    )
    monkeypatch.setattr(
        "mz_ai_backend.modules.business_cases.infrastructure.importing."
        "cloudbase_client.subprocess.run",
        fake_run,
    )

    client = CloudBaseStorageClient(
        settings=CaseImportCloudBaseSettings(
            env_id=CLOUDBASE_ENV_ID,
            api_key="api-key",
            cli_api_key_id="secret-id",
            cli_api_key="secret-key",
        )
    )

    client.delete_directory(cloud_directory=f"business-cases/{CASE_ID}")

    assert executed_commands == [
        [
            "C:/mock/tcb.cmd",
            "storage",
            "delete",
            f"business-cases/{CASE_ID}",
            "--dir",
            "-e",
            CLOUDBASE_ENV_ID,
        ],
        [
            "C:/mock/tcb.cmd",
            "login",
            "--apiKeyId",
            "secret-id",
            "--apiKey",
            "secret-key",
        ],
        [
            "C:/mock/tcb.cmd",
            "storage",
            "delete",
            f"business-cases/{CASE_ID}",
            "--dir",
            "-e",
            CLOUDBASE_ENV_ID,
        ],
    ]


def test_cloudbase_storage_client_raises_when_cli_login_is_missing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def fake_run(command: list[str], **kwargs) -> object:
        class Result:
            returncode = 1
            stdout = ""
            stderr = "No valid identity information, please use cloudbase login to login"

        if command[1:3] == ["login", "--apiKeyId"]:
            return Result()
        return Result()

    monkeypatch.setattr(
        "mz_ai_backend.modules.business_cases.infrastructure.importing."
        "cloudbase_client.shutil.which",
        lambda executable: "C:/mock/tcb.cmd" if executable == "tcb" else None,
    )
    monkeypatch.setattr(
        "mz_ai_backend.modules.business_cases.infrastructure.importing."
        "cloudbase_client.subprocess.run",
        fake_run,
    )

    client = CloudBaseStorageClient(
        settings=CaseImportCloudBaseSettings(
            env_id=CLOUDBASE_ENV_ID,
            api_key="api-key",
        )
    )

    with pytest.raises(RuntimeError) as exc_info:
        client.delete_directory(cloud_directory=f"business-cases/{CASE_ID}")

    assert "Failed to authenticate CloudBase CLI" in str(exc_info.value)


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
            f"cloud://{CLOUDBASE_ENV_ID}.bucket/"
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
            f"![Chart](cloud://{CLOUDBASE_ENV_ID}.bucket/"
            f"business-cases/{CASE_ID}/images/{document_slug}_chart1/chart.png)\n"
        ),
        is_deleted=False,
        created_at=_fixed_datetime(),
        updated_at=_fixed_datetime(),
    )


def _fixed_datetime() -> datetime:
    return datetime(2026, 1, 1, 8, 0, 0)
