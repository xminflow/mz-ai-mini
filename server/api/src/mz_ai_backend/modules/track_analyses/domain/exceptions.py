from __future__ import annotations

from http import HTTPStatus

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import BusinessException


class TrackAnalysisNotFoundException(BusinessException):
    """目标赛道分析不存在或已下线。"""

    def __init__(self, *, slug: str) -> None:
        super().__init__(
            error_code=ErrorCode.TRACK_ANALYSIS_NOT_FOUND,
            message="Track analysis not found.",
            http_status=HTTPStatus.NOT_FOUND,
            details={"slug": slug},
        )


class TrackReportNotFoundException(BusinessException):
    """目标赛道下指定 key 的报告不存在。"""

    def __init__(self, *, slug: str, report_key: str) -> None:
        super().__init__(
            error_code=ErrorCode.TRACK_ANALYSIS_REPORT_NOT_FOUND,
            message="Track analysis report not found.",
            http_status=HTTPStatus.NOT_FOUND,
            details={"slug": slug, "report_key": report_key},
        )


class TrackAnalysisAccessDeniedException(BusinessException):
    """用户无权查看此赛道报告（非免费内容且无有效会员）。"""

    def __init__(self, *, slug: str) -> None:
        super().__init__(
            error_code=ErrorCode.TRACK_ANALYSIS_ACCESS_DENIED,
            message="Membership required to view this track analysis report.",
            http_status=HTTPStatus.FORBIDDEN,
            details={"slug": slug},
        )
