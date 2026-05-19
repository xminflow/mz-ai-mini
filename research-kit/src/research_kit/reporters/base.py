"""报告器插件基类。"""

from __future__ import annotations

from research_kit.core.contracts import ReportJob, ReportResult
from research_kit.core.logging import get_logger
from research_kit.core.plugin import PluginInfo


class ReporterBase:
    """便利基类。子类需要定义 `info`，并实现 `render`。"""

    info: PluginInfo

    def __init__(self) -> None:
        self._log = get_logger(self.__class__.__module__)

    def render(self, job: ReportJob) -> ReportResult:  # pragma: no cover - 抽象
        raise NotImplementedError


__all__ = ["ReporterBase"]
