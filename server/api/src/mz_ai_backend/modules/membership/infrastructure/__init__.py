"""Infrastructure exports for the membership module.

Usage:
- Import dependency factories and repository implementations from this package.

Development rules:
- Keep framework and persistence details here.
- Convert infrastructure objects into domain entities before returning.
"""

from .dependencies import (
    SystemCurrentTimeProvider,
    get_create_membership_order_use_case,
    get_current_mini_program_identity,
    get_current_time_provider,
    get_get_membership_order_use_case,
    get_handle_wechat_pay_notify_use_case,
    get_membership_repository,
    get_snowflake_id_generator,
    get_wechat_pay_gateway,
)
from .repositories import SqlAlchemyMembershipRepository
from .wechat_pay_gateway import WechatPayV3Gateway

__all__ = [
    "SqlAlchemyMembershipRepository",
    "SystemCurrentTimeProvider",
    "WechatPayV3Gateway",
    "get_create_membership_order_use_case",
    "get_current_mini_program_identity",
    "get_current_time_provider",
    "get_get_membership_order_use_case",
    "get_handle_wechat_pay_notify_use_case",
    "get_membership_repository",
    "get_snowflake_id_generator",
    "get_wechat_pay_gateway",
]
