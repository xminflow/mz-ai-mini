"""Public entrypoints for the wechat_callback module.

Usage:
- Import `router` to register the shared WeChat official-account callback endpoint.

Development rules:
- Keep public exports limited to stable routing contracts.
- wechat_callback may import from agent_auth and camp_auth, never the reverse.
"""

from .presentation.router import router

__all__ = ["router"]
