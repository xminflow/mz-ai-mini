from __future__ import annotations

import pytest

from scripts.import_business_case_from_dir import parse_args


def test_parse_args_reads_case_directory_argument() -> None:
    args = parse_args(["--case-dir", "D:\\code\\doit\\cases\\case-04"])

    assert args.case_dir == "D:\\code\\doit\\cases\\case-04"


def test_parse_args_requires_case_directory_argument() -> None:
    with pytest.raises(SystemExit):
        parse_args([])
