from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest

from mz_ai_backend.modules.agent_auth.application import (
    GetCurrentAgentAccountQuery,
    GetCurrentAgentAccountUseCase,
    LogoutAgentSessionCommand,
    LogoutAgentSessionUseCase,
    RequestAgentEmailLoginChallengeCommand,
    RequestAgentEmailLoginChallengeUseCase,
    RefreshAgentSessionCommand,
    RefreshAgentSessionUseCase,
    VerifyAgentEmailLoginChallengeCommand,
    VerifyAgentEmailLoginChallengeUseCase,
)
from mz_ai_backend.modules.agent_auth.application.dtos import (
    build_access_token_expiry,
    build_refresh_token_expiry,
)
from mz_ai_backend.modules.agent_auth.domain import (
    AgentAccessTokenExpiredException,
    AgentAccount,
    AgentAccountStatus,
    AgentAuthSession,
    AgentEmailLoginChallenge,
    AgentEmailLoginChallengeExpiredException,
    AgentEmailLoginCodeInvalidException,
    AgentEmailSendCooldownException,
    AgentRefreshTokenExpiredException,
    AgentSessionRevokedException,
    AgentWechatIdentity,
    AgentWechatSubscribeStatus,
)


class StubSnowflakeGenerator:
    def __init__(self) -> None:
        self._value = 1000

    def generate(self) -> int:
        self._value += 1
        return self._value


class StubTokenService:
    def __init__(self, start: int = 0) -> None:
        self._seq = start

    def generate_token(self) -> str:
        self._seq += 1
        return f"token-{self._seq}"

    def hash_token(self, token: str) -> str:
        return f"hashed:{token}"


class StubEmailDeliveryGateway:
    def __init__(self) -> None:
        self.deliveries: list[tuple[str, str]] = []

    async def send_login_code(self, *, email: str, verification_code: str) -> None:
        self.deliveries.append((email, verification_code))


