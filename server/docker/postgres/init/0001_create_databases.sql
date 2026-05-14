-- The default POSTGRES_DB (mz_ai_backend_dev) is created by the entrypoint
-- using POSTGRES_USER as its owner. We only need to create the additional
-- test database here and grant the same privileges on its public schema.

CREATE DATABASE mz_ai_backend_test
    WITH OWNER = mzai
    ENCODING = 'UTF8'
    TEMPLATE = template0;

\c mz_ai_backend_dev
GRANT ALL ON SCHEMA public TO mzai;

\c mz_ai_backend_test
GRANT ALL ON SCHEMA public TO mzai;
