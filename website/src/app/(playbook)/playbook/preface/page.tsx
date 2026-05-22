/* eslint-disable no-irregular-whitespace */
import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { requireMembership } from '@/features/membership/server/require-membership'

export const metadata: Metadata = {
  title: '序言 · 写在前面 · 自媒体运营实战手册',
  description:
    '这本书要解决什么、不解决什么。做对，比做多重要——带着三个问题开始阅读，把 AI × 自媒体获客的方法论真正读进去。',
  openGraph: {
    title: '序言 · 写在前面 · 自媒体运营实战手册',
    description: '三句反共识金句 · 五类读者画像 · 三种阅读路径。',
  },
}

const CHAPTERS = [
  { id: 'ch-s-0', no: 'S0', label: '前言 · 做对，不是做多' },
  { id: 'ch-s-1', no: 'S1', label: '本书写给谁' },
  { id: 'ch-s-2', no: 'S2', label: '怎么读这本书' },
]

export default async function PlaybookPrefacePage() {
  await requireMembership('/playbook/preface')
  return (
    <main className="min-h-screen overflow-x-clip bg-[#050507] text-ink">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 0%, rgba(139,46,46,0.24), transparent 38%), radial-gradient(circle at 82% 8%, rgba(34,211,238,0.10), transparent 34%), linear-gradient(180deg, rgba(255,253,247,0.04), transparent 28%)',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:grid lg:grid-cols-[200px_1fr] lg:gap-10 lg:pt-16">
        <SideRail />
        <article className="min-w-0">
          <Manuscript />
          <ChapterEndNav />
        </article>
      </div>
    </main>
  )
}

const SideRail = () => (
  <aside className="hidden lg:block">
    <div className="sticky top-24">
      <div className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#b8aa96]">
        <span className="h-px w-6 bg-[#8b2e2e]" />
        Preface
      </div>
      <div className="font-serif-zh mb-6 text-[20px] font-semibold tracking-[0.06em] text-[#fffdf7]">
        写在前面
      </div>
      <ol className="space-y-2 border-l border-white/10 pl-4">
        {CHAPTERS.map((chap) => (
          <li key={chap.id}>
            <a
              href={`#${chap.id}`}
              className="group block py-1 text-[12.5px] leading-[1.5] text-[#b8aa96] transition-colors hover:text-[#fffdf7]"
            >
              <span className="mr-2 font-mono text-[11px] text-[#b8693a]">{chap.no}</span>
              <span className="group-hover:underline group-hover:decoration-[#b8693a]/60 group-hover:underline-offset-4">
                {chap.label}
              </span>
            </a>
          </li>
        ))}
      </ol>
      <div className="mt-7 border-t border-white/10 pt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#8a7e6f]">
        预计阅读 · 12 分钟
      </div>
    </div>
  </aside>
)

