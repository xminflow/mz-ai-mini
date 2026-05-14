CREATE TABLE IF NOT EXISTS agent_wechat_identities (
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

CREATE INDEX IF NOT EXISTS idx_agent_wechat_identities_identity_id
    ON agent_wechat_identities (identity_id);
CREATE INDEX IF NOT EXISTS idx_agent_wechat_identities_account_id
    ON agent_wechat_identities (account_id);
CREATE INDEX IF NOT EXISTS idx_agent_wechat_identities_official_openid
    ON agent_wechat_identities (official_openid);

CREATE TABLE IF NOT EXISTS agent_wechat_login_sessions (
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

CREATE INDEX IF NOT EXISTS idx_agent_wechat_login_sessions_login_session_id
    ON agent_wechat_login_sessions (login_session_id);
CREATE INDEX IF NOT EXISTS idx_agent_wechat_login_sessions_scene_key
    ON agent_wechat_login_sessions (scene_key);
CREATE INDEX IF NOT EXISTS idx_agent_wechat_login_sessions_status
    ON agent_wechat_login_sessions (status);
