import type { LibraryItem, LibraryType } from '@/types/library'

const PLATFORMS = ['小红书', '抖音', '视频号', 'B站', '快手', '公众号', '知乎', '微博', 'YouTube', '即刻']
const INDUSTRIES = ['知识付费', '个人成长', '本地生活', '消费品', '美妆', '健身', '母婴', '职场', '科技', '财经']

const LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: 'breakdown-xhs-001',
    type: 'breakdown',
    title: '小红书爆款｜「一人公司年入百万」帖如何在 24h 内冲破 5w 赞',
    summary:
      '一条「数字+对比+反常识」的标题钩子，配合首图情绪化短句，把抽象的「自由职业」具象成可视化的生活样本，吃满了平台的「人生选择」内容池。',
    coverEmoji: '✨',
    tags: ['标题钩子', '情绪化首图', '人生选择'],
    platforms: ['小红书'],
    industries: ['个人成长'],
    publishedAt: '2026-04-22',
    readTime: 8,
    hint: { interactions: '5.2w 赞 · 8k 收藏', platform: '小红书', industry: '个人成长' },
    payload: {
      type: 'breakdown',
      data: {
        sourceUrl: 'https://www.xiaohongshu.com/explore/example-001',
        sourcePlatform: '小红书',
        oneLine:
          '把「一人公司」这种抽象概念，用具体的一天作息 + 收入数字 + 反常识对比，做成所有上班族都会主动转发的「自我投射型内容」。',
        hook: [
          '标题：「我，27 岁，一人公司，去年挣了 100w」——数字 + 身份 + 反预期',
          '首图：浅色背景上一句手写体——「我不上班，但我比上班的人更累」',
          '前三行文案：直接亮收入截图，跳过铺垫，给读者「值得读下去」的明确预期',
        ],
        structure: [
          '钩子：标题 + 首图 + 前三行（30% 完读率分水岭）',
          '冲突：「100w 是真的，但我一年掉了 8 斤」（颠覆财富自由幻想）',
          '论证：拆 3 个收入来源 + 真实工作时长 + 一项最难熬的代价',
          '收尾：「如果你也想过这种生活，先问自己 3 个问题」——把流量沉淀成评论与关注',
        ],
        rhythm: [
          '0-3s（首图）：身份反差 + 数字',
          '3-10s（前 3 屏）：直接给结果，不绕弯',
          '10-30s（中段）：穿插具体场景，避免「方法论堆叠」',
          '30s+（结尾）：抛问题，激发评论',
        ],
        template: [
          '钩子模板：[年龄] + [非标准身份] + [反预期数字] = 必停留',
          '结构模板：「光鲜结果 → 真实代价 → 拆解路径 → 留问题」',
          '首图模板：单一句手写体文案 + 浅色背景 + 极简配色',
        ],
        audience: '想做自由职业 / 一人公司的小红书创作者；想拆解「身份反差类」选题的内容操盘手。',
      },
    },
  },
  {
    id: 'breakdown-dy-001',
    type: 'breakdown',
    title: '抖音爆款｜30s 内 4 次「情绪反转」让停留率突破 60% 的口播视频',
    summary:
      '一个非头部博主的口播视频意外破圈：每 7-8 秒一个情绪反转点，配合背景小动作和镜头节奏切换，把「无聊话题」做成「停不下来的爽片」。',
    coverEmoji: '🎬',
    tags: ['节奏控制', '情绪反转', '口播'],
    platforms: ['抖音'],
    industries: ['知识付费'],
    publishedAt: '2026-04-18',
    readTime: 6,
    hint: { interactions: '播放 380w · 完播率 62%', platform: '抖音', industry: '知识付费' },
    payload: {
      type: 'breakdown',
      data: {
        sourceUrl: 'https://www.douyin.com/video/example-002',
        sourcePlatform: '抖音',
        oneLine:
          '不是内容有多新，而是「节奏密度」做到了头部水准——30 秒里 4 个反转，每个反转都让观众产生「再看一眼」的冲动。',
        hook: [
          '0-2s：一句反共识断言「读书无用？这恰恰是富人想让你信的」',
          '配合表情：上扬眉毛 + 短暂停顿 → 制造「等一下，他要说什么」',
          '背景：极简书架，颜色克制，所有注意力都集中在脸和声音',
        ],
        structure: [
          '反转 1（5s）：颠覆常识',
          '反转 2（13s）：把矛头指向「精英教育的秘密」',
          '反转 3（21s）：给出可执行动作',
          '反转 4（29s）：留下一个不答的问题，引导评论',
        ],
        rhythm: [
          '镜头切换：每 4-5 秒一次微镜头变化（侧身、靠前、靠后）',
          '语速变化：关键词放慢 + 副信息加速，制造对比',
          'BGM：低音持续 + 关键反转处加 0.5s 钢琴音',
        ],
        template: [
          '口播节奏模板：反共识断言 → 论据 → 反转 → 行动 → 留白',
          '镜头模板：每 5 秒做一次微变化，避免「死板讲述」',
          '收尾模板：抛问题 → 评论区互动 → 提升二次推流',
        ],
        audience: '抖音口播类创作者；做知识、观点、个人成长方向的中长尾博主。',
      },
    },
  },
  {
    id: 'breakdown-wx-001',
    type: 'breakdown',
    title: '公众号爆款｜一篇 3k 字的「赛道复盘」如何稳定在 10w+ 阅读',
    summary:
      '一篇没有标题党、没有强情绪的长文，靠「真问题 + 真数据 + 一个非共识结论」做到稳态破圈——长内容回归本质的样本。',
    coverEmoji: '📑',
    tags: ['长文', '数据驱动', '非共识结论'],
    platforms: ['公众号'],
    industries: ['财经'],
    publishedAt: '2026-04-10',
    readTime: 12,
    hint: { interactions: '10.2w 阅读 · 在看 1.8k', platform: '公众号', industry: '财经' },
    payload: {
      type: 'breakdown',
      data: {
        sourceUrl: 'https://mp.weixin.qq.com/s/example-003',
        sourcePlatform: '公众号',
        oneLine:
          '当所有人都在做短平快内容时，一篇「真问题、真调研、非共识结论」的长文反而成为稀缺品——尤其是在公众号生态里。',
        hook: [
          '标题：「我们调研了 87 家小红书 MCN，发现一个反常识的事实」',
          '副标：3 个月、87 次访谈、5 个判断',
          '首段：直接抛结论 + 关键数据 + 一个争议点',
        ],
        structure: [
          '一句话结论（前 100 字）',
          '现象观察 + 3 个数据图表',
          '深度论证（3-5 段，配真实案例）',
          '反对意见 + 回应',
          '给读者的行动建议',
        ],
        rhythm: [
          '段落极短，平均 60 字一段，刷起来不疲劳',
          '关键数字加粗 + 配图，让滑动也能抓住核心',
          '每 800 字插入一张图表 / 引用框，重置注意力',
        ],
        template: [
          '长文标题模板：「我们 + 量化动作 + 反共识发现」',
          '结构模板：结论先行 → 数据支撑 → 反对处理 → 行动建议',
          '排版模板：短段 + 加粗 + 图表，让长文像短文一样可滑动',
        ],
        audience: '公众号长内容创作者；想做「深度+稳态破圈」而非「标题党+短尾」的内容操盘手。',
      },
    },
  },
  {
    id: 'blogger-001',
    type: 'blogger',
    title: '一人公司·小满｜从一个号到 6 号矩阵，2 年做到 80w 私域',
    summary:
      '主号定位「一人公司经营笔记」，围绕一个核心人设搭建 5 个子号矩阵——分别承接 SOP、采访、变现、灵感、答疑——把「内容流量」精准导流到「私域转化」。',
    coverEmoji: '🧭',
    tags: ['矩阵布局', '私域转化', '一人公司'],
    platforms: ['小红书', '公众号'],
    industries: ['个人成长', '知识付费'],
    publishedAt: '2026-04-20',
    readTime: 10,
    hint: { fanCount: '主号 28w · 矩阵共 96w', matrixCount: 6, platform: '小红书' },
    payload: {
      type: 'blogger',
      data: {
        profile: {
          nickname: '小满 · 一人公司',
          platform: '小红书 · 公众号',
          fans: '主号 28w · 矩阵共 96w',
          positioning: '一人公司经营者 · 用内容做获客 · 把方法论结构化',
        },
        oneLine:
          '她不是流量博主，而是「私域获客操盘手」——所有内容都是漏斗中的某一环，最终把 80w 用户沉淀到企微。',
        matrix: [
          { name: '小满 · 一人公司（主号）', role: '人设 + 主张 + 流量入口' },
          { name: '小满的 SOP 笔记', role: '可执行的工作流，重收藏' },
          { name: '小满采访', role: '与同类创业者对话，扩大共鸣' },
          { name: '小满的变现日记', role: '真实数字 + 真实代价，建立信任' },
          { name: '小满的选题灵感', role: '日更轻内容，维持账号活跃度' },
          { name: '小满答疑', role: '高频问题集中处理，导流到私域' },
        ],
        timeline: [
          { when: '2024.03', what: '主号起号，第一个月只发 4 条' },
          { when: '2024.07', what: '第一条爆款（5w 赞），开始尝试矩阵' },
          { when: '2024.11', what: '主号 + SOP 号双爆，私域破 10w' },
          { when: '2025.05', what: '矩阵扩到 6 号，全渠道 30w 粉' },
          { when: '2026.02', what: '矩阵粉丝 96w，私域 80w，年付费用户 4k+' },
        ],
        methodology: [
          '主号只承担「人设 + 价值观」，不承接转化',
          '每个子号都有明确的「内容池关键词」与「漏斗位置」',
          '每周一篇主号长文 + 3 篇短钩子，反向给子号引流',
          '所有内容必有「下一步动作」（关注 / 私信 / 添加企微）',
        ],
        monetization: [
          '入门付费产品：99 元 SOP 包',
          '中阶：999 元社群（季度制）',
          '高阶：9999 元 1v1 顾问（年度 8-12 席）',
          '矩阵广告：高客单品牌，单次 5w-15w',
        ],
        borrowable: [
          '矩阵的「漏斗角色」思维：每个号承担一种转化任务',
          '内容必有「下一步动作」的设计纪律',
          '把方法论做成可收藏的 SOP 包，复用一切流量',
        ],
        notReplicable: [
          '主号已沉淀的人设权威，新人无法在 3 个月内复制',
          '已建立的同行人脉资源（采访号的核心来源）',
        ],
      },
    },
  },
  {
    id: 'blogger-002',
    type: 'blogger',
    title: '抖音口播·林意｜专注「商业本质」，单号 120w 粉，年课收 800w',
    summary:
      '没有矩阵、不接广告、不做带货——只做一件事：把商业逻辑讲清楚。一个反「矩阵潮流」的样本，证明「深度 + 单点」依然可行。',
    coverEmoji: '🎯',
    tags: ['单号深耕', '高客单课程', '商业内容'],
    platforms: ['抖音'],
    industries: ['知识付费', '财经'],
    publishedAt: '2026-04-15',
    readTime: 9,
    hint: { fanCount: '单号 120w', matrixCount: 1, platform: '抖音' },
    payload: {
      type: 'blogger',
      data: {
        profile: {
          nickname: '林意',
          platform: '抖音',
          fans: '120w（单号）',
          positioning: '商业本质讲述者 · 专注「商业逻辑深度内容」',
        },
        oneLine:
          '所有「必须做矩阵」的论调，在他这里都被一个事实推翻——单点足够深，依然能稳定输出年收 800w 的课程业务。',
        matrix: [
          { name: '林意（主号 · 唯一号）', role: '人设 + 内容 + 转化全在一个号完成' },
        ],
        timeline: [
          { when: '2023.05', what: '抖音起号，第一年只更新 30 条' },
          { when: '2023.12', what: '第一条破圈视频（500w 播放），粉丝从 1w 到 18w' },
          { when: '2024.07', what: '50w 粉，开始推首期商业课' },
          { when: '2025.03', what: '100w 粉，年课收 380w' },
          { when: '2026.04', what: '120w 粉，年课收 800w，全年只上线 4 次课' },
        ],
        methodology: [
          '每条视频 1 个观点，杜绝「信息堆叠」',
          '宁可少更，绝不降质——平均一周 1 条',
          '从不接广告，所有变现走自己的课程',
          '评论区亲自回复，建立「真人感」',
        ],
        monetization: [
          '商业基础课：2999 元 / 期，一年 4 期',
          '私董会：3.6w / 年，限 50 人',
          '不接商单 / 不带货',
        ],
        borrowable: [
          '「单点深度 + 自有产品」是被验证的路径',
          '严格的更新纪律 → 内容质量 → 单条转化效率',
          '把评论区当作产品体验的一部分',
        ],
        notReplicable: [
          '深度商业认知与多年咨询经验',
          '自带的「专家身份感」与镜头表达力',
        ],
      },
    },
  },
  {
    id: 'track-001',
    type: 'track',
    title: '赛道分析｜小红书「一人公司 / 自由职业」赛道：还能进吗？怎么进？',
    summary:
      '从 2024 下半年开始爆发的「自由职业」内容赛道，已经从「红利期」走入「分化期」——头部固化、腰部增长慢、新人需找差异化切口。',
    coverEmoji: '🗺️',
    tags: ['一人公司', '小红书', '机会窗口'],
    platforms: ['小红书'],
    industries: ['个人成长', '知识付费'],
    publishedAt: '2026-04-25',
    readTime: 11,
    hint: { keyDataPoints: ['头部 ≈ 20 个', '腰部 ≈ 180 个', '月新增 30+ 万创作者'] },
    payload: {
      type: 'track',
      data: {
        portrait: {
          industry: '个人成长 · 自由职业',
          platforms: ['小红书'],
          stage: '红利期末段 → 分化期初段',
        },
        oneLine:
          '现在进，不是「赶上」，而是「绕开主战场，做差异化切片」——直接做「我也想做自由职业」已经卷不动了，但「自由职业的某个具体侧面」依然有窗口。',
        landscape: [
          { tier: '头部（20+）', players: '已建立完整产品矩阵，月入 10w+，私域为主战场' },
          { tier: '腰部（180+）', players: '5-30w 粉，靠单一爆款支撑，变现路径不稳' },
          { tier: '新晋（每月新增 30w+ 创作者）', players: '90% 在 3 个月内放弃，10% 找到差异化切口' },
        ],
        opportunities: [
          '「某个行业的一人公司」切片：律师、设计师、心理咨询的一人公司',
          '「某个阶段的一人公司」切片：起步 90 天、第一桶金、第一次招人',
          '「某种性格的一人公司」切片：i 人创业、社恐做内容',
          '面向 35+ / 二线城市的「下沉式自由职业」内容',
        ],
        ceiling: [
          '粉丝天花板：单号 80-120w，超过这个量级需多平台',
          '商业天花板：年课程 + 1v1 + 私域，理论上限 500-1000w',
          '内容天花板：从「方法论」到「人生哲学」的迁移，再上就是 IP 跨界',
          '隐形成本：精神能耗、家庭关系、长期内容焦虑',
        ],
        monetization: [
          '入门：99-299 SOP 包 / 课程',
          '中阶：999-2999 训练营 / 社群',
          '高阶：9999+ 1v1 顾问',
          '广告：转化型品牌（工具、SaaS、教育）',
        ],
        startupStrategy: [
          '前 30 天：定位 + 选定一个差异化切片',
          '30-90 天：稳定输出 + 第一条爆款（不爆款不进下一阶段）',
          '90-180 天：私域漏斗 + 入门付费产品',
          '180-365 天：内容矩阵 + 中阶产品',
          '关键纪律：永远不发「自由职业 = 自由」这种通用话术',
        ],
      },
    },
  },
  {
    id: 'playbook-001',
    type: 'playbook',
    title: '百万粉博主运营方法论精炼｜从 0 起号 90 天：每周做什么、不做什么',
    summary:
      '一份按周拆解的 90 天起号 SOP——每周明确的产出动作、避坑提醒、复盘问题，让冷启动不再「无方向地刷」。',
    coverEmoji: '📘',
    tags: ['冷启动', 'SOP', '可执行'],
    platforms: [],
    industries: [],
    publishedAt: '2026-04-28',
    readTime: 18,
    hint: { difficulty: '入门 → 中级', hasDownload: true },
    payload: {
      type: 'playbook',
      data: {
        audience:
          '刚决定做自媒体获客的一人公司 / 自由职业者；想要一份「按周看的进度表」而不是「方法论堆叠」的人。',
        steps: [
          {
            title: 'Week 1-2 ｜定位 & 选题池',
            detail:
              '完成「人设三句话」、「目标读者画像」、「30 个种子选题」。本阶段一条内容都不发——避免在没想清楚前耗散判断力。',
          },
          {
            title: 'Week 3-4 ｜节奏建立',
            detail:
              '每周 3 条短内容 + 1 条主帖。不追求爆款，只追求「按时发完」与「选题池消耗」。本阶段考核：是否能稳定 4 周不断更。',
          },
          {
            title: 'Week 5-8 ｜第一条爆款攻坚',
            detail:
              '复盘前 4 周数据，挑选互动率最高的方向集中产出。允许「一周只发一条」，目标是产出 1 条破圈内容（>5x 平均播放）。',
          },
          {
            title: 'Week 9-12 ｜复制 + 沉淀',
            detail:
              '把爆款拆成模板，做 3-5 条同结构变体；同时建立第一版私域漏斗（个人微信 / 企微）。',
          },
        ],
        checklist: [
          '是否完成「人设三句话」并能 10 秒内说出？',
          '是否建立 30 个起始选题池？',
          '前 4 周是否做到不断更？',
          '是否产出至少 1 条 5x 平均播放的内容？',
          '是否建立第一版私域漏斗？',
        ],
        downloads: [{ label: '90 天起号 SOP（PDF）', href: '#' }],
      },
    },
  },
  {
    id: 'playbook-002',
    type: 'playbook',
    title: '百万粉博主运营方法论精炼｜爆款选题的 5 种「反共识结构」',
    summary:
      '为什么有的选题天然容易爆？因为它在认知层面就「反共识」。5 种被验证的反共识结构 + 30 个示例，让你下次写不出选题时也有可参照模板。',
    coverEmoji: '🧠',
    tags: ['选题方法', '反共识', '钩子'],
    platforms: [],
    industries: [],
    publishedAt: '2026-04-12',
    readTime: 9,
    hint: { difficulty: '中级', hasDownload: false },
    payload: {
      type: 'playbook',
      data: {
        audience:
          '已经在更新但停留率上不去的创作者；写选题写到「不知道写什么」的中尾博主。',
        steps: [
          {
            title: '结构 1 ｜结果反差',
            detail:
              '光鲜结果 vs 真实代价。例：「年入 100w 的一人公司，去年掉了 8 斤」。',
          },
          {
            title: '结构 2 ｜身份反差',
            detail: '不应该说这话的人在说这话。例：「全网最反对鸡娃的人，是个鸡娃教练」。',
          },
          {
            title: '结构 3 ｜数据反预期',
            detail: '用具体数据颠覆固有判断。例：「我们调研了 87 家 MCN，发现…」。',
          },
          {
            title: '结构 4 ｜时间错位',
            detail: '在「应该 A」的时间做 B。例：「30 岁前应该努力？我 28 岁辞职去了哪里」。',
          },
          {
            title: '结构 5 ｜情绪不正确',
            detail: '说出大众不敢说但都想过的事。例：「我承认，我刷到同行爆款会嫉妒」。',
          },
        ],
        checklist: [
          '本周写出的 5 条选题，是否至少 3 条用了上述结构？',
          '是否避免了「方法论堆叠 + 无反差」的安全选题？',
          '是否在前 3 行就让读者感受到「反共识」？',
        ],
      },
    },
  },
]

