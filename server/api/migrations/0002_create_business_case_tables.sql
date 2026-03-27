CREATE TABLE IF NOT EXISTS `business_cases` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `case_id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `summary` TEXT NOT NULL,
    `cover_image_url` VARCHAR(2048) NOT NULL,
    `status` VARCHAR(16) NOT NULL,
    `published_at` DATETIME(6) NULL,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_business_cases_case_id` (`case_id`),
    KEY `idx_business_cases_status_created_at` (`status`, `created_at`),
    KEY `idx_business_cases_published_at` (`published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `business_case_documents` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `document_id` BIGINT UNSIGNED NOT NULL,
    `case_id` BIGINT UNSIGNED NOT NULL,
    `document_type` VARCHAR(32) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `markdown_content` LONGTEXT NOT NULL,
    `cover_image_url` VARCHAR(2048) NOT NULL,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_business_case_documents_document_id` (`document_id`),
    UNIQUE KEY `uk_business_case_documents_case_document_type` (`case_id`, `document_type`),
    KEY `idx_business_case_documents_case_id` (`case_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
