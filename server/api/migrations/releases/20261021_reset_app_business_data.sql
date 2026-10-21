-- 用户明确授权：仅清空 app 库的业务数据，保留表结构、迁移记录和其他数据库。
-- 执行前必须停止本项目后端写入并生成可恢复的 pg_dump 自定义格式备份。
-- 使用 psql -v ON_ERROR_STOP=1 -f 本文件，禁止对其他库执行。
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
DO $$
DECLARE
    business_tables TEXT;
BEGIN
    IF current_database() <> 'app' THEN
        RAISE EXCEPTION '拒绝清空非 app 数据库';
    END IF;
    SELECT string_agg(format('%I.%I', schemaname, tablename), ', ' ORDER BY tablename)
    INTO business_tables
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> 'schema_migrations';
    IF business_tables IS NULL THEN
        RAISE EXCEPTION 'app 库没有预期业务表，拒绝继续';
    END IF;
    -- 不使用 CASCADE：若有清单外依赖，事务应失败而不是扩大删除范围。
    EXECUTE 'TRUNCATE TABLE ' || business_tables || ' RESTART IDENTITY';
END
$$;
\ir ../0029_create_camp_auth_tables.sql
\ir ../0030_add_camp_membership.sql
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