const Manuscript = () => (
  <div className="relative isolate">
    <div className="flex items-baseline justify-between border-b border-white/10 pb-5 font-mono text-[10px] uppercase tracking-[0.28em] text-[#8a7e6f] sm:text-[11px]">
      <Link
        href="/playbook#toc"
        className="border-b border-dotted border-white/15 text-[#b8aa96] transition-colors hover:border-[#b8693a] hover:text-[#fffdf7]"
      >
        ← 返回目录
      </Link>
      <span className="hidden sm:inline">《微域生光自媒体运营实战》</span>
      <span>序言 · 共九篇</span>
    </div>

    <div className="mx-auto max-w-[720px] pb-20 pt-10 sm:pb-24 sm:pt-14">
      <PartCover />

      <Chapter
        id="ch-s-0"
        no="S0 · 前言"
        tag="Preface"
        title="做对，不是做多"
        lead="在按下第一次开机键之前，先承认一件事——做对一件事，胜过在错的方向上发出十条。"
        first
      >
        <p>
          打开抖音，看一眼任何一个细分行业——同样卖海鲜的、同样讲法律的、同样教英语的——你都会看到两类账号同时存在：一类粉丝几十万、咨询接不过来；另一类发了一两百条，仍然只有几百粉。
          外人看，他们拍的东西"差不多"：差不多的画质、差不多的话题、差不多的节奏。差距到底出在哪？
        </p>
        <p>
          绝大多数人会把差距归到"再多发几条""再坚持坚持"——这是最让人安心的归因，因为它意味着你只需要更勤奋。但你把那个跑出来的账号倒过来翻一遍，会发现：他们不是比别人发得更多，而是从第一条就在做<Strong>不同维度</Strong>的事——更准的方向、更准的人、更准的话术。
          差距不是"多发几条"能补上的。
        </p>
        <p>
          所以这本书想跟你聊的第一件事不是方法，是态度。
          <Strong>做对，比做多重要。</Strong>
          有一个比喻很贴切：三个人打两个人，那叫"超出"——只是力量上比对方多一点，你比同行多发几条同质内容，本质就停在这一层；
          而<Strong>激光制导对战冷兵器才叫"秒杀"</Strong>——它不是"打得更狠"，而是用一整套成熟方法论让对手根本无法回击。
          靠超出赢一两次是运气，长期赢不了；靠秒杀赢，对方甚至不知道自己输在哪里。
        </p>
        <p>
          这本书后面三百多页所有方法的目的只有一个：把你从"再发几条试试"的冷兵器厮杀里拽出来，换上一套能稳定输出、可复用、可以被同事或家人接手继续干下去的"武器系统"。如果你愿意承认这一点，我们接下来要谈的事才有意义。
        </p>

        <Insight label="本书姿态">
          这是一本"今晚就能填"的工作手册，不是一本"读完受启发"的成功学。所有章节的末尾都至少有一张可填的表格、一份可打印的清单，或者一棵可走的决策树。
          你读完一节，应当立刻知道接下来动手做什么——而不是更焦虑。
        </Insight>

        <SubHead>三句反共识金句：先把噪声关掉</SubHead>
        <p>
          在打开任何一节正文之前，先把脑子里塞满的"老师们的金句"清干净。下面这三句，是这本书反复回到的底座。看上去都很短，但每一句都会让你重写一遍自己的工作流。
        </p>

        <NumberedList
          items={[
            <>
              <Strong>没有对错，就不能称之为知识。</Strong>
              {' '}
              一个领域里，如果"老师"们彼此打架、答案完全相反，那它要么还不成熟，要么混进了大量在卖焦虑的人。短视频里大部分"经验"属于这一类。
              这本书不并列两派说法，对每一个真问题只给出一个最贴近事实的答案；如果一个问题本身是伪命题（比如"几点发最好"），就直接告诉你不必再纠结。
            </>,
            <>
              <Strong>短视频是学不会的，但短视频是练会的。</Strong>
              {' '}
              这是这些年带训反复印证的结论，也是这本书所有"练习章"存在的理由。你看完任何一节、点头说一句"懂了"，几乎一定是错觉。
              真正会的状态是：你能把这一节末尾的工具表当场填出来，并在三天内拍出一条对应的视频。不能动手的"懂了"，等同于没读。
            </>,
            <>
              <Strong>粉丝经济不是流量经济。</Strong>
              {' '}
              和流量保持顾客关系会越做越累——你必须不停拉新、不停补量；和粉丝保持信任关系才会越做越稳——同一批人会重复购买、主动转介、为你护场。
              这一区别会在第一篇底层逻辑里讲透。但请你从此刻就开始用"粉丝/信任"的角度评估你做的每一条内容，而不是用"播放量/点赞数"。
            </>,
          ]}
        />

        <SubHead>本书不解决的问题</SubHead>
        <p>
          说清楚"不做什么"，比说清楚"做什么"更重要。下面这四件事不在本书覆盖范围内——不是我们不会讲，而是讲了对你长期不利。
        </p>

        <Checklist
          items={[
            <>
              <Strong>不教情绪剧本和摆拍剧情。</Strong>
              用编造冲突、雇人吵架、剧本化"老人/外卖员/出租车司机"骗共情的内容，平台正在加速打压，且永远做不到正向变现。靠它涨起来的账号没有一个能扛过 24 个月。
            </>,
            <>
              <Strong>不教擦边、灰产、价值观取巧。</Strong>
              本书前提是：你想做的是可以坦然向家人、客户、监管交代的事业，而不是赚一波就走。任何不能写进商业计划书的玩法，我们都不教。
            </>,
            <>
              <Strong>不教数据造假与"涨粉黑科技"。</Strong>
              刷量、买粉、互赞群、虚假完播——这些东西短期把数据做好看，长期把账号画像彻底搞坏。一个账号一旦被平台贴上"非自然增长"标签，后续投流和挂车都会被压制。
            </>,
            <>
              <Strong>不教"7 天起号秘籍"。</Strong>
              起号不是秘籍，是体系。任何承诺你 7 天涨粉过万、第一条就爆的内容，本质上都是在卖给你方法论里最不重要的那一小段。本书把起号拆成"定位 → 选题 → 文案 → 拍摄 → 投放 → 变现"六个模块，少做一段都不会稳。
            </>,
          ]}
        />

        <PullQuote>
          这本书想留住的，是一个 60 岁、70 岁还能靠自己讲话的本事吃饭的人。
        </PullQuote>

        <SubHead>带着三个问题开始</SubHead>
        <p>
          请你把下面这三个问题抄到一张纸上，贴在书桌前——读完每一篇都回来对一次。它们决定你能从这本书里取走多少东西。
        </p>

        <ToolCard
          tag="工具 S0"
          title="读前三问 · 写在书桌前"
          desc="三个问题，半年内每读完一篇都重答一次。答案会变，问题不变。"
        >
          <Table
            head={['No.', '问题', '我的回答（第一次）']}
            rows={[
              ['01', '我为什么要做这件事？（是补充收入、是逃离职场、是给现有生意装上引擎、还是只是不甘心？）', '/'],
              ['02', '我有什么？（手艺、产地、实体、专业、人脉、表达力——哪几条是我比同行强的？）', '/'],
              ['03', '我愿意为这件事放弃什么？（晚上刷剧、周末饭局、短期收入、被亲戚理解……至少写出三件。）', '/'],
            ]}
            emptyCols={[2]}
          />
        </ToolCard>

        <p>
          这三个问题里，第三个是最关键的。
          <Strong>所有"什么都想要"的人最后都什么都做不深。</Strong>
          如果你愿意诚实地把"放弃清单"写出来，本书后面所有的策略选择都会变得简单——它们只是在帮你把那张放弃清单兑现而已。
        </p>
      </Chapter>

      <Chapter
        id="ch-s-1"
        no="S1"
        tag="读者画像"
        title="本书写给谁"
        lead="如果你能在下面五个人里看见自己，这本书就值得你读完。"
        first
      >
        <p>
          这本书的"第一读者"不是泛泛的"想做短视频的人"，而是有具体生意、具体手艺、具体焦虑的五类人。
          我们写每一节、每一个案例、每一张工具表，都想象着这五类人正坐在对面。
        </p>

        <SubHead>五类读者画像</SubHead>

        <NumberedList
          items={[
            <>
              <Strong>实体老板。</Strong>
              开餐饮、装修、口腔、二手车、家政、本地生活服务的，过去靠门店流量、转介、点评榜活着。
              这两年线下租金没降、获客成本却年年涨，新客越来越贵，老客越走越远。你需要的不是"做个短视频试试看"，而是把短视频当作店铺的第二个门面来设计——
              本书第七篇会教你把一条 60 秒的视频，串到"主页留电话 → 99 元钩子产品 → 高利润服务"的完整链路上。
            </>,
            <>
              <Strong>专业人士。</Strong>
              教师、律师、医师、设计师、摄影师、健身教练、心理咨询师——你的专业是你的护城河，但过去这条河只有方圆几公里的人愿意涉过来。
              你写过的报告、剪过的片子、做过的咨询，本就是别人付不起的稀缺品；本书会教你把这些"用过一次就归档"的内容，重新拆成可持续输出的选题流水线，让信任在你睡觉的时候继续建立。
            </>,
            <>
              <Strong>手艺人与产业上游。</Strong>
              开工厂、做农产品、跑批发市场、有原产地优势的——你最大的痛苦不是没有好东西，而是"好东西被中间环节吃掉了利润"。
              本书会反复讲一个事：原产地、生产工厂、实体店本身就是"6 大优势"里的硬底牌，
              用对了方法，你能把工厂直发、原产地直供这些过去只能口口相传的事实，做成可视化的信任凭据。
            </>,
            <>
              <Strong>职场转型者与中年创作者。</Strong>
              35 岁以上、积累了一行经验、开始认真考虑"下一个十年怎么过"的人。你不缺洞察、不缺表达，缺的是把这些东西兑换成可持续收入的通路。
              这本书不会鼓动你裸辞，也不会把短视频说成救命稻草——它会帮你算清楚：用业余时间做这件事，最少多久能跑出第一个变现闭环，以及在哪一步要不要全职。
            </>,
            <>
              <Strong>MCN 编导与品牌方运营。</Strong>
              你是真正的"第二读者"。和上面四类不一样，你已经在做这件事，你需要的是把过去靠手感、靠加班、靠不断试错的工作流，沉淀成可复用的模板和清单——
              这样你带新人能更快、提需求能更准、给老板的汇报能更可量化。本书所有可填表格都可以直接塞进你的工作手册里。
            </>,
          ]}
        />

        <CaseBlock title="案例 · 一位月子中心创始人的对号入座">
          <p>
            她经营着一家三线城市的月子中心，是上面五类读者里的"实体老板 + 专业人士"复合型。读这本书之前，她已经被各种"7 天爆款课"喂了两轮，账号开了 4 个全军覆没。
            她第一次跟着第一篇"入场判断书"逐题作答时，发现自己连"目标用户的具体画像"都写不出来——
            写下来才意识到，过去 4 个账号都是同一份模糊定位的不同变体。她把判断书填完、把"放弃清单"写出来，砍掉了三个号，集中做"高知妈妈月子真实日记"。
            八个月后这个号没有所谓的"爆款"，但门店新签客户里 41% 来自这个号，单店年营收增长 60%——这正是"粉丝经济"的形状。
          </p>
        </CaseBlock>

        <SubHead>不在五类里也能读，但请先问自己一句话</SubHead>
        <p>
          如果你不是上面五类人——比如你是一名学生、一名科研工作者、一名已经有几十万粉丝的成熟博主——这本书你仍然可以读，但请先问自己：
          <Strong>"我读完这本书，第一件要动手的事是什么？"</Strong>
          答得上来，再翻开第一篇；答不上来，建议先去看一遍 S2 节的三种阅读路径，挑一种最适合你的。
        </p>

        <ToolCard
          tag="工具 S1"
          title="读者自检三问表"
          desc="勾对 ≥ 2 项，强烈建议从头读；勾对 1 项，建议按问题跳读；一项都不勾，建议先回到 S0 的读前三问重答一次。"
        >
          <Checklist
            items={[
              '我有一份具体的生意、专业或手艺，目前主要靠经验/熟人/线下流量获客，且获客成本在上升',
              '我希望在 6-12 个月内，把短视频做成现有收入的"第二条腿"，而不是为了"火"',
              '我能每周稳定拿出至少 6-8 小时做这件事，且愿意为此放弃某些过去的娱乐时间',
              '我可以接受前 30-50 条视频几乎没有数据反馈，把这段时间当作练手而不是失败',
              '我不打算依赖剧情摆拍、情绪剥削或擦边内容来"快速起号"',
            ]}
          />
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-s-2"
        no="S2"
        tag="阅读指南"
        title="怎么读这本书"
        lead="读完一节就动手——这本书的设计前提是被翻烂、被画满、被抄进你的工作手册。"
        first
      >
        <p>
          这本书可以从头读到尾，也可以当工具书翻。我们提供三种阅读路径——每一种都对应一类典型读者，没有"标准答案"。但有一条原则贯穿三种路径：
          <Strong>读完任何一节，必须当天或第二天动手填一个表、拍一条视频、复盘一个号。</Strong>不动手，等同于没读。
        </p>

        <SubHead>三种阅读路径</SubHead>

        <NumberedList
          items={[
            <>
              <Strong>路径 A · 从头读（推荐用 3-4 周完成一轮）。</Strong>
              适合刚开始做、或做了但一直没起色的人。九篇正卷的顺序是按"为什么做 → 做什么 → 写什么 → 怎么拍 → 怎么放大 → 怎么赚"的因果链编排的，跳读会丢失中间的承接。
              每周读 1-2 篇，配合篇末练习产出一份"作业"，四周后你应当能拍出真正属于你的第一条 60-90 秒视频。
            </>,
            <>
              <Strong>路径 B · 按问题跳读。</Strong>
              适合已经在做、卡在某一段的人。你不必从第一篇开始——直接定位到你当下卡住的问题：
              选题想不出，去第三篇；文案留不住人，去第四篇·上；流量起来了不转化，去第七篇；数据不好不知道往哪里改，去第六篇。
              每一篇的导读都标注了"你应当能解决的具体问题"，挑那个最像你的去读。
            </>,
            <>
              <Strong>路径 C · 直接查工具。</Strong>
              适合 MCN 编导、品牌运营、培训机构讲师等需要给团队/学员用的人。本书所有工具卡片都按"工具 X.Y"统一编号，可直接定位、复制、改名、塞进自己的 SOP。
              我们建议你先翻一遍附录"工具卡片合集"，挑出 3-5 张最常用的，作为你接下来一个月给团队做培训的底稿。
            </>,
          ]}
        />

        <Insight label="一个反共识建议">
          不要"先看一遍再说"。请你在打开任何一节之前，先准备好这几样东西：一支笔、一张 A4 纸、一个手机录音备忘录、一份你现有的（或想做的）账号链接。
          没有这些东西就只读不动手，这本书对你的价值会下降一个数量级。
        </Insight>

        <SubHead>九个练习章，九件你要交出去的"作业"</SubHead>
        <p>
          这本书一共埋了九个"练习章"——每一篇正卷结束前，都有一节是要求你产出一份具体物料，而不是再讲新概念。这九份作业排成一列，就是一个完整的运营 SOP。
          下面这张表是它们的清单，你可以撕下来贴在墙上当 Checklist 用。
        </p>

        <ToolCard
          tag="工具 S2"
          title="九件作业清单 · 全书练习章对照"
          desc="读完一篇就交一份。九份全部交齐，等同于你已经独立跑通了一次从定位到变现的全链路。"
        >
          <Table
            head={['No.', '作业名', '来自', '产出物']}
            rows={[
              ['01', '入场判断书', '第一篇 · 1.7', '九题问答，决定你要不要做、能不能做'],
              ['02', '定位卡片', '第二篇 · 2.9', 'A4 一张：商业 + 内容 + 视觉锤 + 文字钉'],
              ['03', '30 条选题库', '第三篇 · 3.8', '10 常青 + 10 热点改编 + 5 故事 + 5 转化'],
              ['04', '一条 3000 字脚本', '第四篇·下 · 4D.6', '含开头/车身 4 节/结尾 + 爆款元素标注'],
              ['05', '一条可发布视频', '第五篇 · 5.10', '60-90 秒成片 + 三阶段自检表'],
              ['06', '复盘仪表盘', '第六篇 · 6.10', 'Excel 模板：指标 + 改动假设 + AB 记录'],
              ['07', '变现链路图', '第七篇 · 7.10', '流量入口 → 钩子 → 主力 → 复购全链路'],
              ['08', '30 个对标账号样本库', '番外 · X.7', '行业内最值得拆的 30 个号'],
              ['09', '个人 SOP 手册', '附录 A', '把全书 30+ 工具按你自己的工作流串成一本'],
            ]}
          />
        </ToolCard>

        <SubHead>读完之后</SubHead>
        <p>
          这本书的目的不是把你培养成一个"懂方法论的人"——懂方法论的人在中文互联网上从不稀缺。它想让你成为一个
          <Strong>"自己一个人也能从零拍到第一笔成交"的人</Strong>。九份作业交齐的那一天，你不会更焦虑，你只会安静地知道：自己接下来一周该拍什么、下一个月该测什么、半年后该把谁招进团队。
        </p>
        <p>
          专注地做点小事，慢慢来，比较快。
        </p>
      </Chapter>

      <PartEnd />
    </div>
  </div>
)

