"""插件注册表行为验证。"""

from __future__ import annotations

import pytest

from research_kit.core.contracts import AnalyzeJob, AnalyzeResult, CollectJob, CollectResult, ReportJob, ReportResult
from research_kit.core.plugin import PluginInfo
from research_kit.core.registry import PluginRegistry, discover_builtin_plugins


class FakeCollector:
    info = PluginInfo(name="fake-collector", kind="collector", description="d")

    def collect(self, job: CollectJob) -> CollectResult:  # pragma: no cover
        raise NotImplementedError


class FakeAnalyzer:
    info = PluginInfo(name="fake-analyzer", kind="analyzer", description="d")
    skill_name = "fake-skill"

    def analyze(self, job: AnalyzeJob) -> AnalyzeResult:  # pragma: no cover
        raise NotImplementedError


class FakeReporter:
    info = PluginInfo(name="fake-reporter", kind="reporter", description="d")

    def render(self, job: ReportJob) -> ReportResult:  # pragma: no cover
        raise NotImplementedError


def test_register_and_lookup() -> None:
    reg = PluginRegistry()
    reg.register_collector(FakeCollector())
    reg.register_analyzer(FakeAnalyzer())
    reg.register_reporter(FakeReporter())
    assert reg.get_collector("fake-collector").info.name == "fake-collector"
    assert reg.get_analyzer("fake-analyzer").skill_name == "fake-skill"
    assert reg.get_reporter("fake-reporter").info.kind == "reporter"


def test_duplicate_registration_raises() -> None:
    reg = PluginRegistry()
    reg.register_collector(FakeCollector())
    with pytest.raises(ValueError):
        reg.register_collector(FakeCollector())


def test_missing_lookup_raises_helpful_keyerror() -> None:
    reg = PluginRegistry()
    with pytest.raises(KeyError) as exc:
        reg.get_collector("nonexistent")
    assert "nonexistent" in str(exc.value)


def test_discover_builtin_plugins_registers_three_placeholders() -> None:
    reg = PluginRegistry()
    discover_builtin_plugins(reg)
    snapshot = reg.all()
    names = {info.name for info in snapshot.collectors + snapshot.analyzers + snapshot.reporters}
    assert {"douyin-browser", "douyin-blogger", "html-multi"}.issubset(names)


def test_reset_clears_registry() -> None:
    reg = PluginRegistry()
    reg.register_collector(FakeCollector())
    reg.reset()
    assert reg.list_collectors() == []
