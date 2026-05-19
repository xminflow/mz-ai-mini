"""html-multi reporter 占位实现。

真实整理逻辑由 PR3 提供：把图片转 base64 内嵌进 HTML、生成 index.json、清理临时文件。

PR1 只暴露 PluginInfo + 一个最小的"枚举 HTML 文件"实现，便于在 fixture 模式下
跑通骨架（即使 analyzer 还没接入 LLM，也能用手工放进 reports/ 的 HTML 来验
证 reporter 路径）。
"""

from __future__ import annotations

from pathlib import Path

from research_kit.core.contracts import ReportJob, ReportResult
from research_kit.core.plugin import PluginInfo
from research_kit.core.registry import PluginRegistry
from research_kit.reporters.base import ReporterBase


class HtmlMultiReporter(ReporterBase):
    info = PluginInfo(
        name="html-multi",
        kind="reporter",
        description="枚举 reports/ 目录下的 HTML 产物。图片内嵌由 skill 中的 Bash 步骤完成，本插件仅做归档清点。",
    )

    def render(self, job: ReportJob) -> ReportResult:
        artifacts_dir = job.artifacts_dir
        if not artifacts_dir.exists():
            raise FileNotFoundError(f"artifacts_dir 不存在：{artifacts_dir}")
        html_files = sorted(artifacts_dir.glob("*.html"))
        self._log.info(
            "html-multi 枚举到 %d 份 HTML（PR3 将在此处加入图片内嵌等处理）",
            len(html_files),
        )
        return ReportResult(
            run_id=job.run_id,
            artifacts=[Path(p) for p in html_files],
        )


def register(registry: PluginRegistry) -> None:
    registry.register_reporter(HtmlMultiReporter())


__all__ = ["HtmlMultiReporter", "register"]
