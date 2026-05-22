import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '百万博主运营方法论精炼 · 自媒体运营实战手册',
  description:
    '从底层逻辑、定位、选题到文案、脚本、拍摄剪辑、增长、变现——面向实体老板、专业人士与个人 IP 创业者的 AI × 自媒体获客实战方法论手册，把别人验证过的经验变成你的方法。',
  openGraph: {
    title: '百万博主运营方法论精炼 · 自媒体运营实战手册',
    description: '正确比多重要，短视频是练会的，粉丝经济是终局——AI × 自媒体获客方法论。',
  },
}

type Volume = {
  no: string
  title: string
  meta: string
  desc: string
  chapters: Array<{ no: string; title: string }>
  href?: string
  status?: string
}

const STATS = [
  { value: '9', label: '正卷 + 番外' },
  { value: '30+', label: '可填工具' },
  { value: '100+', label: '真实案例' },
]

const VOLUMES: Volume[] = [
  {
    no: '序言',
    title: '写在前面',
    meta: '3,000 字',
    desc: '这本书要解决什么，不解决什么。带着三个问题开始阅读。',
    href: '/playbook/preface',
    status: '已开放',
    chapters: [
      { no: 'S0', title: '前言 · 做对，不是做多' },
      { no: 'S1', title: '本书写给谁' },
      { no: 'S2', title: '怎么读这本书' },
    ],
  },
  {
    no: '第一篇',
    title: '底层逻辑',
    meta: '18,000 字 · 8 节',
    desc: '凭什么能做成。建立对错思维，从公理出发判断这件事值不值得做。',
    href: '/playbook/foundations',
    status: '已开放',
    chapters: [
      { no: '1.0', title: '导读 · 三条公理' },
      { no: '1.1', title: '知识追求的是对错' },
      { no: '1.2', title: '风口的本质是效率' },
      { no: '1.3', title: '收入 = 流量 × 变现' },
      { no: '1.4', title: '从流量经济到粉丝经济' },
      { no: '1.5', title: '短视频还能不能做 · 为什么是抖音' },
      { no: '1.6', title: '信任前置：颠覆传统生意的真正杠杆' },
      { no: '1.7', title: '本篇练习 · 写下你的入场判断书' },
    ],
  },
  {
    no: '第二篇',
    title: '定位',
    meta: '22,000 字 · 10 节',
    desc: '你是谁、对谁说话。商业定位、内容定位、人设定位三位一体。',
    href: '/playbook/positioning',
    status: '已开放',
    chapters: [
      { no: '2.0', title: '导读 · 画等号' },
      { no: '2.1', title: '6 大优势自检' },
      { no: '2.2', title: '商业定位四阶梯' },
      { no: '2.3', title: '内容定位三原则' },
      { no: '2.4', title: '痛点 + 方案超级公式' },
      { no: '2.5', title: '视觉锤与文字钉' },
      { no: '2.6', title: '向下兼容' },
      { no: '2.7', title: 'IP 前置规划六问' },
      { no: '2.8', title: '寻找空白与做跨界' },
      { no: '2.9', title: '定位卡片练习' },
    ],
  },
  {
    no: '第三篇',
    title: '选题与素材库',
    meta: '18,000 字 · 9 节',
    desc: '解决今天发什么的焦虑，从等灵感变成打开素材库就能拍。',
    href: '/playbook/topics',
    status: '已开放',
    chapters: [
      { no: '3.0', title: '导读 · 离爆款只差一个选题' },
      { no: '3.1', title: '选题的本质 + 情绪波点' },
      { no: '3.2', title: '五方向 × 情感 × 情绪矩阵' },
      { no: '3.3', title: '蹭热点的四套路' },
      { no: '3.4', title: '八大爆款元素逐一拆解' },
      { no: '3.5', title: '选题系列化 · 定量加变量' },
      { no: '3.6', title: '素材库四类三工具' },
      { no: '3.7', title: '跨领域借鉴而非盯同行' },
      { no: '3.8', title: '搭建你的 30 条选题库' },
    ],
  },
  {
    no: '第四篇 上',
    title: '文案与通用结构',
    meta: '18,000 字 · 8 节',
    desc: '无论拍什么类型，先解决留得住人的问题。',
    href: '/playbook/copywriting',
    status: '已开放',
    chapters: [
      { no: '4U.0', title: '导读 · 信息密度' },
      { no: '4U.1', title: '文案的本质是拖时间' },
      { no: '4U.2', title: '起承转合 · 四段结构与四个技巧' },
      { no: '4U.3', title: '五大开头模板 · 黄金三秒' },
      { no: '4U.4', title: '五大结构 + 小火车' },
      { no: '4U.5', title: '五大结尾模板 × 心理动作' },
      { no: '4U.6', title: '单向阀 · 前置五问拉高重视度' },
      { no: '4U.7', title: '画面感 + 力量感 + 标题封面' },
    ],
  },
  {
    no: '第四篇 下',
    title: '四型脚本',
    meta: '22,000 字 · 7 节',
    desc: '把通用结构落到四种最高产出比的脚本类型。每一型对应不同的账号阶段与变现目标。',
    href: '/playbook/scripts',
    status: '已开放',
    chapters: [
      { no: '4D.0', title: '导读 · 四型脚本与阶段匹配' },
      { no: '4D.1', title: '聊观点' },
      { no: '4D.2', title: '教知识' },
      { no: '4D.3', title: '讲故事' },
      { no: '4D.4', title: '晒过程' },
      { no: '4D.5', title: '爆款拆片技巧' },
      { no: '4D.6', title: '完成一条 3000 字脚本' },
    ],
  },
  {
    no: '第五篇',
    title: '拍摄 · 剪辑 · 表现力',
    meta: '18,000 字 · 11 节',
    desc: '把脚本变成视频。拒绝器材发烧，服务于画质、音质和信任建立。',
    href: '/playbook/craft',
    status: '已开放',
    chapters: [
      { no: '5.0', title: '导读 · 画质音质优先' },
      { no: '5.1', title: '拍摄方式四选一' },
      { no: '5.2', title: '出镜的价值' },
      { no: '5.3', title: '置景 · 流量的第一把刀' },
      { no: '5.4', title: '画质 · 音质 · 灯光' },
      { no: '5.5', title: '表现力 · 镜头脱敏' },
      { no: '5.6', title: '提词器 · 驾驶辅助系统' },
      { no: '5.7', title: '剪辑思维 · 三分拍七分剪' },
      { no: '5.8', title: '剪映十八工具速通' },
      { no: '5.9', title: 'AI 工具的边界' },
      { no: '5.10', title: '完成一条可发布视频' },
    ],
  },
  {
    no: '第六篇',
    title: '增长 · 算法 · 投放',
    meta: '18,000 字 · 10 节',
    desc: '知道平台为什么把流量给谁，数据不好时知道往哪里改。',
    href: '/playbook/growth',
    status: '已开放',
    chapters: [
      { no: '6.0', title: '导读 · 99% 是内容问题' },
      { no: '6.1', title: '抖音算法揭秘 · 识别 · 聚类 · 排序' },
      { no: '6.2', title: '完播时长三维度' },
      { no: '6.3', title: '目的垂直 · 手段多维' },
      { no: '6.4', title: '三层标签机制' },
      { no: '6.5', title: '赛马机制与铁粉机制' },
      { no: '6.6', title: '账号阶段的运营重点' },
      { no: '6.7', title: '五个反共识 "不要"' },
      { no: '6.8', title: 'DOU+ 极简公式与三种目的' },
      { no: '6.9', title: '平台规则与起号避坑' },
      { no: '6.10', title: '建立你的复盘仪表盘' },
    ],
  },
  {
    no: '第七篇',
    title: '变现与商业模式',
    meta: '18,000 字 · 11 节',
    desc: '把粉丝变成收入，拒绝先做起来再说的拖延借口。',
    href: '/playbook/monetization',
    status: '已开放',
    chapters: [
      { no: '7.0', title: '导读 · 流量没变现' },
      { no: '7.1', title: '变现四原则' },
      { no: '7.2', title: '四方式之取舍' },
      { no: '7.3', title: '修改价值排序' },
      { no: '7.4', title: '课程设计 2C/2B' },
      { no: '7.5', title: '4P 带货法则' },
      { no: '7.6', title: '引流与私域承接' },
      { no: '7.7', title: '客户分层' },
      { no: '7.8', title: '直播 16 字' },
      { no: '7.9', title: '失败模式 10 例' },
      { no: '7.10', title: '变现链路练习' },
    ],
  },
]

