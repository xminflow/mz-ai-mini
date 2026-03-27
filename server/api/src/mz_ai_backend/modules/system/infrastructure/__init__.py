"""Infrastructure exports for the system module.

Usage:
- Import dependency factories from this package when wiring presentation code.

Development rules:
- Keep framework-specific construction logic here.
- Do not place domain rules in this package.
"""

from .dependencies import get_health_status_use_case

__all__ = ["get_health_status_use_case"]
