-- aicamp 独立扫码登录用户表，与 agent_* 完全隔离；纯新增，回滚=DROP 这 5 张表。

CREATE TABLE IF NOT EXISTS camp_accounts (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL UNIQUE,
    username VARCHAR(32) NOT NULL UNIQUE,
    email VARCHAR(256) NULL UNIQUE,
    status VARCHAR(16) NOT NULL,
    enrollment_status VARCHAR(16) NOT NULL DEFAULT 'none',
    enrolled_at TIMESTAMP WITHOUT TIME ZONE NULL,
    enrollment_expires_at TIMESTAMP WITHOUT TIME ZONE NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_camp_accounts_account_id ON camp_accounts (account_id);
CREATE INDEX IF NOT EXISTS idx_camp_accounts_username ON camp_accounts (username);
CREATE INDEX IF NOT EXISTS idx_camp_accounts_email ON camp_accounts (email);

CREATE TABLE IF NOT EXISTS camp_auth_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL UNIQUE,
    account_id BIGINT NOT NULL,
    refresh_token_hash VARCHAR(128) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITHOUT TIME ZONE NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_camp_auth_sessions_session_id
    ON camp_auth_sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_camp_auth_sessions_account_id
    ON camp_auth_sessions (account_id);
CREATE INDEX IF NOT EXISTS idx_camp_auth_sessions_refresh_token_hash
    ON camp_auth_sessions (refresh_token_hash);

CREATE TABLE IF NOT EXISTS camp_auth_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    token_id BIGINT NOT NULL UNIQUE,
    session_id BIGINT NOT NULL,
    access_token_hash VARCHAR(128) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_camp_auth_access_tokens_token_id
    ON camp_auth_access_tokens (token_id);
CREATE INDEX IF NOT EXISTS idx_camp_auth_access_tokens_session_id
    ON camp_auth_access_tokens (session_id);
CREATE INDEX IF NOT EXISTS idx_camp_auth_access_tokens_access_token_hash
    ON camp_auth_access_tokens (access_token_hash);

CREATE TABLE IF NOT EXISTS camp_wechat_identities (
    id BIGSERIAL PRIMARY KEY,
    identity_id BIGINT NOT NULL UNIQUE,
    account_id BIGINT NOT NULL,
    official_openid VARCHAR(64) NOT NULL UNIQUE,
    subscribe_status VARCHAR(16) NOT NULL,
    subscribed_at TIMESTAMP WITHOUT TIME ZONE NULL,
    unsubscribed_at TIMESTAMP WITHOUT TIME ZONE NULL,
    last_event_at TIMESTAMP WITHOUT TIME ZONE NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_camp_wechat_identities_identity_id
    ON camp_wechat_identities (identity_id);
CREATE INDEX IF NOT EXISTS idx_camp_wechat_identities_account_id
    ON camp_wechat_identities (account_id);
CREATE INDEX IF NOT EXISTS idx_camp_wechat_identities_official_openid
    ON camp_wechat_identities (official_openid);

CREATE TABLE IF NOT EXISTS camp_wechat_login_sessions (
    id BIGSERIAL PRIMARY KEY,
    login_session_id BIGINT NOT NULL UNIQUE,
    scene_key VARCHAR(128) NOT NULL UNIQUE,
    status VARCHAR(16) NOT NULL,
    official_openid VARCHAR(64) NULL,
    account_id BIGINT NULL,
    login_grant_token_hash VARCHAR(128) NULL UNIQUE,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    authenticated_at TIMESTAMP WITHOUT TIME ZONE NULL,
    consumed_at TIMESTAMP WITHOUT TIME ZONE NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_camp_wechat_login_sessions_login_session_id
    ON camp_wechat_login_sessions (login_session_id);
CREATE INDEX IF NOT EXISTS idx_camp_wechat_login_sessions_scene_key
    ON camp_wechat_login_sessions (scene_key);
CREATE INDEX IF NOT EXISTS idx_camp_wechat_login_sessions_status
    ON camp_wechat_login_sessions (status);
