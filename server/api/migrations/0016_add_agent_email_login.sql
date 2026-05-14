ALTER TABLE agent_accounts
    ADD COLUMN IF NOT EXISTS email VARCHAR(256) NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_accounts_email
    ON agent_accounts (email);

CREATE TABLE IF NOT EXISTS agent_email_login_challenges (
    id BIGSERIAL PRIMARY KEY,
    login_challenge_id BIGINT NOT NULL UNIQUE,
    email VARCHAR(256) NOT NULL,
    code_hash VARCHAR(128) NOT NULL,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITHOUT TIME ZONE NULL,
    invalidated_at TIMESTAMP WITHOUT TIME ZONE NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_email_login_challenges_email_created_at
    ON agent_email_login_challenges (email, created_at DESC);