class InMemoryAgentAccountRepository:
    def __init__(self) -> None:
        self.accounts_by_id: dict[int, AgentAccount] = {}
        self.accounts_by_email: dict[str, AgentAccount] = {}
        self.sessions_by_refresh_hash: dict[str, AgentAuthSession] = {}
        self.sessions_by_id: dict[int, AgentAuthSession] = {}
        self.access_tokens: dict[str, object] = {}
        self.identities_by_account_id: dict[int, AgentWechatIdentity] = {}
        self.email_challenges_by_id: dict[int, AgentEmailLoginChallenge] = {}

    async def get_account_by_id(self, account_id: int) -> AgentAccount | None:
        return self.accounts_by_id.get(account_id)

    async def get_account_by_email(self, email: str) -> AgentAccount | None:
        return self.accounts_by_email.get(email)

    async def get_wechat_identity_by_account_id(self, account_id: int) -> AgentWechatIdentity | None:
        return self.identities_by_account_id.get(account_id)

    async def create_account(self, registration) -> AgentAccount:
        now = datetime.now(UTC).replace(tzinfo=None)
        account = AgentAccount(
            account_id=registration.account_id,
            username=registration.username,
            email=registration.email,
            password_hash=registration.password_hash,
            password_salt=registration.password_salt,
            password_scheme_version=registration.password_scheme_version,
            status=registration.status,
            is_deleted=False,
            created_at=now,
            updated_at=now,
        )
        self.accounts_by_id[account.account_id] = account
        if account.email is not None:
            self.accounts_by_email[account.email] = account
        self.identities_by_account_id[account.account_id] = AgentWechatIdentity(
            identity_id=account.account_id + 10000,
            account_id=account.account_id,
            official_openid=f"openid-{account.account_id}",
            subscribe_status=AgentWechatSubscribeStatus.SUBSCRIBED,
            subscribed_at=now,
            unsubscribed_at=None,
            last_event_at=now,
            is_deleted=False,
            created_at=now,
            updated_at=now,
        )
        return account

    async def create_session(self, issue) -> None:
        now = datetime.now(UTC).replace(tzinfo=None)
        session = AgentAuthSession(
            session_id=issue.session_id,
            account_id=issue.account_id,
            refresh_token_hash=issue.refresh_token_hash,
            expires_at=issue.refresh_token_expires_at,
            revoked_at=None,
            created_at=now,
            updated_at=now,
        )
        self.sessions_by_refresh_hash[issue.refresh_token_hash] = session
        self.sessions_by_id[issue.session_id] = session
        self.access_tokens[issue.access_token_hash] = type(
            "AccessRecord",
            (),
            {
                "token_id": issue.access_token_id,
                "session_id": issue.session_id,
                "access_token_hash": issue.access_token_hash,
                "expires_at": issue.access_token_expires_at,
                "created_at": now,
            },
        )()

    async def get_session_by_refresh_token_hash(self, refresh_token_hash: str):
        return self.sessions_by_refresh_hash.get(refresh_token_hash)

    async def get_session_by_id(self, session_id: int):
        return self.sessions_by_id.get(session_id)

    async def get_access_token_record(self, access_token_hash: str):
        return self.access_tokens.get(access_token_hash)

    async def revoke_session(self, session_id: int) -> bool:
        session = self.sessions_by_id.get(session_id)
        if session is None or session.revoked_at is not None:
            return False
        revoked = session.model_copy(update={"revoked_at": datetime.now(UTC).replace(tzinfo=None)})
        self.sessions_by_id[session_id] = revoked
        self.sessions_by_refresh_hash[revoked.refresh_token_hash] = revoked
        return True

    async def revoke_session_by_refresh_token_hash(self, refresh_token_hash: str) -> bool:
        session = self.sessions_by_refresh_hash.get(refresh_token_hash)
        if session is None or session.revoked_at is not None:
            return False
        revoked = session.model_copy(update={"revoked_at": datetime.now(UTC).replace(tzinfo=None)})
        self.sessions_by_refresh_hash[refresh_token_hash] = revoked
        self.sessions_by_id[revoked.session_id] = revoked
        return True

    async def replace_session_tokens(
        self,
        *,
        session_id: int,
        refresh_token_hash: str,
        refresh_token_expires_at,
        access_token_id: int,
        access_token_hash: str,
        access_token_expires_at,
    ) -> None:
        current = self.sessions_by_id[session_id]
        updated = current.model_copy(
            update={
                "refresh_token_hash": refresh_token_hash,
                "expires_at": refresh_token_expires_at,
                "updated_at": datetime.now(UTC).replace(tzinfo=None),
            }
        )
        self.sessions_by_id[session_id] = updated
        self.sessions_by_refresh_hash = {refresh_token_hash: updated}
        self.access_tokens = {
            access_token_hash: type(
                "AccessRecord",
                (),
                {
                    "token_id": access_token_id,
                    "session_id": session_id,
                    "access_token_hash": access_token_hash,
                    "expires_at": access_token_expires_at,
                    "created_at": datetime.now(UTC).replace(tzinfo=None),
                },
            )()
        }

    async def get_latest_email_login_challenge_by_email(self, email: str):
        candidates = [item for item in self.email_challenges_by_id.values() if item.email == email]
        if not candidates:
            return None
        return sorted(candidates, key=lambda item: item.created_at, reverse=True)[0]

    async def invalidate_active_email_login_challenges_by_email(self, *, email: str) -> None:
        now = datetime.now(UTC).replace(tzinfo=None)
        for challenge_id, challenge in list(self.email_challenges_by_id.items()):
            if (
                challenge.email == email
                and challenge.verified_at is None
                and challenge.invalidated_at is None
                and challenge.expires_at > now
            ):
                self.email_challenges_by_id[challenge_id] = challenge.model_copy(
                    update={"invalidated_at": now}
                )

    async def create_email_login_challenge(self, create):
        challenge = AgentEmailLoginChallenge(
            login_challenge_id=create.login_challenge_id,
            email=create.email,
            code_hash=create.code_hash,
            expires_at=create.expires_at,
            verified_at=None,
            invalidated_at=None,
            created_at=datetime.now(UTC).replace(tzinfo=None),
        )
        self.email_challenges_by_id[challenge.login_challenge_id] = challenge
        return challenge

    async def get_email_login_challenge_by_id(self, login_challenge_id: int):
        return self.email_challenges_by_id.get(login_challenge_id)

    async def mark_email_login_challenge_verified(self, *, login_challenge_id: int, verified_at: datetime):
        challenge = self.email_challenges_by_id.get(login_challenge_id)
        if challenge is None:
            return None
        updated = challenge.model_copy(update={"verified_at": verified_at})
        self.email_challenges_by_id[login_challenge_id] = updated
        return updated


