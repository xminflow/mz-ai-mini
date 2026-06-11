-- ai-camp 三档会员：camp_accounts 加会员列 + 新建 camp_membership_orders 表。
-- 纯新增、非破坏性；enrollment_* 列保留不动。
-- 回滚：
--   ALTER TABLE camp_accounts
--     DROP COLUMN IF EXISTS membership_tier,
--     DROP COLUMN IF EXISTS membership_started_at,
--     DROP COLUMN IF EXISTS membership_expires_at;
--   DROP TABLE IF EXISTS camp_membership_orders;
-- 注意：本仓库迁移按文件名记录于 schema_migrations，无独立 down 文件；回滚需手工执行上述语句并删除对应 schema_migrations 行。

ALTER TABLE camp_accounts
    ADD COLUMN IF NOT EXISTS membership_tier VARCHAR(16) NOT NULL DEFAULT 'none',
    ADD COLUMN IF NOT EXISTS membership_started_at TIMESTAMP WITHOUT TIME ZONE NULL,
    ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMP WITHOUT TIME ZONE NULL;

CREATE INDEX IF NOT EXISTS idx_camp_accounts_membership_expires_at
    ON camp_accounts (membership_expires_at);

CREATE TABLE IF NOT EXISTS camp_membership_orders (
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
    notify_payload TEXT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_camp_membership_orders_transaction_id
    ON camp_membership_orders (transaction_id)
    WHERE transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_camp_membership_orders_account_id
    ON camp_membership_orders (account_id);
CREATE INDEX IF NOT EXISTS idx_camp_membership_orders_status
    ON camp_membership_orders (status);
CREATE INDEX IF NOT EXISTS idx_camp_membership_orders_created_at
    ON camp_membership_orders (created_at);
