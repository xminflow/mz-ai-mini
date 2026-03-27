"""Domain exports for the system module.

Usage:
- Import `ServiceHealth` from this package within the module only.

Development rules:
- Keep domain models framework agnostic.
- Do not import presentation or infrastructure code here.
"""

from .entities import ServiceHealth

__all__ = ["ServiceHealth"]
