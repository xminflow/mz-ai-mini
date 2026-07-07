"""Public entrypoints for the admin_auth module."""

from .presentation import require_admin, router

__all__ = ["require_admin", "router"]

