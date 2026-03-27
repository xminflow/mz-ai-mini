ALTER TABLE `business_cases`
    ADD COLUMN `tags` JSON NULL AFTER `summary`;

UPDATE `business_cases`
SET `tags` = JSON_ARRAY()
WHERE `tags` IS NULL;

ALTER TABLE `business_cases`
    MODIFY COLUMN `tags` JSON NOT NULL;
