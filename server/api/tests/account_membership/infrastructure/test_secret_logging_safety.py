from __future__ import annotations

from pathlib import Path


SOURCE_ROOT = Path(__file__).resolve().parents[3] / "src" / "mz_ai_backend" / "modules" / "account_membership"


def test_account_membership_sources_do_not_log_secret_fields() -> None:
    combined = "\n".join(path.read_text(encoding="utf-8") for path in SOURCE_ROOT.rglob("*.py"))

    forbidden_fragments = [
        "apiv3_key=%s",
        "private_key=%s",
        "WECHAT_PAY_APIV3_KEY",
        "WECHAT_PAY_PRIVATE_KEY",
        "raw_payload=%s",
        "notify_payload=%s",
    ]
    for fragment in forbidden_fragments:
        assert fragment not in combined
