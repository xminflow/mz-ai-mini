-- 将存量 NORMAL 会员账户迁移为 PREMIUM，保留原有效期不变。
-- 背景：会员体系拆分为 NORMAL(¥199) / PREMIUM(¥499)，原 ¥499 购买者对应新的 PREMIUM 等级。
-- 回滚：UPDATE agent_accounts SET membership_tier = 'normal' WHERE membership_tier = 'premium';

UPDATE agent_accounts
SET membership_tier = 'premium'
WHERE membership_tier = 'normal';
