ALTER TABLE business_cases
    ADD COLUMN IF NOT EXISTS summary_markdown TEXT NULL,
    ADD COLUMN IF NOT EXISTS data_cutoff_date DATE NULL,
    ADD COLUMN IF NOT EXISTS freshness_months INTEGER NULL;