const PartCover = () => (
  <div className="mb-20 mt-4 border-b border-white/10 pb-16 text-center sm:mb-24 sm:pb-20">
    <div className="mb-7 text-[12px] tracking-[0.7em] text-[#b8aa96]" style={{ paddingLeft: '0.7em' }}>
      序　言
    </div>
    <h1 className="font-serif-zh text-[44px] font-semibold leading-[1.2] tracking-[0.14em] text-[#fffdf7] sm:text-[60px]">
      写在前面
    </h1>
    <div className="mt-6 font-mono text-[12px] tracking-[0.4em] text-[#b8693a] sm:text-[13px]">
      PREFACE　·　READ ME FIRST
    </div>
    <Ornament className="mx-auto mt-9" />
    <p className="mx-auto mt-12 max-w-[460px] text-[14.5px] leading-[2.05] tracking-[0.03em] text-[#cfc6b8] sm:text-[15px]">
      这不是一本读完受启发的书，
      <br />
      这是一本今晚就能填的工作手册。
      <br />
      带着三个问题开始阅读——
      <br />
      我为什么要做、我有什么、我愿意放弃什么。
    </p>
  </div>
)

const Ornament = ({ className = '' }: { className?: string }) => (
  <div className={`relative h-px w-20 bg-[#8b2e2e] ${className}`}>
    <span className="absolute -left-3.5 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-[#8b2e2e]" />
    <span className="absolute -right-3.5 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-[#8b2e2e]" />
  </div>
)

