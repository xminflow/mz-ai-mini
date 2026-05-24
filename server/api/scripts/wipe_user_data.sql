-- =============================================================================
-- 清空 website 用户全部数据（高危脚本，仅手工执行，不会被 migrations 自动加载）
-- =============================================================================
-- 影响范围：8 张表 —— 用户主表、登录态、微信/邮箱身份、会员订单、提交工单。
-- 不会触碰：blogger_insights / track_analyses / business_cases / case_research /
--           schema_migrations / ua-agent 的 membership_orders 等内容/独立体系表。
--
-- 执行前必须：
--   1) 全库备份（pg_dump 或云厂商快照）。
--   2) 执行下面 "干跑" 段，确认数据量符合预期。
--   3) 确认 24h 内无 PENDING 状态的会员订单（否则微信回调到达后会找不到订单）。
--   4) 微信支付商户后台数据不受影响；如有需要请单独处理退款。
--
-- 执行方式（推荐）：
--   psql "$DATABASE_URL" -1 -f server/api/scripts/wipe_user_data.sql
--   或者在 psql 交互中分段执行：先看 SELECT、再 TRUNCATE、再看 SELECT、再 COMMIT。
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1) 干跑：预览将被清空的行数
-- ---------------------------------------------------------------------------
SELECT 'agent_accounts'                AS table_name, COUNT(*) AS rows FROM agent_accounts
UNION ALL SELECT 'agent_auth_sessions',          COUNT(*) FROM agent_auth_sessions
UNION ALL SELECT 'agent_auth_access_tokens',     COUNT(*) FROM agent_auth_access_tokens
UNION ALL SELECT 'agent_wechat_identities',      COUNT(*) FROM agent_wechat_identities
UNION ALL SELECT 'agent_wechat_login_sessions',  COUNT(*) FROM agent_wechat_login_sessions
UNION ALL SELECT 'agent_email_login_challenges', COUNT(*) FROM agent_email_login_challenges
UNION ALL SELECT 'account_membership_orders',    COUNT(*) FROM account_membership_orders
UNION ALL SELECT 'member_submissions',           COUNT(*) FROM member_submissions;


-- ---------------------------------------------------------------------------
-- 2) 正式清空（事务包裹，COMMIT 前可 ROLLBACK 撤回）
-- ---------------------------------------------------------------------------
BEGIN;

TRUNCATE TABLE
    member_submissions,
    account_membership_orders,
    agent_wechat_login_sessions,
    agent_wechat_identities,
    agent_auth_access_tokens,
    agent_auth_sessions,
    agent_email_login_challenges,
    agent_accounts
RESTART IDENTITY;

-- 验证：所有表行数应全为 0；不符合预期请立即 ROLLBACK
SELECT 'agent_accounts'                AS table_name, COUNT(*) AS rows FROM agent_accounts
UNION ALL SELECT 'agent_auth_sessions',          COUNT(*) FROM agent_auth_sessions
UNION ALL SELECT 'agent_auth_access_tokens',     COUNT(*) FROM agent_auth_access_tokens
UNION ALL SELECT 'agent_wechat_identities',      COUNT(*) FROM agent_wechat_identities
UNION ALL SELECT 'agent_wechat_login_sessions',  COUNT(*) FROM agent_wechat_login_sessions
UNION ALL SELECT 'agent_email_login_challenges', COUNT(*) FROM agent_email_login_challenges
UNION ALL SELECT 'account_membership_orders',    COUNT(*) FROM account_membership_orders
UNION ALL SELECT 'member_submissions',           COUNT(*) FROM member_submissions;

COMMIT;
-- 如发现异常，把上一行改成: ROLLBACK;
