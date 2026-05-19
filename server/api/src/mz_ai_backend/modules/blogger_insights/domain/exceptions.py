from __future__ import annotations

from http import HTTPStatus

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
