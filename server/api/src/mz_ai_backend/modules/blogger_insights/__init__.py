"""Public entrypoints for the blogger_insights module.

用途：
- 导出 router 给应用注册。
- 公开 API：列表与详情查询（无需认证）。
- 受保护 API：研究工具上传/更新博主分析报告（基于 X-Import-Token）。

开发规则：
- 仅暴露稳定路由对外。
- 内部实现保留在子包内。
"""

from .presentation import router

__all__ = ["router"]
