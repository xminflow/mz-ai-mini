ALTER TABLE business_cases
    ADD COLUMN IF NOT EXISTS tags JSON NULL;

UPDATE business_cases
SET tags = '[]'::json
WHERE tags IS NULL;

ALTER TABLE business_cases
    ALTER COLUMN tags SET NOT NULL;
