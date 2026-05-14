"""Public entrypoints for the agent_auth module.

Usage:
- Import `router` to register agent_auth HTTP endpoints.

Development rules:
- Keep public exports limited to stable routing contracts.
- Hide implementation details behind package boundaries.
"""

from .presentation import router

__all__ = ["router"]
