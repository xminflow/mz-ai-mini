from __future__ import annotations

from http import HTTPStatus

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import BusinessException

from .entities import CampMembershipTier


class CampMembershipSkuInvalidException(BusinessException):
    """SKU 不受支持。"""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_MEMBERSHIP_SKU_INVALID,
            message="Camp membership SKU is invalid.",
            http_status=HTTPStatus.BAD_REQUEST,
        )


class CampMembershipOrderNotFoundException(BusinessException):
    """订单不存在。"""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_MEMBERSHIP_ORDER_NOT_FOUND,
            message="Camp membership order does not exist.",
            http_status=HTTPStatus.NOT_FOUND,
        )


class CampMembershipOrderForbiddenException(BusinessException):
    """订单不属于当前账号。"""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_MEMBERSHIP_ORDER_FORBIDDEN,
            message="Camp membership order is forbidden.",
            http_status=HTTPStatus.FORBIDDEN,
        )


class CampMembershipOrderStatusInvalidException(BusinessException):
    """订单状态迁移非法。"""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_MEMBERSHIP_ORDER_STATUS_INVALID,
            message="Camp membership order state is invalid.",
            http_status=HTTPStatus.CONFLICT,
        )


class CampMembershipAlreadyActiveException(BusinessException):
    """已有有效会员期间不可再次下单（不升级、不叠加续费）。"""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_MEMBERSHIP_ALREADY_ACTIVE,
            message="Camp membership is still active; new order is not allowed.",
            http_status=HTTPStatus.CONFLICT,
        )


class CampMembershipTierRequiredException(BusinessException):
    """门禁：当前等级不满足受保护资源所需等级。details 带 required/current。"""

    def __init__(
        self,
        *,
        required: CampMembershipTier,
        current: CampMembershipTier,
    ) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_MEMBERSHIP_TIER_REQUIRED,
            message="Camp membership tier is insufficient.",
            http_status=HTTPStatus.FORBIDDEN,
            details={"required": required.value, "current": current.value},
        )
