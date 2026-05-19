"""分析器插件基类。"""

from __future__ import annotations

from research_kit.core.contracts import AnalyzeJob, AnalyzeResult
from research_kit.core.logging import get_logger
from research_kit.core.plugin import PluginInfo


class AnalyzerBase:
    """便利基类。子类需要定义 `info`、`skill_name`，并实现 `analyze`。"""

    info: PluginInfo
    skill_name: str

    def __init__(self) -> None:
        self._log = get_logger(self.__class__.__module__)

    def analyze(self, job: AnalyzeJob) -> AnalyzeResult:  # pragma: no cover - 抽象
        raise NotImplementedError


__all__ = ["AnalyzerBase"]
