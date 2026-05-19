"""douyin-blogger analyzer 占位实现。

真实拆解逻辑由 PR3 提供：装载 `douyin-blogger-report-v2` skill，
调用 Anthropic SDK，把多份 HTML 流式写入 reports/<run_id>/。

PR1 只暴露 PluginInfo，analyze 时给出明确的未实现错误。
"""

from __future__ import annotations

from research_kit.analyzers.base import AnalyzerBase
from research_kit.core.contracts import AnalyzeJob, AnalyzeResult
from research_kit.core.plugin import PluginInfo
from research_kit.core.registry import PluginRegistry


class DouyinBloggerAnalyzer(AnalyzerBase):
    info = PluginInfo(
        name="douyin-blogger",
        kind="analyzer",
        description="占位。默认路径下分析由 Claude Code 直接调 skill 完成；本插件保留供未来无人值守路径接入 LLM。",
    )
    skill_name = "douyin-blogger-report-v2"

    def analyze(self, job: AnalyzeJob) -> AnalyzeResult:
        raise NotImplementedError(
            "douyin-blogger analyzer 当前仅作占位。"
            " 默认路径下分析在 Claude Code 中由 douyin-blogger-report-v2 skill 编排完成，"
            " 不需要调用此 Python 端 analyzer。"
            " 若未来要做无人值守批量分析，可在此接 Anthropic SDK + skill。"
        )


def register(registry: PluginRegistry) -> None:
    registry.register_analyzer(DouyinBloggerAnalyzer())


__all__ = ["DouyinBloggerAnalyzer", "register"]
