"""插件协议。三类插件 + 通用元信息。

后续新增"采集 / 拆解 / 报告"模块时，实现下面任一 Protocol 即可，
通过 `registry.register_*` 注入到 CLI。
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol, runtime_checkable

from research_kit.core.contracts import (
    AnalyzeJob,
    AnalyzeResult,
    CollectJob,
    CollectResult,
    ReportJob,
    ReportResult,
)


@dataclass(frozen=True, slots=True)
class PluginInfo:
    """供 CLI 展示与 inspect 用的插件元信息。"""

    name: str
    kind: str  # "collector" | "analyzer" | "reporter"
    description: str
    extras_required: tuple[str, ...] = ()
    """需要的 pip extras，例如 ('browser', 'transcribe')。空则表示无额外依赖。"""


@runtime_checkable
class Collector(Protocol):
    """采集器：把外部世界的数据落到 workspace。

    实现者负责写 profile.json / 各作品子目录 / sampling.json。
    """

    info: PluginInfo

    def collect(self, job: CollectJob) -> CollectResult: ...


@runtime_checkable
class Analyzer(Protocol):
    """分析器：读取 workspace 中的素材，调用 skill 产出报告。"""

    info: PluginInfo
    skill_name: str

    def analyze(self, job: AnalyzeJob) -> AnalyzeResult: ...


@runtime_checkable
class Reporter(Protocol):
    """报告器：对 analyzer 产出做后处理（如内嵌图片、压缩、归档）。"""

    info: PluginInfo

    def render(self, job: ReportJob) -> ReportResult: ...


__all__ = ["Analyzer", "Collector", "PluginInfo", "Reporter"]
