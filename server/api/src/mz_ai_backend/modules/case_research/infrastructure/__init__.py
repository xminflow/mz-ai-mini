"""Infrastructure exports for the case_research module.

Usage:
- Import dependency factories and repository implementations from this package.

Development rules:
- Keep framework and persistence details here.
- Convert infrastructure objects into domain entities before returning.
"""

from .dependencies import (
    get_case_research_repository,
    get_create_order_use_case,
    get_create_public_request_use_case,
    get_current_mini_program_identity,
    get_get_order_use_case,
    get_handle_notify_use_case,
    get_list_requests_use_case,
    get_snowflake_id_generator,
    get_wechat_pay_gateway,
)
from .repositories import SqlAlchemyCaseResearchRepository

__all__ = [
    "SqlAlchemyCaseResearchRepository",
    "get_case_research_repository",
    "get_create_order_use_case",
    "get_create_public_request_use_case",
    "get_current_mini_program_identity",
    "get_get_order_use_case",
    "get_handle_notify_use_case",
    "get_list_requests_use_case",
    "get_snowflake_id_generator",
    "get_wechat_pay_gateway",
]
