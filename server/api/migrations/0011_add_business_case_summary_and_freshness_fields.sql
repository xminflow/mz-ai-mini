ALTER TABLE `business_cases`
ADD COLUMN `summary_markdown` LONGTEXT NULL AFTER `summary`,
ADD COLUMN `data_cutoff_date` DATE NULL AFTER `industry`,
ADD COLUMN `freshness_months` INT UNSIGNED NULL AFTER `data_cutoff_date`;
