"""结构化日志。遵循 CLAUDE.md / AGENTS.md 的日志规范。

- 默认输出到 stderr（CLI 友好），可通过 configure_logging 切换到文件。
- 区分 debug/info/warning/error 级别，debug 级别完整体现数据流。
- 不输出敏感信息：在记录 settings 前调用 mask_sensitive。
"""

from __future__ import annotations

import logging
import logging.handlers
import sys
from pathlib import Path
from typing import Any

_DEFAULT_FORMAT = "%(asctime)s %(levelname)-7s %(name)s :: %(message)s"
_DATEFMT = "%Y-%m-%d %H:%M:%S"

_SENSITIVE_KEYS = frozenset(
    {
        "api_key",
        "anthropic_api_key",
        "authorization",
        "cookie",
        "cookies",
        "password",
        "secret",
        "token",
    }
)


def configure_logging(
    level: str = "INFO",
    log_file: Path | None = None,
    fmt: str = _DEFAULT_FORMAT,
) -> None:
    """初始化根 logger。重复调用是幂等的（先清空已有 handler）。"""
    root = logging.getLogger()
    for handler in list(root.handlers):
        root.removeHandler(handler)

    root.setLevel(level.upper())
    formatter = logging.Formatter(fmt, datefmt=_DATEFMT)

    stream = logging.StreamHandler(stream=sys.stderr)
    stream.setFormatter(formatter)
    root.addHandler(stream)

    if log_file is not None:
        log_file.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.handlers.RotatingFileHandler(
            log_file, maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8"
        )
        file_handler.setFormatter(formatter)
        root.addHandler(file_handler)


def get_logger(name: str) -> logging.Logger:
    """模块内取 logger 的统一入口。"""
    return logging.getLogger(name)


def mask_sensitive(payload: dict[str, Any]) -> dict[str, Any]:
    """对包含敏感键的 dict 做脱敏，用于日志输出。

    不修改入参，返回新 dict。键名匹配大小写不敏感的子串。
    """
    masked: dict[str, Any] = {}
    for key, value in payload.items():
        lowered = key.lower()
        if any(s in lowered for s in _SENSITIVE_KEYS):
            masked[key] = _mask_value(value)
        elif isinstance(value, dict):
            masked[key] = mask_sensitive(value)  # type: ignore[arg-type]
        else:
            masked[key] = value
    return masked


def _mask_value(value: Any) -> str:
    if value is None:
        return "<unset>"
    s = str(value)
    if len(s) <= 8:
        return "***"
    return f"{s[:4]}***{s[-2:]}"
