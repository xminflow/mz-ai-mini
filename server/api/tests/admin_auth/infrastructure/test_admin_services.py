from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest

from mz_ai_backend.core.exceptions import UnauthorizedException
from mz_ai_backend.modules.admin_auth.infrastructure import (
    ConfigAdminCredentialVerifier,
    HmacAdminTokenService,
)


def _now() -> datetime:
    return datetime(2026, 7, 7, 12, 0, 0, tzinfo=UTC)


def test_issue_then_verify_round_trip() -> None:
    service = HmacAdminTokenService(secret="s3cret-value")
    issued = service.issue(username="root", now=_now(), ttl_minutes=60)
    identity = service.verify(token=issued.token, now=_now() + timedelta(minutes=59))
    assert identity.username == "root"
    assert issued.expires_at == _now() + timedelta(minutes=60)


def test_verify_rejects_expired_token() -> None:
    service = HmacAdminTokenService(secret="s3cret-value")
    issued = service.issue(username="root", now=_now(), ttl_minutes=10)
    with pytest.raises(UnauthorizedException):
        service.verify(token=issued.token, now=_now() + timedelta(minutes=11))


def test_verify_rejects_tampered_signature() -> None:
    service = HmacAdminTokenService(secret="s3cret-value")
    issued = service.issue(username="root", now=_now(), ttl_minutes=10)
    tampered = issued.token[:-1] + ("0" if issued.token[-1] != "0" else "1")
    with pytest.raises(UnauthorizedException):
        service.verify(token=tampered, now=_now())


def test_verify_rejects_wrong_secret() -> None:
    issued = HmacAdminTokenService(secret="secret-a").issue(
        username="root", now=_now(), ttl_minutes=10
    )
    with pytest.raises(UnauthorizedException):
        HmacAdminTokenService(secret="secret-b").verify(token=issued.token, now=_now())


def test_verify_rejects_malformed_token() -> None:
    service = HmacAdminTokenService(secret="s3cret-value")
    with pytest.raises(UnauthorizedException):
        service.verify(token="not-a-valid-token", now=_now())


def test_verify_rejects_non_ascii_token() -> None:
    service = HmacAdminTokenService(secret="s3cret-value")
    with pytest.raises(UnauthorizedException):
        service.verify(token="é.deadbeef", now=_now())


def test_verify_rejects_non_ascii_signature_segment() -> None:
    service = HmacAdminTokenService(secret="s3cret-value")
    # 合法的 base64url payload 段 + 非 ASCII 签名段：不得抛 TypeError，须统一 401
    with pytest.raises(UnauthorizedException):
        service.verify(token="eyJzdWIiOiJyb290In0=.é", now=_now())


def test_credential_verifier_matches_exact_pair() -> None:
    verifier = ConfigAdminCredentialVerifier(username="root", password="pw")
    assert verifier.verify(username="root", password="pw") is True
    assert verifier.verify(username="root", password="wrong") is False
    assert verifier.verify(username="nope", password="pw") is False
