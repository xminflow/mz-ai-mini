ALTER TABLE agent_accounts
    ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE agent_accounts
    ALTER COLUMN password_salt DROP NOT NULL;

ALTER TABLE agent_accounts
    ALTER COLUMN password_scheme_version DROP NOT NULL;
