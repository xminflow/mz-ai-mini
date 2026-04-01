ALTER TABLE `business_cases`
ADD COLUMN `industry` VARCHAR(32) NOT NULL DEFAULT '其他' AFTER `summary`;

UPDATE `business_cases`
SET `industry` = '其他'
WHERE TRIM(`industry`) = '';

CREATE INDEX `idx_business_cases_public_listing`
ON `business_cases` (`status`, `industry`, `published_at`);
