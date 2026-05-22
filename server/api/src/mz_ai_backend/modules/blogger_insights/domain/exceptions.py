from __future__ import annotations

from http import HTTPStatus
from typing import Any

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import BusinessException


class BloggerInsightNotFoundException(BusinessException):
    """目标博主洞察不存在或已下线。"""

    def __init__(self, *, slug: str) -> None:
        super().__init__(
            error_code=ErrorCode.BLOGGER_INSIGHT_NOT_FOUND,
            message="Blogger insight not found.",
            http_status=HTTPStatus.NOT_FOUND,
            details={"slug": slug},
        )


class BloggerInsightAccessDeniedException(BusinessException):
    """用户无权查看此博主洞察（非免费内容且无有效会员）。

    details 中携带博主基础元数据，供前端渲染付费墙时展示预览信息。
    """

    def __init__(self, *, slug: str, meta: dict[str, Any]) -> None:
        super().__init__(
            error_code=ErrorCode.BLOGGER_INSIGHT_ACCESS_DENIED,
            message="Membership required to view this blogger insight.",
            http_status=HTTPStatus.FORBIDDEN,
            details={"slug": slug, **meta},
        )
