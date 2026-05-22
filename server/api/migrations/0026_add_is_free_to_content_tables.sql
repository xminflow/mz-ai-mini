-- 为博主洞察和赛道分析表新增 is_free 字段，区分免费内容与会员专属内容。
-- 默认 FALSE：所有现有内容标记为会员专属；需要免费访问的内容需显式更新。

ALTER TABLE blogger_insights
    ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_blogger_insights_is_free
    ON blogger_insights (is_free);

ALTER TABLE track_analyses
    ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_track_analyses_is_free
    ON track_analyses (is_free);
