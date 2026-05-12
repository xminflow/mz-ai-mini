from __future__ import annotations

from types import SimpleNamespace

import pytest

from scripts import delete_business_case


def test_parse_args_reads_case_id_argument() -> None:
    args = delete_business_case.parse_args(["--case-id", "case-05"])

    assert args.case_id == "case-05"


def test_parse_args_requires_case_id_argument() -> None:
    with pytest.raises(SystemExit):
        delete_business_case.parse_args([])


@pytest.mark.asyncio
async def test_run_delete_removes_cloud_directory_and_database_rows(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    deleted_directories: list[str] = []

    class FakeRepository:
        def __init__(self, *, session) -> None:
            self._session = session

        async def get_by_case_id(self, case_id: str):
            return SimpleNamespace(case_id=case_id)

        async def hard_delete_by_case_id(self, case_id: str) -> bool:
            return True

    class FakeAssetManager:
        def __init__(self, *, settings) -> None:
            self._settings = settings

        def delete_directory(self, *, cloud_directory: str) -> None:
            deleted_directories.append(cloud_directory)

    class FakeSessionContext:
        async def __aenter__(self):
            return object()

        async def __aexit__(self, exc_type, exc, tb) -> None:
            return None

    class FakeEngine:
        def __init__(self) -> None:
            self.disposed = False

        async def dispose(self) -> None:
            self.disposed = True

    fake_engine = FakeEngine()

    monkeypatch.setattr(
        delete_business_case,
        "get_settings",
        lambda: SimpleNamespace(database_url="postgresql+asyncpg://demo"),
    )
    monkeypatch.setattr(
        delete_business_case,
        "CaseImportCloudBaseSettings",
        SimpleNamespace(from_env=lambda: SimpleNamespace(env_id="env-id")),
    )
    monkeypatch.setattr(
        delete_business_case,
        "create_async_engine",
        lambda *args, **kwargs: fake_engine,
    )
    monkeypatch.setattr(
        delete_business_case,
        "async_sessionmaker",
        lambda **kwargs: (lambda: FakeSessionContext()),
    )
    monkeypatch.setattr(
        delete_business_case,
        "SqlAlchemyBusinessCaseRepository",
        FakeRepository,
    )
    monkeypatch.setattr(
        delete_business_case,
        "CloudBaseStorageClient",
        FakeAssetManager,
    )

    result = await delete_business_case.run_delete(case_id=" case-05 ")

    assert result == 0
    assert deleted_directories == ["business-cases/case-05"]
    assert fake_engine.disposed is True


@pytest.mark.asyncio
async def test_run_delete_raises_when_case_does_not_exist(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class FakeRepository:
        def __init__(self, *, session) -> None:
            self._session = session

        async def get_by_case_id(self, case_id: str):
            return None

        async def hard_delete_by_case_id(self, case_id: str) -> bool:
            return False

    class FakeSessionContext:
        async def __aenter__(self):
            return object()

        async def __aexit__(self, exc_type, exc, tb) -> None:
            return None

    class FakeEngine:
        async def dispose(self) -> None:
            return None

    monkeypatch.setattr(
        delete_business_case,
        "get_settings",
        lambda: SimpleNamespace(database_url="postgresql+asyncpg://demo"),
    )
    monkeypatch.setattr(
        delete_business_case,
        "CaseImportCloudBaseSettings",
        SimpleNamespace(from_env=lambda: SimpleNamespace(env_id="env-id")),
    )
    monkeypatch.setattr(
        delete_business_case,
        "create_async_engine",
        lambda *args, **kwargs: FakeEngine(),
    )
    monkeypatch.setattr(
        delete_business_case,
        "async_sessionmaker",
        lambda **kwargs: (lambda: FakeSessionContext()),
    )
    monkeypatch.setattr(
        delete_business_case,
        "SqlAlchemyBusinessCaseRepository",
        FakeRepository,
    )

    with pytest.raises(RuntimeError) as exc_info:
        await delete_business_case.run_delete(case_id="case-404")

    assert "does not exist" in str(exc_info.value)
