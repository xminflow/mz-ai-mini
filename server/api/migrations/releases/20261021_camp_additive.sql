-- 仅用于现有官网数据库补齐 AI 营新增表；不得重放 0013-0028 历史迁移。
-- 使用 psql -v ON_ERROR_STOP=1 -f 本文件；相对路径由 psql 按本文件位置解析。
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
\ir ../0029_create_camp_auth_tables.sql
\ir ../0030_add_camp_membership.sql
-- 与既有 app 运行角色保持一致；只授予此次新增表及序列。
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
    camp_accounts, camp_auth_sessions, camp_auth_access_tokens,
    camp_wechat_identities, camp_wechat_login_sessions, camp_membership_orders TO app;
GRANT USAGE, SELECT ON SEQUENCE
    camp_accounts_id_seq, camp_auth_sessions_id_seq, camp_auth_access_tokens_id_seq,
    camp_wechat_identities_id_seq, camp_wechat_login_sessions_id_seq,
    camp_membership_orders_id_seq TO app;
INSERT INTO schema_migrations (filename)
VALUES ('0029_create_camp_auth_tables.sql'), ('0030_add_camp_membership.sql')
ON CONFLICT (filename) DO NOTHING;
COMMIT;
