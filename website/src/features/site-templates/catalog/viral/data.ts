export type Copy = readonly [string, string]

export const services = [
  { title: ['内容创作', 'Content Creation'] as Copy, text: ['短视频、UGC、Reels 与视觉内容，停住滑动并激发互动。', 'Short-form video, UGC, reels, and visuals designed to stop the scroll and spark engagement.'] as Copy, media: '/templates/viral/assets/service-content.mp4' },
  { title: ['社媒管理', 'Social Management'] as Copy, text: ['负责内容日历、发布与社交账号的日常管理，让品牌持续出现。', 'We handle your content calendar, posting, and day-to-day management of your socials.'] as Copy, media: '/templates/viral/assets/service-social.mp4' },
  { title: ['付费媒体', 'Paid Media'] as Copy, text: ['构建并管理精准广告，把注意力转化为结果并支持规模化增长。', 'We build and manage targeted ad campaigns that turn attention into results and help you scale.'] as Copy, media: '/templates/viral/assets/service-paid.mp4' },
]

export const cases = [
  { brand: 'Glowhaus', title: ['用 Reels 放大美妆品牌', 'Scaling a beauty brand with reels'] as Copy, text: ['Glowhaus 有好产品，却缺少互动。我们用 UGC 驱动内容策略，围绕短视频优化 Reels。', 'Beauty brand Glowhaus came to us with great products but low engagement. We developed a UGC-driven content strategy focused on short-form video, optimized for Reels.'] as Copy, stats: [['128', 'K', 'Reel Views'], ['245', '%', 'Engagement']], media: '/templates/viral/assets/case-glowhaus.mp4' },
  { brand: 'Theo', title: ['用视频增长服装品牌', 'Growing a clothing brand with video'] as Copy, text: ['Theo 在新品发布前希望扩大触达，我们结合 UGC、轻量达人种草与短视频内容制造期待。', 'Theo came to us ahead of a new collection launch, looking to grow reach and build anticipation. We combined UGC with light influencer seeding and short-form video.'] as Copy, stats: [['84', 'K', 'Followers'], ['182', '%', 'Engagement']], media: '/templates/viral/assets/case-theo.mp4' },
]

export const steps = [
  { title: ['先做策略', 'Strategy First'] as Copy, text: ['在发布前先对齐目标、受众与内容方向。', 'We align on goals, audience, and content direction before anything goes live.'] as Copy },
  { title: ['创作与管理', 'Create & Manage'] as Copy, text: ['负责制作、排期与各大平台的持续发布。', 'We handle production, scheduling, and posting across key platforms.'] as Copy },
  { title: ['复盘与迭代', 'Review & Refine'] as Copy, text: ['跟踪表现，找到有效内容，并持续调整。', 'We track performance, learn what works, and adjust as needed.'] as Copy },
]

export const faq = [
  { q: ['多久能看到效果？', 'How quickly will we see results?'] as Copy, a: ['大多数客户在前两周就会看到互动增长，显著提升通常发生在第二个月。我们更重视可持续的势能，而非短暂的流量尖峰。', 'Most clients see increased engagement within the first two weeks, with significant growth typically happening by month two. We focus on sustainable momentum rather than spikes that do not last.'] as Copy },
  { q: ['你们管理哪些平台？', 'What platforms do you manage?'] as Copy, a: ['我们覆盖 Instagram、TikTok、Facebook、LinkedIn 与 Twitter，并会建议聚焦受众最活跃的 2–3 个平台。', 'We handle Instagram, TikTok, Facebook, LinkedIn, and Twitter. We recommend focusing on two or three platforms where your audience is most active.'] as Copy },
  { q: ['你们服务哪些行业？', 'Do you work with our industry?'] as Copy, a: ['我们服务过美妆、时尚、食品、科技、健康与专业服务，方法会根据行业、受众和目标调整。', 'We have worked with beauty, fashion, food, tech, wellness, and professional services. Our approach adapts to your audience and goals.'] as Copy },
  { q: ['想取消合作怎么办？', 'What if we want to cancel?'] as Copy, a: ['我们按月合作，提前 30 天通知即可，没有长期合同或取消费用。', 'We work month to month with 30 days notice. There are no long-term contracts or cancellation fees.'] as Copy },
  { q: ['我们需要参与多少？', 'How involved do we need to be?'] as Copy, a: ['你可以按希望的程度参与：每周同步或每月复盘都可以，我们负责日常执行。', 'You stay as involved as you want. Some clients prefer weekly check-ins, others are happy with monthly reviews.'] as Copy },
]

export function text(value: Copy, locale: 'zh' | 'en'): string { return value[locale === 'zh' ? 0 : 1] }
