ALTER TABLE business_cases
    ALTER COLUMN case_id TYPE VARCHAR(128) USING case_id::VARCHAR(128);

ALTER TABLE business_case_documents
    ALTER COLUMN case_id TYPE VARCHAR(128) USING case_id::VARCHAR(128);
