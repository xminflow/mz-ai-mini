"""pipeline 编排逻辑测试。用 fake 插件验证 stages 分发与跳过。"""

from __future__ import annotations

from pathlib import Path

import pytest

from research_kit.core.contracts import (
    AnalyzeJob,
    AnalyzeResult,
    BloggerProfile,
    CollectJob,
    CollectResult,
    PipelineJob,
    ReportJob,
    ReportResult,
)
from research_kit.core.pipeline import Pipeline
from research_kit.core.plugin import PluginInfo
from research_kit.core.registry import PluginRegistry


class _RecordingCollector:
    info = PluginInfo(name="rec-collector", kind="collector", description="")

    def __init__(self) -> None:
        self.calls: list[CollectJob] = []

    def collect(self, job: CollectJob) -> CollectResult:
        self.calls.append(job)
        return CollectResult(
            run_id=job.run_id,
            blogger=BloggerProfile(
                blogger_id="b",
                display_name="x",
                home_url="https://x",
                captured_at="2026-05-19T10:00:00+00:00",
            ),
            samples=[],
            workspace=job.workspace,
        )


class _RecordingAnalyzer:
    info = PluginInfo(name="rec-analyzer", kind="analyzer", description="")
    skill_name = "any"

    def __init__(self) -> None:
        self.calls: list[AnalyzeJob] = []

    def analyze(self, job: AnalyzeJob) -> AnalyzeResult:
        self.calls.append(job)
        artifacts_dir = job.workspace / "reports" / job.run_id
        artifacts_dir.mkdir(parents=True, exist_ok=True)
        return AnalyzeResult(
            run_id=job.run_id,
            workspace=job.workspace,
            artifacts_dir=artifacts_dir,
            summary="ok",
        )


class _RecordingReporter:
    info = PluginInfo(name="rec-reporter", kind="reporter", description="")

    def __init__(self) -> None:
        self.calls: list[ReportJob] = []

    def render(self, job: ReportJob) -> ReportResult:
        self.calls.append(job)
        return ReportResult(run_id=job.run_id, artifacts=[])


def _make_registry() -> tuple[PluginRegistry, _RecordingCollector, _RecordingAnalyzer, _RecordingReporter]:
    reg = PluginRegistry()
    collector = _RecordingCollector()
    analyzer = _RecordingAnalyzer()
    reporter = _RecordingReporter()
    reg.register_collector(collector)
    reg.register_analyzer(analyzer)
    reg.register_reporter(reporter)
    return reg, collector, analyzer, reporter


def test_pipeline_runs_all_three_stages(tmp_path: Path) -> None:
    reg, c, a, r = _make_registry()
    pipeline = Pipeline("rec-collector", "rec-analyzer", "rec-reporter", registry=reg)
    outcome = pipeline.run(
        PipelineJob(run_id="r1", workspace=tmp_path, url="https://x")
    )
    assert len(c.calls) == 1
    assert len(a.calls) == 1
    assert len(r.calls) == 1
    assert outcome.collect is not None
    assert outcome.analyze is not None
    assert outcome.report is not None


def test_pipeline_skips_collect_when_not_in_stages(tmp_path: Path) -> None:
    reg, c, a, r = _make_registry()
    pipeline = Pipeline("rec-collector", "rec-analyzer", "rec-reporter", registry=reg)
    pipeline.run(
        PipelineJob(run_id="r2", workspace=tmp_path, stages=["analyze", "report"])
    )
    assert len(c.calls) == 0
    assert len(a.calls) == 1
    assert len(r.calls) == 1


def test_pipeline_collect_requires_url(tmp_path: Path) -> None:
    reg, *_ = _make_registry()
    pipeline = Pipeline("rec-collector", "rec-analyzer", "rec-reporter", registry=reg)
    with pytest.raises(ValueError):
        pipeline.run(PipelineJob(run_id="r3", workspace=tmp_path, stages=["collect"]))


def test_pipeline_report_uses_default_dir_when_no_analyze(tmp_path: Path) -> None:
    reg, _, _, r = _make_registry()
    # 手工准备 reports 目录
    (tmp_path / "reports" / "r4").mkdir(parents=True)
    pipeline = Pipeline("rec-collector", "rec-analyzer", "rec-reporter", registry=reg)
    pipeline.run(
        PipelineJob(run_id="r4", workspace=tmp_path, stages=["report"])
    )
    assert r.calls[0].artifacts_dir == tmp_path / "reports" / "r4"
