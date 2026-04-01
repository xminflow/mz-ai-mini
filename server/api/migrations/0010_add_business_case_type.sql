ALTER TABLE `business_cases`
ADD COLUMN `type` VARCHAR(16) NOT NULL DEFAULT 'case' AFTER `case_id`;

UPDATE `business_cases`
SET `type` = 'case'
WHERE TRIM(`type`) = '';

DROP INDEX `idx_business_cases_public_listing`
ON `business_cases`;

CREATE INDEX `idx_business_cases_public_listing`
ON `business_cases` (`status`, `type`, `industry`, `published_at`);
