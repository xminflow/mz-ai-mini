"""Infrastructure exports for the camp_auth module.

Usage:
- Import dependency factories and repository implementations from this package.

Development rules:
- Keep framework and persistence details here.
- Convert infrastructure objects into domain entities before returning.
"""

from .dependencies import (
    get_camp_account_repository,
    get_camp_token_service,
    get_create_wechat_login_session_use_case,
    get_current_camp_access_token,
    get_delete_camp_account_use_case,
    get_dev_camp_fake_login_use_case,
    get_exchange_wechat_login_use_case,
    get_get_camp_account_use_case,
    get_get_current_camp_account_use_case,
    get_get_wechat_login_session_use_case,
    get_handle_camp_wechat_callback_use_case,
    get_list_camp_accounts_use_case,
    get_logout_camp_session_use_case,
    get_refresh_camp_session_use_case,
    get_update_camp_account_membership_use_case,
    get_update_camp_account_status_use_case,
)
from .repositories import SqlAlchemyCampAccountRepository

__all__ = [
    "SqlAlchemyCampAccountRepository",
    "get_camp_account_repository",
    "get_camp_token_service",
    "get_create_wechat_login_session_use_case",
    "get_current_camp_access_token",
    "get_delete_camp_account_use_case",
    "get_dev_camp_fake_login_use_case",
    "get_exchange_wechat_login_use_case",
    "get_get_camp_account_use_case",
    "get_get_current_camp_account_use_case",
    "get_get_wechat_login_session_use_case",
    "get_handle_camp_wechat_callback_use_case",
    "get_list_camp_accounts_use_case",
    "get_logout_camp_session_use_case",
    "get_refresh_camp_session_use_case",
    "get_update_camp_account_membership_use_case",
    "get_update_camp_account_status_use_case",
]
