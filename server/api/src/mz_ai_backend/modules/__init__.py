"""Public module registry for application routers.

Usage:
- Import exported routers from this package when wiring the application.

Development rules:
- Re-export routers only.
- Keep module internals behind their own package boundaries.
"""

from .auth import router as auth_router
from .agent_auth import router as agent_auth_router
from .business_cases import router as business_cases_router
from .case_research import router as case_research_router
from .consultations import router as consultations_router
from .membership import router as membership_router
from .system import router as system_router

__all__ = [
    "agent_auth_router",
    "auth_router",
    "business_cases_router",
    "case_research_router",
    "consultations_router",
    "membership_router",
    "system_router",
]
