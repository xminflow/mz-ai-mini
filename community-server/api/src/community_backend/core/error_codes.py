from __future__ import annotations

from enum import StrEnum


class ErrorCode(StrEnum):
    """Stable application error codes shared across API responses.

    本期仅含通用码；后续业务模块按 `<MODULE>.<REASON>` 命名追加。
    """

    COMMON_SUCCESS = "COMMON.SUCCESS"
    COMMON_VALIDATION_ERROR = "COMMON.VALIDATION_ERROR"
    COMMON_BUSINESS_ERROR = "COMMON.BUSINESS_ERROR"
    SYSTEM_INTERNAL_ERROR = "SYSTEM.INTERNAL_ERROR"
    SYSTEM_UNEXPECTED_ERROR = "SYSTEM.UNEXPECTED_ERROR"


__all__ = ["ErrorCode"]
