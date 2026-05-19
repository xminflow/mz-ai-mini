"""插件注册表。

内置插件通过 `register_*` 显式注册；外部插件通过 `pyproject.toml` 暴露的
entry_points `research_kit.collectors` / `research_kit.analyzers` /
`research_kit.reporters` 自动发现。

CLI 启动时调用 `discover_builtin_plugins()` 装载所有内置实现。
"""

from __future__ import annotations

from dataclasses import dataclass, field
from importlib.metadata import entry_points
from typing import Iterable

from research_kit.core.logging import get_logger
from research_kit.core.plugin import Analyzer, Collector, PluginInfo, Reporter

_log = get_logger(__name__)


class PluginRegistry:
    """单例式注册表。CLI 与测试通过 `default_registry()` 共享同一份。"""

    def __init__(self) -> None:
        self._collectors: dict[str, Collector] = {}
        self._analyzers: dict[str, Analyzer] = {}
        self._reporters: dict[str, Reporter] = {}

    # ---------- 注册 ----------

    def register_collector(self, collector: Collector) -> None:
        name = collector.info.name
        if name in self._collectors:
            raise ValueError(f"collector 名称冲突：{name}")
        self._collectors[name] = collector

    def register_analyzer(self, analyzer: Analyzer) -> None:
        name = analyzer.info.name
        if name in self._analyzers:
            raise ValueError(f"analyzer 名称冲突：{name}")
        self._analyzers[name] = analyzer

    def register_reporter(self, reporter: Reporter) -> None:
        name = reporter.info.name
        if name in self._reporters:
            raise ValueError(f"reporter 名称冲突：{name}")
        self._reporters[name] = reporter

    # ---------- 查询 ----------

    def get_collector(self, name: str) -> Collector:
        if name not in self._collectors:
            raise KeyError(f"collector 未注册：{name}，已注册：{sorted(self._collectors)}")
        return self._collectors[name]

    def get_analyzer(self, name: str) -> Analyzer:
        if name not in self._analyzers:
            raise KeyError(f"analyzer 未注册：{name}，已注册：{sorted(self._analyzers)}")
        return self._analyzers[name]

    def get_reporter(self, name: str) -> Reporter:
        if name not in self._reporters:
            raise KeyError(f"reporter 未注册：{name}，已注册：{sorted(self._reporters)}")
        return self._reporters[name]

    def list_collectors(self) -> list[PluginInfo]:
        return [c.info for c in self._collectors.values()]

    def list_analyzers(self) -> list[PluginInfo]:
        return [a.info for a in self._analyzers.values()]

    def list_reporters(self) -> list[PluginInfo]:
        return [r.info for r in self._reporters.values()]

    def all(self) -> "RegistrySnapshot":
        return RegistrySnapshot(
            collectors=self.list_collectors(),
            analyzers=self.list_analyzers(),
            reporters=self.list_reporters(),
        )

    def reset(self) -> None:
        """主要供测试使用，清空所有注册。"""
        self._collectors.clear()
        self._analyzers.clear()
        self._reporters.clear()


@dataclass(frozen=True, slots=True)
class RegistrySnapshot:
    collectors: list[PluginInfo] = field(default_factory=list)
    analyzers: list[PluginInfo] = field(default_factory=list)
    reporters: list[PluginInfo] = field(default_factory=list)


# ---------- 模块级单例 ----------

_default = PluginRegistry()


def default_registry() -> PluginRegistry:
    """获取进程内默认注册表。"""
    return _default


# ---------- 自动发现 ----------


def discover_builtin_plugins(registry: PluginRegistry | None = None) -> None:
    """注册仓库内置插件。

    这里显式 import 内置插件包以触发它们的注册副作用，比依赖 entry_points 更稳。
    新增内置插件时在下面的列表里加一行即可。
    """
    reg = registry or _default

    # 内置 collectors / analyzers / reporters。
    # 这些模块在导入时会调用 register_* 注册自己。
    _import_and_register("research_kit.collectors.douyin_browser", reg)
    _import_and_register("research_kit.analyzers.douyin_blogger", reg)
    _import_and_register("research_kit.reporters.html_multi", reg)


def discover_external_plugins(registry: PluginRegistry | None = None) -> None:
    """通过 entry_points 装载外部插件。失败时降级为 warning，不中断 CLI。"""
    reg = registry or _default
    groups = ("research_kit.collectors", "research_kit.analyzers", "research_kit.reporters")
    for group in groups:
        try:
            for ep in _iter_entry_points(group):
                _load_entry_point(ep, reg)
        except Exception as exc:  # pragma: no cover - 防御性
            _log.warning("加载 entry_points %s 失败: %s", group, exc)


def _import_and_register(module_name: str, reg: PluginRegistry) -> None:
    try:
        import importlib

        module = importlib.import_module(module_name)
    except ImportError as exc:
        _log.warning("跳过内置插件 %s: %s", module_name, exc)
        return
    register = getattr(module, "register", None)
    if register is None:
        _log.warning("内置插件模块 %s 未定义 register(registry)，已跳过", module_name)
        return
    try:
        register(reg)
    except Exception as exc:  # pragma: no cover
        _log.warning("内置插件 %s 注册失败: %s", module_name, exc)


def _iter_entry_points(group: str) -> Iterable:
    eps = entry_points()
    if hasattr(eps, "select"):
        return eps.select(group=group)  # type: ignore[no-any-return]
    return eps.get(group, [])  # type: ignore[attr-defined,no-any-return]


def _load_entry_point(ep, reg: PluginRegistry) -> None:  # type: ignore[no-untyped-def]
    try:
        register = ep.load()
        register(reg)
        _log.debug("已加载外部插件: %s", ep.name)
    except Exception as exc:  # pragma: no cover
        _log.warning("外部插件 %s 加载失败: %s", ep.name, exc)


__all__ = [
    "PluginRegistry",
    "RegistrySnapshot",
    "default_registry",
    "discover_builtin_plugins",
    "discover_external_plugins",
]