type ChapterProps = {
  id: string
  no: string
  tag: string
  title: string
  lead: string
  first?: boolean
  children: ReactNode
}

const Chapter = ({ id, no, tag, title, lead, children }: ChapterProps) => (
  <section
    id={id}
    className="mt-24 scroll-mt-24 border-t border-white/10 pt-16 first-of-type:mt-10 first-of-type:border-t-0 first-of-type:pt-0"
  >
    <div className="mb-5 flex items-baseline justify-between font-mono text-[10.5px] uppercase tracking-[0.35em] text-[#8a7e6f] sm:text-[11.5px]">
      <span className="font-semibold text-[#b8693a]">{no}</span>
      <span>{tag}</span>
    </div>
    <h2 className="font-serif-zh text-[26px] font-semibold leading-[1.35] tracking-[0.06em] text-[#fffdf7] sm:text-[32px]">
      {title}
    </h2>
    <p className="mb-9 mt-3 text-[14.5px] italic tracking-[0.04em] text-[#8a7e6f] sm:text-[15px]">
      {lead}
    </p>

    <div
      className="text-[15px] leading-[2.05] text-[#d6cfc4] sm:text-[15.5px] [&>p]:mb-[18px] [&>p]:text-justify"
      style={{ textJustify: 'inter-ideograph' } as unknown as React.CSSProperties}
    >
      {children}
    </div>

    <div className="mt-14 text-center text-[16px] tracking-[1em] text-white/15">·　·　·</div>
  </section>
)

