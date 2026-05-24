-- 补授权：0024 创建 member_submissions 表时遗漏 GRANT，导致 app 角色访问该表
-- 抛 asyncpg.exceptions.InsufficientPrivilegeError；与 0018 修补 0013-0017 同性质。
-- GRANT 幂等，重复执行无副作用。
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE member_submissions TO app;
GRANT USAGE, SELECT ON SEQUENCE member_submissions_id_seq TO app;
