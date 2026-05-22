-- 破坏性迁移：废弃 COS 报告托管路径，HTML 重新回到 blogger_insights 表内
-- 经由用户明确授权清空 blogger_insights 全部记录（数据量小、可由 research-kit
-- publish 直接重传恢复）。先 DELETE 才能安全地把 report_html 列加成 NOT NULL。
DELETE FROM blogger_insights;

ALTER TABLE blogger_insights
    DROP COLUMN report_html_url,
    ADD COLUMN report_html TEXT NOT NULL;