@pytest.mark.asyncio
async def test_refresh_agent_session_rotates_tokens() -> None:
    repository = InMemoryAgentAccountRepository()
    account = await repository.create_account(
        type(
            "Registration",
            (),
            {
                "account_id": 1,
                "username": "agent_1",
                "email": "demo@example.com",
                "password_hash": None,
                "password_salt": None,
                "password_scheme_version": None,
                "status": AgentAccountStatus.ACTIVE,
            },
        )()
    )
    await repository.create_session(
        type(
            "Issue",
            (),
            {
                "session_id": 2,
                "account_id": account.account_id,
                "refresh_token_hash": "hashed:token-2",
                "refresh_token_expires_at": datetime.now(UTC).replace(tzinfo=None) + timedelta(days=1),
                "access_token_id": 3,
                "access_token_hash": "hashed:token-1",
                "access_token_expires_at": datetime.now(UTC).replace(tzinfo=None) + timedelta(minutes=30),
            },
        )()
    )
    use_case = RefreshAgentSessionUseCase(
        account_repository=repository,
        token_service=StubTokenService(start=2),
        snowflake_id_generator=StubSnowflakeGenerator(),
        access_token_ttl_seconds=1800,
        refresh_token_ttl_days=30,
    )

    result = await use_case.execute(RefreshAgentSessionCommand(refresh_token="token-2"))

    assert result.tokens.access_token != "token-1"
    assert result.tokens.refresh_token != "token-2"
    assert result.account.email == "demo@example.com"


@pytest.mark.asyncio
async def test_refresh_agent_session_rejects_expired_refresh_token() -> None:
    repository = InMemoryAgentAccountRepository()
    now = datetime.now(UTC).replace(tzinfo=None)
    account = await repository.create_account(
        type(
            "Registration",
            (),
            {
                "account_id": 1,
                "username": "agent_1",
                "email": "demo@example.com",
                "password_hash": None,
                "password_salt": None,
                "password_scheme_version": None,
                "status": AgentAccountStatus.ACTIVE,
            },
        )()
    )
    await repository.create_session(
        type(
            "Issue",
            (),
            {
                "session_id": 2,
                "account_id": account.account_id,
                "refresh_token_hash": "hashed:expired-token",
                "refresh_token_expires_at": now - timedelta(minutes=1),
                "access_token_id": 3,
                "access_token_hash": "hashed:access",
                "access_token_expires_at": now + timedelta(minutes=30),
            },
        )()
    )
    use_case = RefreshAgentSessionUseCase(
        account_repository=repository,
        token_service=StubTokenService(),
        snowflake_id_generator=StubSnowflakeGenerator(),
        access_token_ttl_seconds=1800,
        refresh_token_ttl_days=30,
    )

    with pytest.raises(AgentRefreshTokenExpiredException):
        await use_case.execute(RefreshAgentSessionCommand(refresh_token="expired-token"))


