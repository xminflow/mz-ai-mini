"""Public module registry for application routers.

Usage:
- Import exported routers from this package when wiring the application.

Development rules:
- Re-export routers only.
- Keep module internals behind their own package boundaries.
"""

from .auth import router as auth_router
from .admin_auth import router as admin_auth_router
from .agent_auth import router as agent_auth_router
from .camp_auth import router as camp_auth_router
from .camp_membership import router as camp_membership_router
from .wechat_callback import router as wechat_callback_router
from .account_membership import router as account_membership_router
from .blogger_insights import router as blogger_insights_router
from .business_cases import router as business_cases_router
from .case_research import router as case_research_router
from .consultations import router as consultations_router
from .member_submissions import router as member_submissions_router
from .membership import router as membership_router
from .system import router as system_router
from .track_analyses import router as track_analyses_router

__all__ = [
    "admin_auth_router",
    "agent_auth_router",
    "camp_auth_router",
    "camp_membership_router",
    "wechat_callback_router",
    "account_membership_router",
    "auth_router",
    "blogger_insights_router",
    "business_cases_router",
    "case_research_router",
    "consultations_router",
    "member_submissions_router",
    "membership_router",
    "system_router",
    "track_analyses_router",
]
