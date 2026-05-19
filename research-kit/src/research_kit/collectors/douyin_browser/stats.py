"""抖音粉丝数 / 获赞数文本解析。

抖音前端把数值显示为"123""1.2万""3.4亿""1.5w""500k"等多种形式。
此模块把这些字符串还原为整数。-1 表示无法解析（与 ua-agent 行为一致）。
"""

from __future__ import annotations

import re

_UNITS = {
    "万": 10_000,
    "w": 10_000,
    "亿": 100_000_000,
    "k": 1_000,
    "千": 1_000,
}

_NUM_RE = re.compile(r"^([\d.,]+)\s*([一-鿿a-zA-Z]*)$")


def parse_stat(text: str | None) -> int:
    """通用 stat（关注 / 获赞）解析。无法解析返回 -1。"""
    if text is None:
        return -1
    cleaned = text.strip().replace(" ", "")
    if not cleaned:
        return -1
    match = _NUM_RE.match(cleaned)
    if match is None:
        return -1
    num_str, unit = match.group(1), match.group(2).lower()
    num_str = num_str.replace(",", "")
    try:
        value = float(num_str)
    except ValueError:
        return -1
    multiplier = _UNITS.get(unit, 1) if unit else 1
    return int(value * multiplier)


def parse_follower_stat(text: str | None) -> int:
    """粉丝数解析。当前与 parse_stat 一致；保留独立入口与 ua-agent 同步。

    抖音对粉丝数有时显示 "1.2 万粉丝" / "100w" 等额外修饰，这里把粉丝相关后缀
    "粉丝" 去掉后再走通用解析。
    """
    if text is None:
        return -1
    cleaned = text.replace("粉丝", "").strip()
    return parse_stat(cleaned)


__all__ = ["parse_follower_stat", "parse_stat"]
