"""douyin-browser collector：抖音博主主页采集。

链路：Patchright 浏览器 → 主页 DOM 抓取 → 作品列表分层抽样
     → yt-dlp 下载视频 → ffmpeg 抽帧 + 提取音频 → faster-whisper 转录
     → 写入 workspace。

参考：ua-agent/frontend/src/utility/keyword-crawl/handlers/blogger.ts
"""

from __future__ import annotations

from research_kit.collectors.base import CollectorBase
from research_kit.collectors.douyin_browser.runner import run_collect
from research_kit.core.contracts import CollectJob, CollectResult
from research_kit.core.plugin import PluginInfo
from research_kit.core.registry import PluginRegistry


class DouyinBrowserCollector(CollectorBase):
    info = PluginInfo(
        name="douyin-browser",
        kind="collector",
        description="通过 Patchright 浏览器自动化采集抖音博主主页资料、作品列表、视频、关键帧与转录。",
        extras_required=(),  # 已升为默认依赖
    )

    def collect(self, job: CollectJob) -> CollectResult:
        return run_collect(job)


def register(registry: PluginRegistry) -> None:
    registry.register_collector(DouyinBrowserCollector())


__all__ = ["DouyinBrowserCollector", "register"]
