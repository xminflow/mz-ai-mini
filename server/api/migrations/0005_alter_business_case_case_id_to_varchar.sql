ALTER TABLE `business_cases`
    MODIFY COLUMN `case_id` VARCHAR(128) NOT NULL;

ALTER TABLE `business_case_documents`
    MODIFY COLUMN `case_id` VARCHAR(128) NOT NULL;