export interface LibraryListQuery {
  type?: LibraryType
  platform?: string
  industry?: string
  keyword?: string
  cursor?: string
  limit?: number
}

export interface LibraryListResult {
  list: LibraryItem[]
  nextCursor: string
  hasMore: boolean
  availablePlatforms: string[]
  availableIndustries: string[]
  counts: Record<LibraryType, number>
}

const DEFAULT_LIMIT = 12

const filterItems = (query: LibraryListQuery): LibraryItem[] => {
  const keyword = (query.keyword ?? '').trim().toLowerCase()
  return LIBRARY_ITEMS.filter((item) => {
    if (query.type && item.type !== query.type) return false
    if (query.platform && !item.platforms.includes(query.platform)) return false
    if (query.industry && !item.industries.includes(query.industry)) return false
    if (keyword) {
      const haystack = [item.title, item.summary, ...item.tags].join(' ').toLowerCase()
      if (!haystack.includes(keyword)) return false
    }
    return true
  })
}

const computeCounts = (): Record<LibraryType, number> => ({
  breakdown: LIBRARY_ITEMS.filter((i) => i.type === 'breakdown').length,
  blogger: LIBRARY_ITEMS.filter((i) => i.type === 'blogger').length,
  track: LIBRARY_ITEMS.filter((i) => i.type === 'track').length,
  playbook: LIBRARY_ITEMS.filter((i) => i.type === 'playbook').length,
})

