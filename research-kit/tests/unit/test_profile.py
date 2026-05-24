"""抖音主页资料字段清洗。"""

from __future__ import annotations

from research_kit.collectors.douyin_browser.profile import clean_douyin_id


def test_clean_douyin_id_removes_joined_ip_location_suffix() -> None:
    assert (
        clean_douyin_id(
            "meipleIP",
            source_text="抖音号：meipleIP属地：浙江",
        )
        == "meiple"
    )


def test_clean_douyin_id_keeps_real_ip_suffix_without_location_boundary() -> None:
    assert clean_douyin_id("creatorIP", source_text="抖音号：creatorIP") == "creatorIP"


def test_clean_douyin_id_keeps_real_ip_suffix_before_location_label() -> None:
    assert (
        clean_douyin_id(
            "creatorIPIP",
            source_text="抖音号：creatorIPIP属地：浙江",
        )
        == "creatorIP"
    )


def test_clean_douyin_id_stops_at_location_text() -> None:
    assert clean_douyin_id("1676336575IP属地：浙江") == "1676336575"