@pytest.mark.asyncio
async def test_request_email_login_challenge_delivers_code() -> None:
    repository = InMemoryAgentAccountRepository()
    delivery_gateway = StubEmailDeliveryGateway()
    use_case = RequestAgentEmailLoginChallengeUseCase(
        account_repository=repository,
        token_service=StubTokenService(),
        email_delivery_gateway=delivery_gateway,
        snowflake_id_generator=StubSnowflakeGenerator(),
        code_ttl_seconds=600,
        send_cooldown_seconds=60,
    )

    result = await use_case.execute(
        RequestAgentEmailLoginChallengeCommand(email="demo@example.com")
    )

    assert result.challenge.cooldown_seconds == 60
    assert len(delivery_gateway.deliveries) == 1
    assert delivery_gateway.deliveries[0][0] == "demo@example.com"
    assert len(delivery_gateway.deliveries[0][1]) == 6


@pytest.mark.asyncio
async def test_request_email_login_challenge_rejects_cooldown() -> None:
    repository = InMemoryAgentAccountRepository()
    delivery_gateway = StubEmailDeliveryGateway()
    use_case = RequestAgentEmailLoginChallengeUseCase(
        account_repository=repository,
        token_service=StubTokenService(),
        email_delivery_gateway=delivery_gateway,
        snowflake_id_generator=StubSnowflakeGenerator(),
        code_ttl_seconds=600,
        send_cooldown_seconds=60,
    )
    await use_case.execute(RequestAgentEmailLoginChallengeCommand(email="demo@example.com"))

    with pytest.raises(AgentEmailSendCooldownException):
        await use_case.execute(RequestAgentEmailLoginChallengeCommand(email="demo@example.com"))


@pytest.mark.asyncio
async def test_logout_agent_session_revokes_session() -> None:
    repository = InMemoryAgentAccountRepository()
    await repository.create_session(
        type(
            "Issue",
            (),
            {
                "session_id": 2,
                "account_id": 1,
                "refresh_token_hash": "hashed:token-1",
                "refresh_token_expires_at": datetime.now(UTC).replace(tzinfo=None) + timedelta(days=1),
                "access_token_id": 3,
                "access_token_hash": "hashed:access",
                "access_token_expires_at": datetime.now(UTC).replace(tzinfo=None) + timedelta(minutes=30),
            },
        )()
    )
    use_case = LogoutAgentSessionUseCase(
        account_repository=repository,
        token_service=StubTokenService(),
    )

    result = await use_case.execute(LogoutAgentSessionCommand(refresh_token="token-1"))

    assert result.revoked is True


@pytest.mark.asyncio
async def test_get_current_agent_account_rejects_expired_access_token() -> None:
    repository = InMemoryAgentAccountRepository()
    use_case = GetCurrentAgentAccountUseCase(
        account_repository=repository,
        token_service=StubTokenService(),
    )

    with pytest.raises(AgentAccessTokenExpiredException):
        await use_case.execute(GetCurrentAgentAccountQuery(access_token="missing-token"))


@pytest.mark.asyncio
async def test_get_current_agent_account_rejects_revoked_session() -> None:
    repository = InMemoryAgentAccountRepository()
    account = await repository.create_account(
        type(
            "Registration",
            (),
            {
                "account_id": 1,
                "username": "agent_1",
                "email": "demo@example.com",
                "password_hash": None,
                "password_salt": None,
                "password_scheme_version": None,
                "status": AgentAccountStatus.ACTIVE,
            },
        )()
    )
    await repository.create_session(
        type(
            "Issue",
            (),
            {
                "session_id": 2,
                "account_id": account.account_id,
                "refresh_token_hash": "hashed:refresh",
                "refresh_token_expires_at": datetime.now(UTC).replace(tzinfo=None) + timedelta(days=1),
                "access_token_id": 3,
                "access_token_hash": "hashed:access",
                "access_token_expires_at": datetime.now(UTC).replace(tzinfo=None) + timedelta(minutes=30),
            },
        )()
    )
    await repository.revoke_session(2)
    use_case = GetCurrentAgentAccountUseCase(
        account_repository=repository,
        token_service=StubTokenService(),
    )

    with pytest.raises(AgentAccessTokenExpiredException):
        await use_case.execute(GetCurrentAgentAccountQuery(access_token="access"))


