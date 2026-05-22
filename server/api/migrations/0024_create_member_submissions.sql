CREATE TABLE IF NOT EXISTS member_submissions (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL UNIQUE,
    account_id BIGINT NOT NULL,
    type VARCHAR(16) NOT NULL,
    payload_text TEXT NOT NULL,
    payload_meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(16) NOT NULL DEFAULT 'pending',
    period_key VARCHAR(8) NOT NULL,
    processed_note TEXT NULL,
    processed_at TIMESTAMP WITHOUT TIME ZONE NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_member_submissions_type
        CHECK (type IN ('blogger', 'track')),
    CONSTRAINT ck_member_submissions_status
        CHECK (status IN ('pending', 'processing', 'done', 'rejected', 'cancelled')),
    CONSTRAINT ck_member_submissions_period_key
        CHECK (period_key ~ '^[0-9]{6}$')
);

CREATE INDEX IF NOT EXISTS idx_member_submissions_account_type_period_status
    ON member_submissions (account_id, type, period_key, status);

CREATE INDEX IF NOT EXISTS idx_member_submissions_status_created
    ON member_submissions (status, created_at);

CREATE UNIQUE INDEX IF NOT EXISTS uk_member_submissions_active
    ON member_submissions (account_id, type)
    WHERE status IN ('pending', 'processing') AND is_deleted = FALSE;
