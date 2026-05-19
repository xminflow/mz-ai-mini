-- 把 blogger_insights.avatar_url 从 VARCHAR(2048) 扩成 TEXT。
-- 背景：research-kit 上传时把抖音 CDN 头像 base64 化（避免 CDN URL 失效断图），
-- base64 data URI 长度通常 30-70KB，超出 2048。改成 TEXT 让一个字段同时容纳
-- http(s) 外链和 data:image/jpeg;base64,... 两种形态。
--
-- 兼容性：
--   · PostgreSQL 对 VARCHAR -> TEXT 是 in-place 改动，不重写表，不锁数据，无停机风险。
--   · 现有数据（短 URL）保留不动。
--   · 应用层读写无差异，回滚也只需要 ALTER 回 VARCHAR(N)（前提是没有更长的数据写入）。
ALTER TABLE blogger_insights
    ALTER COLUMN avatar_url TYPE TEXT;
