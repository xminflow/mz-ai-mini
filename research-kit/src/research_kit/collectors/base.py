"""采集器插件基类。提供共享的失败容器与日志钩子。

具体采集器实现 `Collector` 协议（research_kit.core.plugin.Collector）。
继承本基类是可选的，仅作为便利的实现起点。
"""

from __future__ import annotations

from research_kit.core.contracts import CollectJob, CollectResult
from research_kit.core.logging import get_logger
from research_kit.core.plugin import PluginInfo


class CollectorBase:
    """便利基类。子类需要：

    1. 定义类属性 `info: PluginInfo`
    2. 实现 `collect(self, job: CollectJob) -> CollectResult`
    """

    info: PluginInfo

    def __init__(self) -> None:
        self._log = get_logger(self.__class__.__module__)

    def collect(self, job: CollectJob) -> CollectResult:  # pragma: no cover - 抽象
        raise NotImplementedError


__all__ = ["CollectorBase"]
