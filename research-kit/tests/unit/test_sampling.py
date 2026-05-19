"""分层抽样与 default_k。"""

from __future__ import annotations

import random

import pytest

from research_kit.collectors.douyin_browser.sampling import default_k, stratified_sample


def test_empty_input_returns_empty() -> None:
    assert stratified_sample([], 5) == []


def test_smaller_than_k_returns_copy() -> None:
    items = [1, 2, 3]
    result = stratified_sample(items, 5)
    assert result == items
    assert result is not items  # 必须是副本


def test_k_equals_one_picks_one() -> None:
    items = list(range(100))
    rng = random.Random(42)
    result = stratified_sample(items, 1, rng=rng)
    assert len(result) == 1
    assert result[0] in items


def test_invalid_k_raises() -> None:
    with pytest.raises(ValueError):
        stratified_sample([1, 2, 3], 0)
    with pytest.raises(ValueError):
        stratified_sample([1, 2, 3], -1)


def test_seeded_is_deterministic() -> None:
    items = list(range(100))
    rng1 = random.Random(42)
    rng2 = random.Random(42)
    a = stratified_sample(items, 10, rng=rng1)
    b = stratified_sample(items, 10, rng=rng2)
    assert a == b


def test_stratified_covers_full_range() -> None:
    items = list(range(100))
    rng = random.Random(42)
    result = stratified_sample(items, 10, rng=rng)
    # 10 个桶，每桶 10 个元素，第 i 个结果必须在 [i*10, (i+1)*10) 区间
    for i, v in enumerate(result):
        assert i * 10 <= v < (i + 1) * 10, f"bucket {i} -> {v}"


def test_default_k_calc() -> None:
    # 总作品 < 10：取实际数（10 的 min）
    assert default_k(5) == 5
    assert default_k(0) == 0
    # 总作品 10-50：取 max(10, ceil(0.2*n))
    assert default_k(10) == 10
    assert default_k(20) == 10  # ceil(0.2*20)=4, max(10, 4)=10
    assert default_k(50) == 10  # ceil(0.2*50)=10
    # 总作品 50-100：取 min(20, ceil(0.2*n))
    assert default_k(100) == 20  # ceil(0.2*100)=20
    # 总作品 > 100：clamp 到 20
    assert default_k(1000) == 20
