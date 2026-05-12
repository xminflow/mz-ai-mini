ALTER TABLE business_cases
    ADD COLUMN IF NOT EXISTS type VARCHAR(16) NOT NULL DEFAULT 'case';

UPDATE business_cases
SET type = 'case'
WHERE TRIM(type) = '';

DROP INDEX IF EXISTS idx_business_cases_public_listing;

CREATE INDEX IF NOT EXISTS idx_business_cases_public_listing
    ON business_cases (status, type, industry, published_at);
