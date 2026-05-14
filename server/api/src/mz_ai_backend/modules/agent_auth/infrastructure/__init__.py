"""Infrastructure exports for the agent_auth module.

Usage:
- Import dependency factories and repository implementations from this package.

Development rules:
- Keep framework and persistence details here.
- Convert infrastructure objects into domain entities before returning.
"""

from .dependencies import (
    get_agent_account_repository,
    get_create_wechat_login_session_use_case,
    get_current_agent_access_token,
    get_email_login_delivery_gateway,
    get_exchange_wechat_login_use_case,
    get_get_current_agent_account_use_case,
    get_get_wechat_login_session_use_case,
    get_handle_wechat_callback_use_case,
    get_official_wechat_gateway,
    get_logout_agent_session_use_case,
    get_request_email_login_challenge_use_case,
    get_refresh_agent_session_use_case,
    get_token_service,
    get_verify_email_login_challenge_use_case,
)
from .repositories import SqlAlchemyAgentAccountRepository

__all__ = [
    "SqlAlchemyAgentAccountRepository",
    "get_agent_account_repository",
    "get_create_wechat_login_session_use_case",
    "get_current_agent_access_token",
    "get_email_login_delivery_gateway",
    "get_exchange_wechat_login_use_case",
    "get_get_current_agent_account_use_case",
    "get_get_wechat_login_session_use_case",
    "get_handle_wechat_callback_use_case",
    "get_official_wechat_gateway",
    "get_logout_agent_session_use_case",
    "get_request_email_login_challenge_use_case",
    "get_refresh_agent_session_use_case",
    "get_token_service",
    "get_verify_email_login_challenge_use_case",
]
