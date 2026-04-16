-- Create tables for case research requests and payment orders

CREATE TABLE IF NOT EXISTS case_research_requests (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    openid VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    visibility VARCHAR(16) NOT NULL DEFAULT 'public',
    status VARCHAR(32) NOT NULL DEFAULT 'pending_review',
    linked_case_id VARCHAR(128) NULL,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_crr_openid_visibility (openid, visibility, is_deleted),
    INDEX idx_crr_status (status)
);

CREATE TABLE IF NOT EXISTS case_research_orders (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    order_no VARCHAR(64) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    openid VARCHAR(64) NOT NULL,
    amount_fen INT UNSIGNED NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'pending',
    prepay_id VARCHAR(128) NULL,
    transaction_id VARCHAR(64) NULL UNIQUE,
    trade_state VARCHAR(32) NULL,
    paid_at DATETIME(6) NULL,
    request_applied TINYINT(1) NOT NULL DEFAULT 0,
    request_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    notify_payload LONGTEXT NULL,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_cro_openid (openid),
    INDEX idx_cro_status (status)
);
