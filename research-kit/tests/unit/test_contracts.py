"""契约层基本校验。"""

from __future__ import annotations

import pytest

from research_kit.core.contracts import (
    AnalyzeJob,
    BloggerProfile,
    PipelineJob,
    VideoSample,
    make_run_id,
)


def test_blogger_profile_requires_iso_timestamp() -> None:
    with pytest.raises(Exception):
        BloggerProfile(
            blogger_id="b1",
            display_name="x",
            home_url="https://x",
            captured_at="not-an-iso",
        )


def test_blogger_profile_accepts_extra_fields() -> None:
    profile = BloggerProfile(
        blogger_id="b1",
        display_name="x",
        home_url="https://x",
        captured_at="2026-05-19T10:00:00+00:00",
        custom_field="value",  # type: ignore[call-arg]
    )
    dumped = profile.model_dump()
    assert dumped["custom_field"] == "value"


def test_video_sample_default_lists() -> None:
    sample = VideoSample(
        aweme_id="aw1",
        title="t",
        url="https://x",
        position=0,
        captured_at="2026-05-19T10:00:00+00:00",
    )
    assert sample.frame_paths == []


def test_analyze_job_focus_count_validation() -> None:
    with pytest.raises(ValueError):
        AnalyzeJob(run_id="r", workspace=".", focus_count=2)  # type: ignore[arg-type]
    with pytest.raises(ValueError):
        AnalyzeJob(run_id="r", workspace=".", focus_count=9)  # type: ignore[arg-type]
    AnalyzeJob(run_id="r", workspace=".", focus_count=5)  # type: ignore[arg-type]


def test_pipeline_job_defaults_to_full_pipeline() -> None:
    job = PipelineJob(run_id="r", workspace=".", url="https://x")  # type: ignore[arg-type]
    assert job.stages == ["collect", "analyze", "report"]


def test_make_run_id_format() -> None:
    rid = make_run_id()
    assert len(rid) == 16
    assert rid.endswith("Z")
    assert rid[8] == "T"
