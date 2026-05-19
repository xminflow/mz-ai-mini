-- 补授权：迁移 0013-0017 创建的表未包含 GRANT 语句，导致 app 用户无权访问。
-- 使用 schema 级批量授权覆盖所有现有及已创建的表和序列。
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app;
