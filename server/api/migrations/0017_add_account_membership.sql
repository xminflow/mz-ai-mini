ALTER TABLE agent_accounts
    ADD COLUMN IF NOT EXISTS membership_tier VARCHAR(16) NOT NULL DEFAULT 'none',
    ADD COLUMN IF NOT EXISTS membership_started_at TIMESTAMP WITHOUT TIME ZONE NULL,
    ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMP WITHOUT TIME ZONE NULL;

CREATE INDEX IF NOT EXISTS idx_agent_accounts_membership_expires_at
    ON agent_accounts (membership_expires_at);

CREATE TABLE IF NOT EXISTS account_membership_orders (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    order_no VARCHAR(32) NOT NULL UNIQUE,
    account_id BIGINT NOT NULL,
    sku VARCHAR(32) NOT NULL,
    amount_fen INTEGER NOT NULL CHECK (amount_fen > 0),
    status VARCHAR(16) NOT NULL DEFAULT 'pending',
    code_url TEXT NULL,
    transaction_id VARCHAR(64) NULL,
    trade_state VARCHAR(32) NULL,
    paid_at TIMESTAMP WITHOUT TIME ZONE NULL,
    membership_applied BOOLEAN NOT NULL DEFAULT FALSE,
    membership_started_at TIMESTAMP WITHOUT TIME ZONE NULL,
    membership_expires_at TIMESTAMP WITHOUT TIME ZONE NULL,
    last_wechat_query_at TIMESTAMP WITHOUT TIME ZONE NULL,
    notify_payload TEXT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_account_membership_orders_transaction_id
    ON account_membership_orders (transaction_id)
    WHERE transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_account_membership_orders_account_id
    ON account_membership_orders (account_id);
CREATE INDEX IF NOT EXISTS idx_account_membership_orders_status
    ON account_membership_orders (status);
CREATE INDEX IF NOT EXISTS idx_account_membership_orders_created_at
    ON account_membership_orders (created_at);
