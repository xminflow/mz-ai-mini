-- 将博主拆解报告从 TEXT 字段改为 COS 对象存储 URL。
-- 旧字段 report_html 删除，新增 report_html_url 存储 COS 公开 HTTPS URL。
ALTER TABLE blogger_insights
    DROP COLUMN report_html,
    ADD COLUMN report_html_url TEXT;