const SubHead = ({ children }: { children: ReactNode }) => (
  <h3 className="font-serif-zh mb-3.5 mt-11 border-l-[3px] border-[#8b2e2e] pl-3 text-[18px] font-semibold leading-[1.4] tracking-[0.04em] text-[#fffdf7] sm:text-[19px]">
    {children}
  </h3>
)

const Strong = ({ children }: { children: ReactNode }) => (
  <strong className="font-semibold text-[#fffdf7]">{children}</strong>
)

const Insight = ({ label, children }: { label: string; children: ReactNode }) => (
  <aside className="my-7 border-l-[3px] border-[#b8693a] bg-white/[0.04] px-6 py-5 backdrop-blur-sm sm:my-8 sm:px-7">
    <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.4em] text-[#b8693a]">
      {label}
    </div>
    <div className="text-[14.5px] leading-[1.95] text-[#e7dfd4] sm:text-[15.5px]">{children}</div>
  </aside>
)

const PullQuote = ({ children }: { children: ReactNode }) => (
  <div className="font-serif-zh relative my-10 px-2 py-8 text-center text-[20px] font-semibold leading-[1.75] tracking-[0.06em] text-[#fffdf7] sm:my-12 sm:text-[24px]">
    <span className="mx-auto mb-6 block h-px w-12 bg-[#8b2e2e]" />
    {children}
    <span className="mx-auto mt-6 block h-px w-12 bg-[#8b2e2e]" />
  </div>
)

