"""Public package entrypoints for the backend service.

Usage:
- Import `create_app` to construct the FastAPI application.
- Import `__version__` for service metadata only.

Development rules:
- Keep this package as the only stable import root for external callers.
- Do not re-export module internals that are not part of the public contract.
"""

from .core import create_app

__all__ = ["__version__", "create_app"]

__version__ = "0.1.0"
