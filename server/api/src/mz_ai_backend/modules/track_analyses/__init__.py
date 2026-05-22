"""Public entrypoints for the track_analyses module.

用途：
- 导出 router 给应用注册。
- 公开 API：赛道分析列表 / 详情 / 单份报告查询（无需认证）。
- 受保护 API：研究工具上传/更新赛道分析报告（基于 X-Import-Token）。

开发规则：
- 仅暴露稳定路由对外。
- 内部实现保留在子包内。
"""

from .presentation import router

__all__ = ["router"]
