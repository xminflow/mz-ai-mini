ALTER TABLE `users`
    ADD COLUMN `membership_tier` VARCHAR(16) NOT NULL DEFAULT 'none' AFTER `status`,
    ADD COLUMN `membership_started_at` DATETIME(6) NULL AFTER `membership_tier`,
    ADD COLUMN `membership_expires_at` DATETIME(6) NULL AFTER `membership_started_at`,
    ADD KEY `idx_users_membership_tier` (`membership_tier`),
    ADD KEY `idx_users_membership_expires_at` (`membership_expires_at`);
CREATE TABLE IF NOT EXISTS `membership_orders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `order_no` VARCHAR(64) NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `openid` VARCHAR(64) NOT NULL,
    `tier` VARCHAR(16) NOT NULL,
    `amount_fen` INT UNSIGNED NOT NULL,
    `status` VARCHAR(16) NOT NULL,
    `prepay_id` VARCHAR(128) NULL,
    `transaction_id` VARCHAR(64) NULL,
    `trade_state` VARCHAR(32) NULL,
    `paid_at` DATETIME(6) NULL,
    `membership_applied` TINYINT(1) NOT NULL DEFAULT 0,
    `membership_started_at` DATETIME(6) NULL,
    `membership_expires_at` DATETIME(6) NULL,
    `notify_payload` LONGTEXT NULL,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_membership_orders_order_id` (`order_id`),
    UNIQUE KEY `uk_membership_orders_order_no` (`order_no`),
    UNIQUE KEY `uk_membership_orders_transaction_id` (`transaction_id`),
    KEY `idx_membership_orders_openid` (`openid`),
    KEY `idx_membership_orders_user_id` (`user_id`),
    KEY `idx_membership_orders_status` (`status`),
    KEY `idx_membership_orders_tier` (`tier`),
    KEY `idx_membership_orders_paid_at` (`paid_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


