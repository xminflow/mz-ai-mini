"""三段编排器：collect → analyze → report。

每一段都可以单独运行；通过 `stages` 参数控制要执行哪些阶段，便于断点续跑。
"""

from __future__ import annotations

from dataclasses import dataclass, field

from research_kit.core.contracts import (
    AnalyzeJob,
    AnalyzeResult,
    CollectJob,
    CollectResult,
    PipelineJob,
    ReportJob,
    ReportResult,
)
from research_kit.core.logging import get_logger
from research_kit.core.registry import PluginRegistry, default_registry
from research_kit.core.workspace import Workspace

_log = get_logger(__name__)


@dataclass(slots=True)
class PipelineOutcome:
    """整条 pipeline 运行的产物记录。"""

    run_id: str
    collect: CollectResult | None = None
    analyze: AnalyzeResult | None = None
    report: ReportResult | None = None
    stage_errors: dict[str, str] = field(default_factory=dict)


class Pipeline:
    """组合 collector / analyzer / reporter 三类插件的编排器。"""

    def __init__(
        self,
        collector_name: str,
        analyzer_name: str,
        reporter_name: str,
        registry: PluginRegistry | None = None,
    ) -> None:
        self._registry = registry or default_registry()
        self._collector_name = collector_name
        self._analyzer_name = analyzer_name
        self._reporter_name = reporter_name

    def run(self, job: PipelineJob) -> PipelineOutcome:
        """按 job.stages 执行。任何一段失败立即抛出，由上层决定如何处理。"""
        workspace = Workspace(job.workspace)
        workspace.ensure()
        outcome = PipelineOutcome(run_id=job.run_id)

        if "collect" in job.stages:
            outcome.collect = self._run_collect(job)
        if "analyze" in job.stages:
            outcome.analyze = self._run_analyze(job)
        if "report" in job.stages:
            outcome.report = self._run_report(job, outcome.analyze)
        return outcome

    # ---------- 分阶段 ----------

    def _run_collect(self, job: PipelineJob) -> CollectResult:
        if job.url is None:
            raise ValueError("collect 阶段需要 job.url")
        collector = self._registry.get_collector(self._collector_name)
        _log.info("开始 collect: plugin=%s url=%s", self._collector_name, job.url)
        return collector.collect(
            CollectJob(
                run_id=job.run_id,
                workspace=job.workspace,
                url=job.url,
                sample_count=job.sample_count,
                options=job.options,
            )
        )

    def _run_analyze(self, job: PipelineJob) -> AnalyzeResult:
        analyzer = self._registry.get_analyzer(self._analyzer_name)
        _log.info("开始 analyze: plugin=%s workspace=%s", self._analyzer_name, job.workspace)
        return analyzer.analyze(
            AnalyzeJob(
                run_id=job.run_id,
                workspace=job.workspace,
                focus_count=job.focus_count,
                options=job.options,
            )
        )

    def _run_report(self, job: PipelineJob, analyze_result: AnalyzeResult | None) -> ReportResult:
        reporter = self._registry.get_reporter(self._reporter_name)
        if analyze_result is None:
            # 单跑 report 时（断点续跑），允许默认在 reports/<run_id>/ 下查找
            artifacts_dir = job.workspace / "reports" / job.run_id
        else:
            artifacts_dir = analyze_result.artifacts_dir
        _log.info(
            "开始 report: plugin=%s artifacts_dir=%s", self._reporter_name, artifacts_dir
        )
        return reporter.render(
            ReportJob(
                run_id=job.run_id,
                workspace=job.workspace,
                artifacts_dir=artifacts_dir,
                options=job.options,
            )
        )


__all__ = ["Pipeline", "PipelineOutcome"]