export const fetchLibraryList = (query: LibraryListQuery): LibraryListResult => {
  const items = filterItems(query)
  const limit = query.limit ?? DEFAULT_LIMIT
  const startIndex = query.cursor ? Number(query.cursor) : 0
  const pageItems = items.slice(startIndex, startIndex + limit)
  const nextIndex = startIndex + pageItems.length
  return {
    list: pageItems,
    nextCursor: nextIndex < items.length ? String(nextIndex) : '',
    hasMore: nextIndex < items.length,
    availablePlatforms: PLATFORMS,
    availableIndustries: INDUSTRIES,
    counts: computeCounts(),
  }
}

export const fetchLibraryItem = (id: string): LibraryItem | undefined => {
  return LIBRARY_ITEMS.find((item) => item.id === id)
}

export const fetchRelatedItems = (id: string, limit = 3): LibraryItem[] => {
  const current = fetchLibraryItem(id)
  if (!current) return []
  const score = (other: LibraryItem) => {
    if (other.id === id) return -1
    let s = 0
    if (other.type === current.type) s += 2
    s += other.industries.filter((i) => current.industries.includes(i)).length
    s += other.platforms.filter((p) => current.platforms.includes(p)).length
    return s
  }
  return [...LIBRARY_ITEMS]
    .filter((o) => o.id !== id)
    .map((o) => ({ item: o, s: score(o) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.item)
}

export const PLATFORMS_LIST = PLATFORMS
export const INDUSTRIES_LIST = INDUSTRIES
