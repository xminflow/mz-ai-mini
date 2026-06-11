"""Use case exports for the camp_auth module.

Usage:
- Import camp_auth use cases from this package.

Development rules:
- Keep use cases small and deterministic.
- Handle business branching here instead of routers.
"""

from ._session_tokens import issue_camp_auth_tokens
from .create_wechat_login_session import CreateCampWechatLoginSessionUseCase
from .exchange_wechat_login import ExchangeCampWechatLoginUseCase
from .get_current_camp_account import GetCurrentCampAccountUseCase
from .get_wechat_login_session import GetCampWechatLoginSessionUseCase
from .handle_wechat_callback import HandleCampWechatCallbackUseCase, LOGIN_SCENE_PREFIX
from .logout_camp_session import LogoutCampSessionUseCase
from .refresh_camp_session import RefreshCampSessionUseCase

__all__ = [
    "issue_camp_auth_tokens",
    "CreateCampWechatLoginSessionUseCase",
    "ExchangeCampWechatLoginUseCase",
    "GetCurrentCampAccountUseCase",
    "GetCampWechatLoginSessionUseCase",
    "HandleCampWechatCallbackUseCase",
    "LOGIN_SCENE_PREFIX",
    "LogoutCampSessionUseCase",
    "RefreshCampSessionUseCase",
]
