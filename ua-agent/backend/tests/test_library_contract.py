from __future__ import annotations

from pathlib import Path

import pytest
from pydantic import TypeAdapter

from ua_agent.commands.library import run_delete, run_list
from ua_agent.contracts.capture import MaterialEntry
from ua_agent.contracts.error import ErrorEnvelope
from ua_agent.contracts.library import (
    LibraryDeleteResult,
    LibraryDeleteSuccess,
    LibraryListResult,
    LibraryListSuccess,
)
from ua_agent.library.store import insert_material_entry, open_store

_ListAdapter: TypeAdapter[LibraryListSuccess | ErrorEnvelope] = TypeAdapter(
    LibraryListResult
)
_DeleteAdapter: TypeAdapter[LibraryDeleteSuccess | ErrorEnvelope] = TypeAdapter(
    LibraryDeleteResult
)


@pytest.fixture(autouse=True)
def _isolated_data_dir(  # pyright: ignore[reportUnusedFunction]
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    monkeypatch.setenv("UA_AGENT_DATA_DIR", str(tmp_path))


def _entry(
    *, post_id: str, author: str = "alice", captured_at: str
) -> MaterialEntry:
    return MaterialEntry(
        post_id=post_id,
        post_id_source="aweme_id",
        share_url=f"https://www.douyin.com/video/{post_id}",
        share_text="t",
        caption="cap",
        author_handle=author,
        author_display_name=None,
        hashtags=[],
        music_id=None,
        music_title=None,
        like_count=-1,
        comment_count=-1,
        share_count=-1,
        collect_count=-1,
        captured_at=captured_at,
        captured_by_device="serial1",
    )


def _seed_three() -> None:
    with open_store() as conn:
        for entry in [
            _entry(post_id="11", author="alice", captured_at="2026-05-01T10:00:00.000Z"),
            _entry(post_id="22", author="bob", captured_at="2026-05-02T10:00:00.000Z"),
            _entry(post_id="33", author="alice", captured_at="2026-05-03T10:00:00.000Z"),
        ]:
            insert_material_entry(conn, entry)


def _list(
    capsys: pytest.CaptureFixture[str],
    **kwargs: object,
) -> LibraryListSuccess | ErrorEnvelope:
    base: dict[str, object] = {
        "from_": None,
        "to": None,
        "author": None,
        "limit": 50,
        "offset": 0,
    }
    base.update(kwargs)
    run_list(**base)  # type: ignore[arg-type]
    out = capsys.readouterr().out.strip()
    return _ListAdapter.validate_json(out)


def test_list_orders_by_captured_at_desc(
    capsys: pytest.CaptureFixture[str],
) -> None:
    _seed_three()
    result = _list(capsys)
    assert isinstance(result, LibraryListSuccess)
    assert [e.post_id for e in result.entries] == ["33", "22", "11"]
    assert result.total == 3
    assert result.library_total == 3


def test_list_filters_by_from_to(capsys: pytest.CaptureFixture[str]) -> None:
    _seed_three()
    result = _list(
        capsys,
        from_="2026-05-02T00:00:00.000Z",
        to="2026-05-02T23:59:59.999Z",
    )
    assert isinstance(result, LibraryListSuccess)
    assert [e.post_id for e in result.entries] == ["22"]
    assert result.total == 1
    assert result.library_total == 3


def test_list_filters_by_author_exact_match(
    capsys: pytest.CaptureFixture[str],
) -> None:
    _seed_three()
    result = _list(capsys, author="alice")
    assert isinstance(result, LibraryListSuccess)
    assert {e.post_id for e in result.entries} == {"11", "33"}
    assert result.total == 2
    assert result.library_total == 3


def test_list_combined_filters_apply_and(
    capsys: pytest.CaptureFixture[str],
) -> None:
    _seed_three()
    result = _list(
        capsys,
        author="alice",
        from_="2026-05-02T00:00:00.000Z",
        to="2026-05-04T00:00:00.000Z",
    )
    assert isinstance(result, LibraryListSuccess)
    assert [e.post_id for e in result.entries] == ["33"]


def test_list_invalid_range_returns_invalid_input(
    capsys: pytest.CaptureFixture[str],
) -> None:
    _seed_three()
    result = _list(
        capsys,
        from_="2026-05-04T00:00:00.000Z",
        to="2026-05-02T00:00:00.000Z",
    )
    assert isinstance(result, ErrorEnvelope)
    assert result.error.code == "INVALID_INPUT"


def test_delete_removes_row(capsys: pytest.CaptureFixture[str]) -> None:
    _seed_three()
    run_delete(post_id="22")
    out = capsys.readouterr().out.strip()
    parsed = _DeleteAdapter.validate_json(out)
    assert isinstance(parsed, LibraryDeleteSuccess)
    assert parsed.deleted_post_id == "22"

    with open_store() as conn:
        rows = conn.execute("SELECT post_id FROM material_entries").fetchall()
    assert {r["post_id"] for r in rows} == {"11", "33"}


def test_delete_missing_returns_library_not_found(
    capsys: pytest.CaptureFixture[str],
) -> None:
    _seed_three()
    run_delete(post_id="does-not-exist")
    out = capsys.readouterr().out.strip()
    parsed = _DeleteAdapter.validate_json(out)
    assert isinstance(parsed, ErrorEnvelope)
    assert parsed.error.code == "LIBRARY_NOT_FOUND"
