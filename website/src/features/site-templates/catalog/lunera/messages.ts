import type { TemplateLocale } from '../../types'

const messages = {
  '面包屑导航': 'Breadcrumb', '博客': 'Journal', '← 返回文章列表': '← Back to the journal',
  '版本 1.0 · 更新日期：2025年5月24日': 'Version 1.0 · Updated May 24, 2025',
  '政策与条款': 'Policies and terms', '隐私政策': 'Privacy policy', '服务条款': 'Terms of service',
  '本页为模板演示内容。正式上线前，请根据实际服务替换组织信息、隐私政策与服务条款。': 'This is demonstration content. Replace company details and policies to reflect the actual service before launch.',
  '合作品牌': 'Our partners', '微域生光': 'Weelume', '产品功能': 'Features', '价格方案': 'Pricing', '联系我们': 'Contact',
  '主导航': 'Main navigation', '微域生光首页': 'Weelume home', '下载应用': 'Download App', '关闭菜单': 'Close menu', '打开菜单': 'Open menu',
  '让财务管理更从容': 'Make room for financial clarity.',
  '产品服务': 'Product', '工具集成': 'Integrations', '常见问题': 'FAQ', '了解更多': 'Resources',
  '微域生光：模板市场': 'Weelume: Template Marketplace', '模板预览 · 数据仅作演示': 'Template preview · Demonstration data',
  '跳到主要内容': 'Skip to main content', '原模板作者': 'Original template creator', '新模板': 'New template', 'Grovia 网站模板预览': 'Grovia website template preview', '使用模板': 'Use template',
  '你的疑问，在这里解答。': 'Your questions, answered.', '你可能还想了解。': 'A little more clarity.',
  '还有其他问题？欢迎通过上方表单告诉我们。': 'Still have a question? Let us know using the form above.', '了解这些细节，轻松迈出下一步。': 'Everything you need to feel confident about your next step.', '咨询我们': 'Talk to us',
  '让每一笔支出，更有章法。': 'A fresh perspective on your finances.', '分享财务管理、产品设计与创业日常的思考，为你的下一步带来启发。': 'Ideas on finance, thoughtful design, and building a business. Inspiration for your next move.',
  '邮件联系': 'Send an email', '告诉我们你的需求。以下为演示邮箱，上线前请配置实际联系方式。': 'Tell us what you have in mind. This example email should be replaced before launch.',
  '咨询销售': 'Talk to sales', '欢迎与我们交流计划，服务时间为周一至周五 9:00—18:00。': 'Let’s talk about your plans. Our example office hours are Monday–Friday, 9 AM–6 PM.',
  '加入 Discord 社区': 'Join our Discord', '结识社区伙伴，分享想法，了解产品新动态。': 'Meet the community, share ideas, and discover what’s new.', '点击加入': 'Join the community',
  '请填写姓名和留言内容后再提交。': 'Please enter your name and a message before submitting.',
  '内容已通过校验。当前为本地预览，留言尚未发送或保存。': 'Your details passed validation. This local preview has not sent or saved your message.',
  '有任何问题，我们乐意为你解答。': 'Let’s make things clearer.', '无论是产品咨询还是使用建议，都欢迎与我们交流。': 'Questions about the product or ideas to share? We’d love to hear from you.',
  '请输入有效的电子邮箱地址。': 'Please enter a valid email address.', '请完整填写此项内容。': 'Please complete this field.',
  '姓名': 'Name', '请输入你的姓名': 'Your name', '电子邮箱': 'Email', '请输入常用邮箱': 'you@company.com',
  '咨询主题': 'Topic', '请选择咨询主题': 'Choose a topic', '使用支持': 'Product support', '套餐咨询': 'Plans and pricing',
  '留言内容': 'Message', '请描述你的问题或需求': 'Tell us how we can help', '提交留言': 'Send message', '演示表单 · 仅校验内容，留言尚未发送。': 'Demo form · Validation only. Messages are not sent.',
  '看清每一笔收支': 'Your money, in focus.', '用清晰的数据、智能预算与实时洞察，掌握资金动态，规划每一个下一步。': 'Clear data, thoughtful budgets, and real-time insights. Know where you stand and plan what comes next.',
  '微域生光应用中的支付卡片与近期交易展示': 'Payment cards and recent transactions in the Weelume app', '应用商店新增收入': 'App Store revenue', '较上周增长': 'vs. last week', '休闲娱乐支出': 'Entertainment spending',
  '安心支付': 'Secure payments', '高效追踪': 'Effortless tracking', '全球 4 万多位用户的共同选择': 'Chosen by 40,000+ people worldwide',
  '化繁为简，让财务井井有条。': 'Less complexity. More clarity.', '连接你熟悉的工具，让协作更顺畅。': 'Your favorite tools. Better together.',
  '五个工具图标环绕蓝色弧线排列，展示集成能力': 'Five connected tool icons arranged around a blue arc', '使用流程': 'How it works', '只需三步，让数据成为行动的起点。': 'From numbers to next steps.',
  '清晰的方案，看得见的价值。': 'Simple plans. Lasting value.', '以下为美元月付演示价格，可按团队需求选择。': 'Example monthly prices in USD. Find a plan that fits your team.', '推荐方案': 'Best value', '/ 月': '/ month', '立即开始': 'Get started',
  '让管理更轻松，让变化看得见。': 'Real people. Clearer finances.', '少一些琐碎，多一些清晰。看看创业者和团队如何用更从容的方式管理财务。': 'Less busywork, more perspective. See how founders and teams find a calmer way to manage their finances.',
  '分享体验': 'Share your story', '轮播图': 'carousel', '用户评价': 'Customer stories', '评分：5 星，满分 5 星': '5 out of 5 stars', '上一组评价': 'Previous reviews', '下一组评价': 'Next reviews',
  '用户共同选择': 'People on board', '服务可用率': 'Service uptime', '已追踪金额（美元）': 'Tracked in USD', '多一份洞察，让每一笔钱更有价值。': 'Fresh insights for smarter decisions.', '阅读更多': 'Read more',
} as const

export type MessageKey = keyof typeof messages
export function getTranslator(locale: TemplateLocale) {
  return (key: MessageKey): string => locale === 'en' ? messages[key] : key
}
