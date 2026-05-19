"""抖音 stat 文本解析。"""

from __future__ import annotations

from research_kit.collectors.douyin_browser.stats import parse_follower_stat, parse_stat


def test_plain_number() -> None:
    assert parse_stat("123") == 123
    assert parse_stat("0") == 0
    assert parse_stat("1,234") == 1234


def test_chinese_units() -> None:
    assert parse_stat("1.2万") == 12_000
    assert parse_stat("12万") == 120_000
    assert parse_stat("3.4亿") == 340_000_000
    assert parse_stat("1.5千") == 1_500


def test_english_units() -> None:
    assert parse_stat("1.5w") == 15_000
    assert parse_stat("1.5W") == 15_000
    assert parse_stat("3k") == 3_000


def test_unparseable_returns_neg_one() -> None:
    assert parse_stat("abc") == -1
    assert parse_stat("") == -1
    assert parse_stat(None) == -1
    assert parse_stat("--") == -1


def test_follower_stat_strips_粉丝_suffix() -> None:
    assert parse_follower_stat("1.2万粉丝") == 12_000
    assert parse_follower_stat("粉丝1.2万") == 12_000


def test_whitespace_tolerance() -> None:
    assert parse_stat(" 1.2 万 ") == 12_000
    assert parse_stat("1.2  万") == 12_000
