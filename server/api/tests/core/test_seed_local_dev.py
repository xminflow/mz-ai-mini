from __future__ import annotations

from scripts.seed_local_dev import (
    LOCAL_DEV_CASE_SEEDS,
    _filter_missing_case_seeds,
    _generate_snowflake_id,
)


class StubSnowflakeGenerator:
    def __init__(self) -> None:
        self.calls = 0

    def generate(self) -> int:
        self.calls += 1
        return 123456


def test_generate_snowflake_id_uses_generate_method() -> None:
    generator = StubSnowflakeGenerator()

    result = _generate_snowflake_id(generator)

    assert result == 123456
    assert generator.calls == 1


def test_local_dev_case_seeds_prepare_multiple_cases_with_full_document_sets() -> None:
    assert len(LOCAL_DEV_CASE_SEEDS) >= 8
    assert all(len(case_seed.documents) == 3 for case_seed in LOCAL_DEV_CASE_SEEDS)


def test_filter_missing_case_seeds_excludes_existing_titles() -> None:
    existing_titles = {
        LOCAL_DEV_CASE_SEEDS[0].title,
        LOCAL_DEV_CASE_SEEDS[2].title,
    }

    missing_case_seeds = _filter_missing_case_seeds(
        LOCAL_DEV_CASE_SEEDS,
        existing_titles,
    )

    assert len(missing_case_seeds) == len(LOCAL_DEV_CASE_SEEDS) - 2
    assert all(case_seed.title not in existing_titles for case_seed in missing_case_seeds)
