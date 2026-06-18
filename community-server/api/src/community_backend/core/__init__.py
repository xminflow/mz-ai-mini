"""Core framework boundaries and shared infrastructure.

Usage:
- Import `create_app` to construct the configured FastAPI application.

Development rules:
- Keep engine, session, logging, and configuration wiring centralized here.
- Do not place feature/business logic in this package.
"""

from .application import create_app

__all__ = ["create_app"]
