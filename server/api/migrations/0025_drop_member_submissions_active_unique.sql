-- Lift the per-type single-active constraint on member_submissions.
-- Reason: 业务上允许同一账号同一类型同时存在多条 pending 工单（仅受月配额上限约束），
-- 同时配合「我的提交记录」页面新增的删除待处理功能。
DROP INDEX IF EXISTS uk_member_submissions_active;