const CaseBlock = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="my-8 rounded-sm border border-white/10 bg-white/[0.035] px-6 py-6 backdrop-blur-sm sm:px-7 sm:py-7">
    <h4 className="mb-3 font-mono text-[11.5px] font-semibold uppercase tracking-[0.35em] text-[#b8693a]">
      {title}
    </h4>
    <div className="text-[14px] leading-[1.95] text-[#d6cfc4] sm:text-[15px] [&>p]:mb-[14px] [&>p:last-child]:mb-0">
      {children}
    </div>
  </div>
)

const ToolCard = ({
  tag,
  title,
  desc,
  children,
}: {
  tag: string
  title: string
  desc: string
  children: ReactNode
}) => (
  <div className="my-10 border-t border-[#8b2e2e]/70 pt-7">
    <div className="mb-3 flex flex-wrap items-baseline gap-3">
      <span className="bg-[#8b2e2e] px-2.5 py-1 font-mono text-[10.5px] font-semibold tracking-[0.35em] text-[#fffdf7]">
        {tag}
      </span>
      <h4 className="font-serif-zh text-[17px] font-semibold tracking-[0.04em] text-[#fffdf7]">
        {title}
      </h4>
    </div>
    <p className="mb-4 text-[13.5px] leading-[1.8] text-[#8a7e6f]">{desc}</p>
    {children}
  </div>
)

