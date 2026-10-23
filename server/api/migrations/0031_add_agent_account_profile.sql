-- 兼容升级：先迁移再部署新后端；旧后端忽略新增可空列。
-- 不回填旧账号，读取时保留其原用户名。新账号由注册用例写入 weelume 展示名。
-- 回滚应用时保留两列及新增资料，不执行 DROP，避免丢失上线后的用户修改。
ALTER TABLE agent_accounts
    ADD COLUMN IF NOT EXISTS display_name VARCHAR(64),
    ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(1024);
