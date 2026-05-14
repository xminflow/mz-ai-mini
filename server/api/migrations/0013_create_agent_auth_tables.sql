CREATE TABLE IF NOT EXISTS agent_accounts (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL UNIQUE,
    username VARCHAR(32) NOT NULL UNIQUE,
    password_hash VARCHAR(512) NOT NULL,
    password_salt VARCHAR(128) NOT NULL,
    password_scheme_version VARCHAR(16) NOT NULL,
    status VARCHAR(16) NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_accounts_account_id ON agent_accounts (account_id);
CREATE INDEX IF NOT EXISTS idx_agent_accounts_username ON agent_accounts (username);

CREATE TABLE IF NOT EXISTS agent_auth_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL UNIQUE,
    account_id BIGINT NOT NULL,
    refresh_token_hash VARCHAR(128) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITHOUT TIME ZONE NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_auth_sessions_session_id
    ON agent_auth_sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_agent_auth_sessions_account_id
    ON agent_auth_sessions (account_id);
CREATE INDEX IF NOT EXISTS idx_agent_auth_sessions_refresh_token_hash
    ON agent_auth_sessions (refresh_token_hash);

CREATE TABLE IF NOT EXISTS agent_auth_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    token_id BIGINT NOT NULL UNIQUE,
    session_id BIGINT NOT NULL,
    access_token_hash VARCHAR(128) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_auth_access_tokens_token_id
    ON agent_auth_access_tokens (token_id);
CREATE INDEX IF NOT EXISTS idx_agent_auth_access_tokens_session_id
    ON agent_auth_access_tokens (session_id);
CREATE INDEX IF NOT EXISTS idx_agent_auth_access_tokens_access_token_hash
    ON agent_auth_access_tokens (access_token_hash);