const EXTRA_VOLUME: Volume = {
  no: '番外卷',
  title: '行业战斗卷',
  meta: '24,000 字 · 8 节',
  desc: '不重复正卷方法论，只讲五大行业怎么把前面的方法用起来。',
  href: '/playbook/industry',
  status: '已开放',
  chapters: [
    { no: 'X.0', title: '导读 · 读案例的四个问题' },
    { no: 'X.1', title: '本地实体 · 做给街坊看' },
    { no: 'X.2', title: '专业人士 · 信任前置的受益者' },
    { no: 'X.3', title: '教育培训 · 成人买知识，家长怕损失' },
    { no: 'X.4', title: '实物零售 · 把供应链拍成流量' },
    { no: 'X.5', title: '数字产品 · 最轻的生意' },
    { no: 'X.6', title: '普通行业五步通用打法' },
    { no: 'X.7', title: '30 账号样本库练习' },
  ],
}

export default function PlaybookPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#050507] text-ink">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 0%, rgba(139,46,46,0.24), transparent 38%), radial-gradient(circle at 82% 8%, rgba(34,211,238,0.12), transparent 34%), linear-gradient(180deg, rgba(255,253,247,0.04), transparent 28%)',
        }}
      />

      <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-18 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pt-24">
        <div>
          <div className="mb-7 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#b8aa96] sm:text-[11px]">
            <span className="h-px w-7 bg-[#8b2e2e]" />
            独立方法论书站
          </div>
          <h1 className="font-serif-zh max-w-3xl text-balance text-[38px] font-semibold leading-[1.18] tracking-[0.08em] text-[#fffdf7] sm:text-[56px] lg:text-[72px]">
            百万粉博主
            <span className="mt-2 block text-[#d9c8ad]">运营方法论精炼</span>
          </h1>
          <p className="mt-7 max-w-2xl text-[15px] leading-[2] text-[#d6cfc4] sm:text-base">
            这不是一本启发你的书，而是一本今晚就能填的工作手册。围绕为什么做、做什么、写什么、怎么拍、怎么放大、怎么赚，拆成可执行的表格、清单和决策树。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#toc"
              className="inline-flex rounded-full bg-[#fffdf7] px-5 py-2.5 text-[13px] font-semibold text-[#2a241e] transition-transform hover:-translate-y-0.5 sm:text-sm"
            >
              浏览目录
            </a>
            <Link
              href="/playbook/preface"
              className="inline-flex rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-[13px] font-medium text-[#fffdf7] transition-colors hover:border-white/30 sm:text-sm"
            >
              从序言开始阅读 →
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-5 rounded-[32px] bg-[#8b2e2e]/20 blur-3xl" />
          <div className="relative border border-white/10 bg-white/[0.04] p-6 text-[#fffdf7] backdrop-blur-xl shadow-[0_28px_90px_rgba(0,0,0,0.42)] sm:p-8">
            <div className="flex justify-between border-b border-white/10 pb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#8a7e6f] sm:text-[11px]">
              <span>TABLE OF CONTENTS</span>
              <span>2026 修订版</span>
            </div>
            <div className="py-10 text-center">
              <div className="mb-5 font-mono text-[12px] uppercase tracking-[0.7em] text-[#b8aa96]">
                实战手册
              </div>
              <h2 className="font-serif-zh text-[34px] font-semibold tracking-[0.12em] text-[#fffdf7] sm:text-[44px]">
                微域生光自媒体运营实战
              </h2>
              <p className="mt-5 text-[14px] tracking-[0.18em] text-[#cfc6b8]">
                从底层逻辑到变现链路
              </p>
              <div className="mx-auto mt-7 h-0.5 w-14 bg-[#8b2e2e]" />
            </div>
            <div className="grid grid-cols-3 gap-px border border-white/10 bg-white/10">
              {STATS.map((stat) => (
                <div key={stat.label} className="bg-[#0d0d12]/80 px-3 py-5 text-center">
                  <div className="font-serif-zh text-[25px] font-semibold text-[#b8693a]">
                    {stat.value}
                  </div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-[#8a7e6f]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="toc" className="relative z-10 mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#b8aa96]">
              Catalogue
            </span>
            <h2 className="font-serif-zh mt-4 text-[28px] font-semibold tracking-[0.06em] text-[#fffdf7] sm:text-[36px]">
              正卷目录
            </h2>
          </div>
          <p className="max-w-md text-[13px] leading-[1.8] text-[#b8aa96]">
            主线遵循“为什么做 → 做什么 → 写什么 → 怎么拍 → 怎么放大 → 怎么赚”的因果链。
          </p>
        </div>

        <div className="grid gap-4">
          {VOLUMES.map((volume) => (
            <VolumeRow key={`${volume.no}-${volume.title}`} volume={volume} />
          ))}
        </div>

        <div className="mt-10">
          <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-[#b8aa96]">
            Extra Volume
          </h3>
          <VolumeRow volume={EXTRA_VOLUME} />
        </div>
      </section>

    </main>
  )
}

const VolumeRow = ({ volume }: { volume: Volume }) => {
  const content = (
    <article
      className="group border border-white/10 bg-white/[0.045] p-5 transition-colors hover:border-[#b8693a]/50 sm:p-6"
    >
      <div className="grid gap-5 lg:grid-cols-[130px_1fr_190px] lg:items-start">
        <div>
          <div className="font-mono text-[12px] font-semibold tracking-[0.18em] text-[#b8693a]">
            {volume.no}
          </div>
          <div className="mt-3 inline-flex border border-white/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#b8aa96]">
            {volume.status ?? '计划中'}
          </div>
        </div>
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4">
            <h3 className="font-serif-zh text-[22px] font-semibold tracking-[0.06em] text-[#fffdf7] sm:text-[26px]">
              {volume.title}
            </h3>
            <span className="font-mono text-[11px] tracking-[0.12em] text-[#8a7e6f]">
              {volume.meta}
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-[13.5px] leading-[1.85] text-[#cfc6b8]">
            {volume.desc}
          </p>
          <ul className="mt-5 columns-1 gap-8 sm:columns-2">
            {volume.chapters.map((chapter) => (
              <li
                key={`${volume.no}-${chapter.no}`}
                className="mb-2 break-inside-avoid text-[13px] leading-[1.75] text-[#b8aa96]"
              >
                <span className="mr-2 font-mono text-[#8a7e6f]">{chapter.no}</span>
                {chapter.title}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-start lg:justify-end">
          {volume.href ? (
            <span className="inline-flex rounded-full border border-[#b8693a]/50 px-4 py-2 text-[12px] font-medium text-[#d9c8ad] transition-colors group-hover:bg-[#8b2e2e] group-hover:text-[#fffdf7]">
              阅读本篇
            </span>
          ) : (
            <span className="inline-flex rounded-full border border-white/10 px-4 py-2 text-[12px] text-[#8a7e6f]">
              即将开放
            </span>
          )}
        </div>
      </div>
    </article>
  )

  if (!volume.href) return content

  return (
    <Link href={volume.href} className="block">
      {content}
    </Link>
  )
}