type TableProps = {
  head: string[]
  rows: string[][]
  fillRows?: string[][]
  emptyCols?: number[]
  scoreCols?: number[]
}

const Table = ({ head, rows, fillRows = [], emptyCols = [], scoreCols = [] }: TableProps) => (
  <div className="-mx-1 overflow-x-auto">
    <table className="w-full border-collapse text-left text-[13.5px] leading-[1.7]">
      <thead>
        <tr>
          {head.map((h) => (
            <th
              key={h}
              className="border-b border-white/10 bg-white/[0.04] px-3 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b8aa96]"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={`r-${i}`}>
            {row.map((cell, j) => {
              const isScore = scoreCols.includes(j)
              const isEmpty = emptyCols.includes(j)
              return (
                <td
                  key={`c-${i}-${j}`}
                  className={[
                    'border-b border-white/10 px-3 py-3 align-top text-[#d6cfc4]',
                    isScore
                      ? 'text-center font-semibold text-[#b8693a] [font-variant-numeric:tabular-nums]'
                      : '',
                    isEmpty ? 'italic text-[#8a7e6f]' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {cell}
                </td>
              )
            })}
          </tr>
        ))}
        {fillRows.map((row, i) => (
          <tr key={`f-${i}`} className="bg-[rgba(184,105,58,0.05)]">
            {row.map((cell, j) => (
              <td
                key={`fc-${i}-${j}`}
                className="border-b border-white/10 px-3 py-3 align-top italic text-[#8a7e6f] last:border-b-0"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const NumberedList = ({ items }: { items: ReactNode[] }) => (
  <ol className="my-6 list-none p-0">
    {items.map((item, i) => (
      <li
        key={i}
        className="relative border-b border-dotted border-white/10 py-2.5 pl-14 text-[14px] leading-[1.85] text-[#d6cfc4] sm:text-[14.5px]"
      >
        <span className="absolute left-0 top-3 font-mono text-[15px] font-semibold text-[#b8693a] [font-variant-numeric:tabular-nums]">
          {String(i + 1).padStart(2, '0')}
        </span>
        {item}
      </li>
    ))}
  </ol>
)

const Checklist = ({ items }: { items: ReactNode[] }) => (
  <ul className="my-6 list-none p-0">
    {items.map((item, i) => (
      <li
        key={i}
        className="relative py-2 pl-8 text-[14px] leading-[1.9] text-[#d6cfc4] sm:text-[14.5px]"
      >
        <span className="absolute left-0 top-[14px] block h-3.5 w-3.5 border-[1.5px] border-[#b8693a]" />
        {item}
      </li>
    ))}
  </ul>
)

const PartEnd = () => (
  <div className="mt-24 border-t border-white/10 pt-8 text-center font-mono text-[12px] uppercase tracking-[0.3em] text-[#8a7e6f] sm:text-[12.5px]">
    <div>—— 序言 完 ——</div>
    <div className="font-serif-zh mt-3 text-[13px] tracking-[0.18em] text-[#b8693a]">
      下一篇 · 第一篇 · 底层逻辑
    </div>
  </div>
)

const ChapterEndNav = () => (
  <nav className="mt-12 grid gap-3 sm:grid-cols-2">
    <Link
      href="/playbook#toc"
      className="group flex items-center justify-between border border-white/10 bg-white/[0.04] px-5 py-4 transition-colors hover:border-[#b8693a]/60 hover:bg-white/[0.07]"
    >
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#8a7e6f]">
          Previous
        </div>
        <div className="mt-1.5 font-serif-zh text-[15px] tracking-[0.06em] text-[#fffdf7]">
          ← 返回目录
        </div>
      </div>
    </Link>
    <Link
      href="/playbook/foundations"
      className="group flex items-center justify-between border border-white/10 bg-white/[0.04] px-5 py-4 transition-colors hover:border-[#b8693a]/60 hover:bg-white/[0.07]"
    >
      <div className="flex-1">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#8a7e6f]">
          Next
        </div>
        <div className="mt-1.5 font-serif-zh text-[15px] tracking-[0.06em] text-[#fffdf7]">
          第一篇 · 底层逻辑 →
        </div>
      </div>
    </Link>
  </nav>
)