@pytest.mark.asyncio
async def test_verify_email_login_challenge_creates_account_and_issues_tokens() -> None:
    repository = InMemoryAgentAccountRepository()
    challenge = await repository.create_email_login_challenge(
        type(
            "ChallengeCreate",
            (),
            {
                "login_challenge_id": 1001,
                "email": "demo@example.com",
                "code_hash": "hashed:123456",
                "expires_at": datetime.now(UTC).replace(tzinfo=None) + timedelta(minutes=10),
            },
        )()
    )
    use_case = VerifyAgentEmailLoginChallengeUseCase(
        account_repository=repository,
        token_service=StubTokenService(),
        snowflake_id_generator=StubSnowflakeGenerator(),
        access_token_ttl_seconds=1800,
        refresh_token_ttl_days=30,
    )

    result = await use_case.execute(
        VerifyAgentEmailLoginChallengeCommand(
            login_challenge_id=challenge.login_challenge_id,
            verification_code="123456",
        )
    )

    assert result.account.email == "demo@example.com"
    assert result.account.username.startswith("agent_")
    assert result.tokens.access_token.startswith("token-")


@pytest.mark.asyncio
async def test_verify_email_login_challenge_rejects_invalid_code() -> None:
    repository = InMemoryAgentAccountRepository()
    await repository.create_email_login_challenge(
        type(
            "ChallengeCreate",
            (),
            {
                "login_challenge_id": 1001,
                "email": "demo@example.com",
                "code_hash": "hashed:123456",
                "expires_at": datetime.now(UTC).replace(tzinfo=None) + timedelta(minutes=10),
            },
        )()
    )
    use_case = VerifyAgentEmailLoginChallengeUseCase(
        account_repository=repository,
        token_service=StubTokenService(),
        snowflake_id_generator=StubSnowflakeGenerator(),
        access_token_ttl_seconds=1800,
        refresh_token_ttl_days=30,
    )

    with pytest.raises(AgentEmailLoginCodeInvalidException):
        await use_case.execute(
            VerifyAgentEmailLoginChallengeCommand(
                login_challenge_id=1001,
                verification_code="000000",
            )
        )


@pytest.mark.asyncio
async def test_verify_email_login_challenge_rejects_expired_challenge() -> None:
    repository = InMemoryAgentAccountRepository()
    await repository.create_email_login_challenge(
        type(
            "ChallengeCreate",
            (),
            {
                "login_challenge_id": 1001,
                "email": "demo@example.com",
                "code_hash": "hashed:123456",
                "expires_at": datetime.now(UTC).replace(tzinfo=None) - timedelta(minutes=1),
            },
        )()
    )
    use_case = VerifyAgentEmailLoginChallengeUseCase(
        account_repository=repository,
        token_service=StubTokenService(),
        snowflake_id_generator=StubSnowflakeGenerator(),
        access_token_ttl_seconds=1800,
        refresh_token_ttl_days=30,
    )

    with pytest.raises(AgentEmailLoginChallengeExpiredException):
        await use_case.execute(
            VerifyAgentEmailLoginChallengeCommand(
                login_challenge_id=1001,
                verification_code="123456",
            )
        )


def test_agent_token_expiry_builders_return_utc_aware_datetimes() -> None:
    access_expiry = build_access_token_expiry(ttl_seconds=1800)
    refresh_expiry = build_refresh_token_expiry(ttl_days=30)

    assert access_expiry.tzinfo is UTC
    assert refresh_expiry.tzinfo is UTC
