ALTER TABLE business_cases
    ADD COLUMN IF NOT EXISTS industry VARCHAR(32) NOT NULL DEFAULT '其他';

UPDATE business_cases
SET industry = '其他'
WHERE TRIM(industry) = '';

CREATE INDEX IF NOT EXISTS idx_business_cases_public_listing
    ON business_cases (status, industry, published_at);
