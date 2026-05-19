"""分层随机抽样。

把作品列表分成 k 个等大小的桶，每个桶随机抽一个。结果在源序列中按位置升序，
覆盖整个范围但桶内非确定。这是 ua-agent 同款算法的 Python 重写。

- 空输入 → []
- len <= k → 原列表副本（无需抽样）
- k = 1 → 整段中随机一个
- k <= 0 → ValueError
"""

from __future__ import annotations

import math
import random as _random
from typing import Sequence, TypeVar

T = TypeVar("T")


def stratified_sample(
    items: Sequence[T],
    k: int,
    rng: _random.Random | None = None,
) -> list[T]:
    """k 个等分桶 + 桶内随机。"""
    if not isinstance(k, int) or k <= 0:
        raise ValueError(f"k 必须是正整数，收到 {k}")
    n = len(items)
    if n == 0:
        return []
    if n <= k:
        return list(items)

    rand = rng or _random.Random()
    out: list[T] = []
    for i in range(k):
        lo = (i * n) // k
        hi = ((i + 1) * n) // k
        idx = lo + rand.randrange(hi - lo)
        out.append(items[idx])
    return out


def default_k(total_works: int) -> int:
    """ua-agent 同款 k 自动计算：20% 总作品数，clamp 到 [10, 20]。

    博主作品 < 10 时取实际数，避免过度抽样。
    """
    return max(min(10, total_works), min(20, math.ceil(total_works * 0.2)))


__all__ = ["default_k", "stratified_sample"]
