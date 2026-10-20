/**
 * 文章列表。对应参考站导航里的 Articles 一项。全部为演示用的编造内容。
 *
 * 日期一律写成字面量字符串，**不要用 new Date() 现算**：
 * 同一份数据服务端与客户端各算一次，取值不确定会直接导致 hydration 报错。
 */

export interface Article {
  id: string
  title: string
  /** 列表页的摘要，两行以内说清这篇讲什么 */
  excerpt: string
  category: string
  date: string
  /** 阅读时长，列表里与日期同排 */
  readTime: string
  /** 是否置顶。置顶那篇在列表页占一整行的大卡 */
  featured: boolean
}

export const ARTICLES: Article[] = [
  {
    id: 'design-system-first',
    title: '先做设计系统，再画页面',
    excerpt:
      '两百个后台页面，逐页画会画到第八十页就开始互相打架。把令牌、组件与间距先定死，后面的页面才是拼出来的而不是画出来的。',
    category: '方法',
    date: '2026-07-28',
    readTime: '8 分钟',
    featured: true,
  },
  {
    id: 'why-clients-ask-for-more-options',
    title: '客户为什么总想多看几版',
    excerpt: '要三版的背后往往不是「不满意」，而是「说不清哪里不对」。把判断标准提前摆到桌面上，比多画两版有用。',
    category: '协作',
    date: '2026-06-15',
    readTime: '6 分钟',
    featured: false,
  },
  {
    id: 'handoff-that-does-not-need-explaining',
    title: '不用解释的交付',
    excerpt: '好的交付物是工程同学打开就知道怎么做的。我们把标注、令牌与边界情况写进同一份文档，返工率降到了以前的三分之一。',
    category: '交付',
    date: '2026-05-09',
    readTime: '7 分钟',
    featured: false,
  },
  {
    id: 'typography-for-chinese-ui',
    title: '中文界面的字体排版，难在哪里',
    excerpt: '西文的一套字号阶梯搬到中文就会塌。字重稀少、字距规则不同、标点占位——这三件事决定了中文界面必须另有一套规范。',
    category: '排版',
    date: '2026-04-02',
    readTime: '11 分钟',
    featured: false,
  },
  {
    id: 'a-brand-is-not-a-logo',
    title: '品牌不是一个标志',
    excerpt: '标志只是最小的那一块。真正决定品牌看起来是否统一的，是版式、图片风格与说话的语气，而这三样最常被跳过。',
    category: '品牌',
    date: '2026-02-20',
    readTime: '9 分钟',
    featured: false,
  },
  {
    id: 'saying-no-to-projects',
    title: '我们拒绝项目的三条理由',
    excerpt: '预算对不上只是其中最不重要的一条。真正让我们说不的，通常是决策人不在场、目标说不清，或者对方要的其实是一批好看的图。',
    category: '工作室',
    date: '2026-01-08',
    readTime: '5 分钟',
    featured: false,
  },
]

export const FEATURED_ARTICLE: Article = (() => {
  const article = ARTICLES.find((item) => item.featured)
  // 置顶文章是列表页头条那张大卡的数据来源，一篇都没有会让页面顶部整块消失
  if (!article) throw new Error('[liubai] ARTICLES 里没有任何 featured 文章')
  return article
})()

export const REST_ARTICLES: Article[] = ARTICLES.filter((item) => !item.featured)
