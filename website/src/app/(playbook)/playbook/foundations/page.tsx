/* eslint-disable no-irregular-whitespace */
import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { requireMembership } from '@/features/membership/server/require-membership'

export const metadata: Metadata = {
  title: '第一篇 · 底层逻辑 — 微域生光自媒体运营实战',
  description:
    '凭什么能做成。建立"对错"思维，从公理出发判断这件事值不值得做。读完，你应当能独立写出一份"入场判断书"。',
  openGraph: {
    title: '第一篇 · 底层逻辑 — 微域生光自媒体运营实战',
    description: '三条公理 · 七节展开 · 一份入场判断书。',
  },
}

const CHAPTERS = [
  { id: 'ch-1-0', no: '1.0', label: '导读 · 三条公理' },
  { id: 'ch-1-1', no: '1.1', label: '知识追求的是对错' },
  { id: 'ch-1-2', no: '1.2', label: '风口的本质是效率' },
  { id: 'ch-1-3', no: '1.3', label: '收入 = 流量 × 变现' },
  { id: 'ch-1-4', no: '1.4', label: '流量经济到粉丝经济' },
  { id: 'ch-1-5', no: '1.5', label: '短视频还能做吗' },
  { id: 'ch-1-6', no: '1.6', label: '信任前置颠覆生意' },
  { id: 'ch-1-7', no: '1.7', label: '入场判断书' },
]

export default async function PlaybookFoundationsPage() {
  await requireMembership('/playbook/foundations')
  return (
    <main className="min-h-screen overflow-x-clip bg-[#050507] text-ink">
      {/* 背景光晕，与封面页一致 */}
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
        Part Ⅰ
      </div>
      <div className="font-serif-zh mb-6 text-[20px] font-semibold tracking-[0.06em] text-[#fffdf7]">
        底层逻辑
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
        预计阅读 · 35 分钟
      </div>
    </div>
  </aside>
)

const Manuscript = () => (
  <div className="relative isolate">
    {/* 顶部刊脚 */}
    <div className="flex items-baseline justify-between border-b border-white/10 pb-5 font-mono text-[10px] uppercase tracking-[0.28em] text-[#8a7e6f] sm:text-[11px]">
      <Link
        href="/playbook#toc"
        className="border-b border-dotted border-white/15 text-[#b8aa96] transition-colors hover:border-[#b8693a] hover:text-[#fffdf7]"
      >
        ← 返回目录
      </Link>
      <span className="hidden sm:inline">《微域生光自媒体运营实战》</span>
      <span>第一篇 · 共九篇</span>
    </div>

    <div className="mx-auto max-w-[720px] pb-20 pt-10 sm:pb-24 sm:pt-14">
      <PartCover />

      <Chapter
        id="ch-1-0"
        no="1.0 · 导读"
        tag="Foundations"
        title="三条公理：别用全画幅的逻辑去和 M43 较劲"
        lead="在按下第一次开机键之前，先把判断的标尺立直。"
        first
      >
        <p>
          摄影圈有一场旷日持久的画幅之争。一边是全画幅信徒，执着于传感器面积、纯净度、光学素质；另一边是
          M43、富士、APS-C
          用户，讲究便携、防抖、对焦快。两派吵到今天也没分出胜负。但你只要走进任何一个真实拍摄现场——婚礼、街头、Vlog、直播——就会发现：决定一张照片质量的，从来不是传感器尺寸，而是这台机器有没有恰好待在该出现的位置。
        </p>
        <p>这跟自媒体的逻辑是一样的。</p>
        <p>
          很多创作者一上来就在选择"更大的画幅"——更贵的设备、更长的视频、更深的内容、更全的功能。仿佛只要参数堆得够厚，就能赢过别人。但真正决定一个账号能不能起来的，从来不是某个绝对参数，而是有没有匹配上场景。一台轻便的
          M43 放在你随身的口袋里，永远胜过那台留在防潮箱里的全画幅。
        </p>

        <Insight label="本章主张">
          做自媒体之前，先把三条公理钉在墙上。任何"我应不应该做""现在还来不来得及""到底能不能赚钱"的问题，都要回到这三条公理上求解。不在公理范围内的问题，大部分是伪命题。
        </Insight>

        <SubHead>公理一 · 好内容是稀缺品</SubHead>
        <p>
          抖音每天上传的视频以百万计，但能让你在刷到的瞬间手指停下来的，一年也没几条。流量的世界是赢家通吃的世界——平台只把推荐池里最有限的几个位置，留给最稀缺的供给。绝大多数视频不是输给了对手，是输给了"普通"两个字。如果你的内容做出来跟两年前同类账号没区别，平台没有理由把流量分给你。
        </p>
        <p>
          这意味着，你要做的不是赶上平均水平，而是越过"稀缺线"。稀缺线之下是无穷无尽的内容墓地，稀缺线之上才有阳光、雨水和复利。
        </p>

        <SubHead>公理二 · 收入 = 流量 × 变现</SubHead>
        <p>
          这是这本书里最简单也最容易被违背的公式。一个账号挣不挣钱，不取决于粉丝数，也不取决于播放量，而取决于这两项相乘之后的乘积。流量再大，如果变现路径是零，乘积仍是零；变现链路再短，如果上面没有水，管道再粗也没用。
        </p>
        <p>
          很多创作者把所有时间都投在乘号左边——研究算法、追逐爆款——却完全不思考乘号右边。结果是火了之后才发现没有产品可承接，粉丝散得比来得还快。这本书会反复回到这个公式：
          <Strong>任何选择，都要看它是在加左边、加右边，还是只在加自己的焦虑。</Strong>
        </p>

        <SubHead>公理三 · 风口的本质是效率</SubHead>
        <p>
          风口不是玄学，不是命运，不是运气。风口的本质，只是"用更短的时间或更低的成本，完成了原本要花更多时间和成本才能做成的事情"。2013
          年的打车软件是这样，2016 年的公众号是这样，2018 年的抖音也是这样。短视频之所以仍然是风口，不是因为有人喊它是风口，而是因为它至今还在以远超传统渠道的效率，把一个普通人和他要服务的人群，瞬间连接到一起。
        </p>
        <p>
          这三条公理是这一篇的脚手架。后面七节，会沿着这三条公理一一展开：为什么"养号""日更""黄金时间"这些问题大多是伪命题（公理一）、为什么生意和账号都该被同一公式拆解（公理二）、为什么短视频还能做、为什么是抖音（公理三）。读完，你就有了判断"自己要不要进场"的工具。
        </p>
      </Chapter>

      <Chapter
        id="ch-1-1"
        no="1.1"
        tag="真伪命题"
        title="知识追求的是对错，不是数量"
        lead={'学十条没有标准答案的"经验"，不如学一条有标准答案的"对错"。'}
        first
      >
        <p>
          很多人做不好账号，不是因为方法学得太少，而是因为方法学得太杂。学完张老师再去学李老师，学完李老师又被某直播间一句话拐弯，最后脑子里塞着五十条相互冲突的"经验"，一动手就互相打架。
        </p>
        <p>
          知识和经验有一个根本区别。经验是"我这么干成了"，知识是"在这个变量范围内，这么干一定成、那么干一定败"。经验是关于"我"，知识是关于"对错"。一个领域如果只能讲经验，讲不清对错，这个领域要么还没成熟，要么混进太多自媒体老师在卖焦虑。
        </p>

        <PullQuote>没有对错，就不能称之为知识。</PullQuote>

        <p>
          自媒体这件事，绝大部分问题其实是有标准答案的。只是这些答案多半反共识，听上去不性感、不像一门可以反复卖的课。下面这八条，是抖音流量逻辑里被反复印证的真命题或伪命题。看看你过去半年纠结过几条。
        </p>

        <SubHead>八个被反复纠结的伪命题</SubHead>

        <NumberedFalseList
          items={[
            {
              title: '要不要养号？',
              verdict: '伪命题。',
              body: '抖音不识别"新号老号"，只识别"内容好坏"。养号的本质，是用低质量内容给账号打了一堆"我是低质号"的标签。真要做的事，是第一条就把你最好的内容发出来，让算法尽快给你贴上"高质量"标签。',
            },
            {
              title: '几点发最好？',
              verdict: '伪命题。',
              body: '平台的推荐机制是"先小流量池测，再逐级放大"，不是"看哪个时段在线人多就给谁"。一条好内容什么时候发都会被推，一条普通内容选什么时段都救不回来。把研究黄金时段的精力，放回到内容本身上。',
            },
            {
              title: '要不要日更？',
              verdict: '伪命题。',
              body: '日更不是变量，信息密度才是。一周发两条高密度的视频，远比一天发三条注水的视频更涨粉。日更只对一种人有意义：刚开始练习的人，需要靠数量打磨手感。一旦手感成型，频次要服务于质量而不是相反。',
            },
            {
              title: '要不要垂直？',
              verdict: '这是个被错误简化的真命题。',
              body: '正确的版本是：目的垂直，手段多维。账号要解决一类问题（目的层垂直），但不必每条视频都长得一样——你可以一会儿讲、一会儿演、一会儿测评（执行层多维）。简单粗暴的"内容垂直"会把账号做成新闻联播，看着像专业，实际上没人爱看。',
            },
            {
              title: '第一条不爆怎么办？',
              verdict: '伪命题。',
              body: '第一条本来就不应该指望爆，第三十条也未必。爆款是概率事件，你能做的是把每一条都做到自己当前能力的上限，让概率分布的整体往右移。盯着第一条问"为什么没爆"，是在用赌博的逻辑做内容。',
            },
            {
              title: '我是不是被限流了？',
              verdict: '99% 的情况下不是。',
              body: '"限流"是创作者最方便的甩锅词。真要复盘，先看自己有没有违规、有没有搬运、有没有挂违禁词，然后再看选题、开头、密度。把"限流"当万能解释，等于堵死了所有可改进的方向。',
            },
            {
              title: '标题封面是不是关键？',
              verdict: '半真。',
              body: '它是必要条件，不是充分条件。一个差标题封面会让好内容白做，但一个好标题封面救不了差内容。标题封面解决的是"点进来"，留存和复播解决的是"看下去"，两者一起决定流量分发。',
            },
            {
              title: '要不要追热点？',
              verdict: '这是个有条件的真命题。',
              body: '追热点的前提是：这个热点和你账号的目的有承接关系。否则你只是在借别人的车给陌生人导航，流量来得快走得也快。',
            },
          ]}
        />

        <CaseBlock title="案例 · 一个英语老师的伪命题清单">
          <p>
            一个英语老师做账号三个月，粉丝七百。她做的事情包括：每天问后台"今天最佳发布时间"、不停切换头像、看到爆款就立刻模仿、研究"养号七天"的攻略、给视频加
            50
            个标签。这些动作都消耗了她大量精力，但没有一个动作是在乘号的左右两边——左边是"对谁说什么内容"，右边是"她有什么可卖的"。她把这些伪命题一笔勾掉，只做一件事：每周拍两条"上班族张口就忘的英语"。两个月后，第一条评论区里第一次出现"终于有适合下班路上听的"这种具体反馈，主页咨询从零开始往上走——爆款没有立刻来，但账号第一次开始有"自己的人"了。
          </p>
        </CaseBlock>

        <ToolCard tag="工具 1.1" title="真伪命题速查表" desc='把你过去半年纠结过的问题列出来，逐项对照判断。"伪"的划掉、"真"的留下、"半真"的写明前提条件。'>
          <Table
            head={['纠结过的问题', '判断', '正确版本']}
            rows={[
              ['要不要先养号七天', '伪', '第一条就发你最好的'],
              ['几点发数据好', '伪', '选题与开头决定一切'],
              ['是不是要日更', '伪', '密度优先于频次'],
              ['要不要内容垂直', '半真', '目的垂直 + 手段多维'],
              ['第一条没爆是不是不行', '伪', '看 30 条移动平均'],
              ['是不是被限流了', '伪', '先查违规与内容退化'],
              ['标题封面是不是最重要', '半真', '解决点进，不解决看下去'],
              ['要不要追这个热点', '半真', '看是否服务账号目的'],
            ]}
            fillRows={[
              ['（写下你自己纠结过的问题）', '/', '/'],
              ['（继续写）', '/', '/'],
            ]}
          />
        </ToolCard>

        <p>
          整张表填完，你会发现一个规律：绝大多数让你焦虑的问题，其实根本不是问题。真问题是少数，而且都指向同一件事——内容本身。把伪命题划掉之后，你的工作量会立即下降一大半，剩下的事情虽然难，但每一件都"值得"。
        </p>
      </Chapter>

      <Chapter
        id="ch-1-2"
        no="1.2"
        tag="风口三要素"
        title="风口的本质是效率"
        lead="不是有人喊出来叫风口，而是它把同一件事的成本和时间降了一个数量级。"
        first
      >
        <p>
          "风口"这个词被滥用了。最近十年，几乎每隔半年就有一个"新风口"被喊出来：O2O、共享经济、社区团购、元宇宙、AI、机器人……人们在每一个新概念出来时都焦虑一次，然后赶上一波尾巴，最后总结一句"我又错过了"。
        </p>
        <p>
          但如果你回头看真正跑出来的风口——2013 年的打车软件、2014 年的电商直播、2016 年的公众号、2018
          年的抖音——它们的共同点不是"被喊得最响"，而是把"原本要花很多时间和成本才能做成的事情"，用一种新方式压到了一个数量级以下。
        </p>

        <CaseBlock title="案例 · 打车软件如何成为风口">
          <p>
            打车软件普及之前，下班高峰在路边挥手十几分钟拦不到一辆出租车是常态；软件普及之后，从下单到上车被压到几分钟。这种"完成同一件事所需时间砍掉一个数量级"的体感差，才是它成为风口的真正原因。补贴大战只是加速器，效率差才是底层。一项技术如果不能在某个关键场景上把成本或时间压低一个数量级，它就不会成为风口，只会成为另一个"明天就会过气的概念"。
          </p>
        </CaseBlock>

        <SubHead>风口三要素：人多 · 时间多 · 连接快</SubHead>

        <p>
          判断一件事是不是风口，有三条判据。第一，这件事服务的人是不是足够多，而且还在持续增长。第二，这群人每天愿意花在上面的时间是不是足够多，而且还在持续增长。第三，创作者/商家到用户之间的连接，有没有比上一代渠道高出一个数量级的效率。三条同时满足，才叫风口；只满足两条，顶多是个细分机会；一条都不满足的，基本是概念。
        </p>
        <p>把这三条放进短视频里看一遍。</p>
        <p>
          <Strong>第一条，人多。</Strong>抖音 2018 年首次公开日活时是 1.5 亿，2020 年公开口径已经突破 6
          亿，此后官方没有再披露新的 DAU 数字，但用户基数仍在涨。这种密度是任何传统媒介都无法企及的：报纸日发行量过百万就是头部，电视台王牌节目收视率破
          5% 就是奇迹，而抖音平台上，一个普通账号触达百万播放并不罕见。
        </p>
        <p>
          <Strong>第二条，时间多。</Strong>不只是用户基数大，每个用户愿意在产品里花的时间也长。多家第三方机构的统计里，抖音单 app
          人均日使用时长稳定在
          100 分钟以上。这意味着，你做的每一条视频，都在抢夺一段已经存在、并且越来越长的注意力池子，而不是从用户原本干别的事情的时间里挤出来。
        </p>
        <p>
          <Strong>第三条，连接快。</Strong>这是最关键也最被低估的一条。在传统渠道里，一个口腔诊所要让方圆 5
          公里的潜在客户认识自己，要做地推、要投电梯广告、要发传单、要等几个月口碑沉淀。而在抖音上，一条好的内容，可以在几天内让这 5
          公里内大量打开过短视频的人，都看到这位医生本人在认真讲一个口腔知识。从"陌生"到"建立基本认知"的连接时间，从数周降到数天甚至数小时。
        </p>

        <Insight label="反共识结论">
          风口不是"机会的存量"，而是"效率的差值"。当你看到一项技术让某件事的效率提升了 5 倍以上，你就该立刻进场；反过来，任何不能用具体效率提升数字来描述的"风口"，大概率都是泡沫词。
        </Insight>

        <SubHead>短视频还远没有结束</SubHead>
        <p>
          有人会问："现在不晚吗？好赛道是不是早就被人占完了？"这个问题本身就站在错误的前提上。短视频不是一个"位置数量有限的赛道"，它是一个"内容供给永远不够的池子"。只要平台日活仍在涨、用户使用时长仍在涨、平台仍要分发出去更多内容来填满推荐流——它就需要不断地找到新供给。新供给从哪儿来？要么从老账号的转型，要么从新人。
        </p>
        <p>
          更关键的是，目前平台上的内容供给质量，<Strong>平均水平依然非常低</Strong>。大部分账号没有定位、没有结构、没有信任证据，完全是"想到啥拍啥"。这就是为什么任何一个认真做内容的人，只要踩准方法，半年内做到几万粉丝并不困难。市场远未饱和，饱和的只是看上去的"账号数量"。
        </p>

        <ToolCard
          tag="工具 1.2"
          title="风口三要素自检表"
          desc="把你正在考虑的赛道/平台/方向填进左侧，用三要素逐项打分（1-5）。三项总分 ≥ 12 才算真风口。"
        >
          <Table
            head={['候选方向', '① 人多吗', '② 时间多吗', '③ 连接是否更快', '总分']}
            rows={[
              ['抖音（参考）', '5', '5', '5', '15'],
              ['视频号（参考）', '5', '3', '4', '12'],
              ['小红书（参考）', '4', '4', '4', '12'],
            ]}
            scoreCols={[1, 2, 3, 4]}
            fillRows={[
              ['（写下你考虑进入的方向）', '/', '/', '/', '/'],
              ['（继续写）', '/', '/', '/', '/'],
            ]}
          />
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-1-3"
        no="1.3"
        tag="底层公式"
        title="收入 = 流量 × 变现"
        lead="同一个公式，可以拆解二手车场、律师所和水果摊。也可以拆解你的账号。"
        first
      >
        <p>如果整本书只允许保留一个公式，我会留下这个：</p>

        <PullQuote>收入　=　流量　×　变现</PullQuote>

        <p>
          这个公式简单到几乎像废话，但它是这本书所有结论的源头。每一个章节的方法、每一份工具表格、每一条策略选择，都可以追溯回这个公式的两端之一。当你对某个动作不确定值不值得做，就回到这个公式问一句："这一步，加的是乘号左边还是右边？"
        </p>

        <SubHead>同一个公式，三个生意</SubHead>
        <p>看上去毫不相干的三个生意，本质上跑的是同一套公式。</p>

        <CaseBlock title="案例 · 二手车场 / 律师所 / 水果摊">
          <p>
            <Strong>二手车场。</Strong>月收入 = 月进店人数 × 成交率 ×
            单台毛利。三个变量任何一个为零，整体为零。一家车场要么扩进店（开多个网点、投信息流广告、做内容），要么提成交率（车况透明、价格透明、销售技巧），要么提毛利（改卖更贵的车型）。三种动作没有谁更高级，只看哪一项是当前的瓶颈。
          </p>
          <p>
            <Strong>律师所。</Strong>月收入 = 咨询量 × 成单率 ×
            客单价。同样三个变量。律师所的瓶颈通常在咨询量（没人知道你），所以做短视频是最高杠杆的动作；一旦咨询量起来了，瓶颈会自动转向成单率（专业能力是否过硬）和客单价（是否能切高净值案件）。
          </p>
          <p>
            <Strong>水果摊。</Strong>日收入 = 路过人数 × 进店率 × 客单价 ×
            复购率。这个公式多了一项复购率，因为水果是高频消费。水果摊老板能做的事，无非是改店招（进店率）、改陈列（客单价）、做会员（复购率），或者干脆换个人流多的位置（路过人数）。
          </p>
        </CaseBlock>

        <p>
          三个看似毫无关联的生意，被同一个公式拆解后，你会发现它们的本质决策只有几种：
          <Strong>改流量入口 · 改转化率 · 改客单价 · 改复购</Strong>。任何一个生意，任何一个账号，任何一条产品线，都只能在这几个维度上动手。
        </p>

        <SubHead>为什么是乘法，不是加法</SubHead>
        <p>这一点是公式的灵魂。乘号有两个性质，会让很多创作者意识到自己之前在做无用功。</p>
        <p>
          <Strong>第一，任意一项为零，整体为零。</Strong>这是"乘"和"加"的根本区别。加法允许补强：一项不行，可以靠另一项弥补；乘法不允许：只要有一项归零，前面的所有努力归零。一个百万粉账号如果没有任何变现产品，流量这一项再大，乘出来还是零。一个有完整产品线的实体店如果没有人知道，产品再好，乘出来也是零。所以"先做起来再说"是一种危险的策略——你永远不知道"先做"的那一项，会不会让你忽视了乘号另一边的存在。
        </p>
        <p>
          <Strong>第二，任何一项的提升，都是百倍千倍地放大整体。</Strong>这也是乘号性质决定的：把流量提升 2 倍 + 把变现提升 2 倍 = 整体提升 4 倍，而不是 2 倍。这就是为什么"两边一起做"的人，会用 1/4 的时间走过别人 1 倍的距离。
        </p>

        <Insight label="推论">
          不要孤立优化任何一边。在任何阶段，都要问自己：乘号的另一边今天能不能也往前挪一格？哪怕只是写下一份产品备选清单、跟一个潜在客户简单聊一次，都比单方面优化流量更有价值。
        </Insight>

        <SubHead>这本书的章节，就是这个公式的展开</SubHead>
        <p>
          这本书剩下的所有章节，本质上都在做两件事：一件是把乘号左边的"流量"拆得更细——选题、文案、脚本、拍摄、剪辑、算法、投放——这些都是为了把流量做大、做精、做稳。另一件是把乘号右边的"变现"拆得更细——定位、信任、私域、产品、直播、销售——这些都是为了把粉丝变成收入。
        </p>
        <p>
          当你下一次再看到一个新方法、新工具、新概念，不必先判断"它好不好"，只需要问一句："它加的是乘号哪边？"答上来了，这个方法对你才有意义；答不上来，大概率是噪音。
        </p>

        <ToolCard
          tag="工具 1.3"
          title="现有生意拆解表"
          desc="把你正在做的生意（或想做的生意）套进这张表。先标出当前瓶颈，再决定下一步该往乘号哪边动。"
        >
          <Table
            head={['变量', '当前数值', '是否为瓶颈', '提升手段']}
            rows={[
              ['流量（月进店/月触达/月曝光）', '/', '是 / 否', '短视频引流 / 投流 / 矩阵'],
              ['转化率（成单率 / 进店率）', '/', '是 / 否', '优化主页 / 信任证据 / 价格策略'],
              ['客单价', '/', '是 / 否', '产品分层 / 套餐设计 / 升级品类'],
              ['复购率（若适用）', '/', '是 / 否', '私域沉淀 / 会员体系 / 周期提醒'],
            ]}
            emptyCols={[1, 2, 3]}
          />
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-1-4"
        no="1.4"
        tag="三种经济"
        title="从流量经济到粉丝经济"
        lead="和流量保持顾客关系，只会越做越累；变成粉丝关系，封号都不怕。"
        first
      >
        <p>
          一个常被忽视的事实：同样是"做内容"、同样是"涨粉"、同样是"接广告/卖货"，有人三年越做越累、利润越摊越薄，有人三年越做越稳、单价反复涨。差别不在勤奋，在于他们其实站在两种不同的经济模式里——只是大多数人没察觉。
        </p>

        <SubHead>三种经济：流量 / 粉丝 / 品牌</SubHead>

        <TripleGrid
          cols={[
            {
              variant: 'flow',
              title: '流量经济',
              body:
                '本质是"广告位生意"。你向平台买流量、把流量卖给广告主或商家。每天的内容都是为了换下一波曝光。和用户的关系是顾客关系——人不认识你，只是恰好被算法推过来。',
            },
            {
              variant: 'fan',
              title: '粉丝经济',
              body:
                '本质是"信任生意"。你和用户之间不再以单次成交结束，而是建立长期跟随关系。用户买的不是这个产品，是"你"。换平台、换品类、甚至封号重启，粉丝都会跟你走。',
            },
            {
              variant: 'brand',
              title: '品牌经济',
              body:
                '本质是"心智资产生意"。你不再依赖个人，而是建立独立于个人之外的认知资产。这需要资本、团队、长时间投入。绝大多数个人/小生意先到不了这一层。',
            },
          ]}
        />

        <p>
          三种经济在短期内看不出区别——都在做内容、都在涨粉、都在卖东西。但拉长到 3
          年看，差距巨大。流量经济的玩家，每一次新爆款都意味着重新拉新一次，生意像跑步机；粉丝经济的玩家，每一次新作品都在加深存量信任，生意像滚雪球。
        </p>

        <PullQuote>
          你跟流量的关系是顾客关系，就只会越来越难；
          <br />
          是粉丝关系，就封号都不怕。
        </PullQuote>

        <SubHead>为什么大部分人困在流量经济里</SubHead>
        <p>第一，流量经济离短期收益最近。一条爆款视频带一波佣金，一次直播间发一波链接，看上去钱来得很快。但这种钱的逻辑是"今天有热搜就有，明天没热搜就没"。</p>
        <p>第二，流量经济不需要建立人设。不出镜、不留名字、不需要长期一致的价值主张，只要素材剪得好、踩得准热点，就能跑。这种零门槛，反过来意味着零壁垒——任何一个新入场的人，都能立刻复制你的玩法。</p>
        <p>第三，流量经济的玩家通常不知道自己卡在哪里。他们以为只要内容再做得好一点、流量再大一点，就能突破。但他们没意识到，问题不是"流量不够大"，而是"流量和自己没有关系"。</p>

        <SubHead>从流量到粉丝，有三个开关</SubHead>
        <p>从流量经济升级到粉丝经济，不是涨粉量决定的，而是三个开关决定的。</p>

        <p>
          <Strong>开关一，人格化。</Strong>账号必须有一个清晰的"人"。这个人有名字、有外形、有性格、有可以被记住的口头禅或视觉符号。哪怕不出镜，也要有"主理人"的存在感。一个不被记住具体是谁的账号，永远停在流量经济。
        </p>
        <p>
          <Strong>开关二，主张化。</Strong>这个人必须为某个具体主张持续发声。不是"今天讲这个、明天讲那个"，而是一以贯之地表达：你认为什么是对的、什么是错的、什么是好的、什么是该避免的。主张越鲜明，认同你的人越精准。
        </p>
        <p>
          <Strong>开关三，承诺化。</Strong>用户能在你这里得到什么具体承诺？是"教会职场人开口说英语"，还是"帮中小餐饮老板把堂食搞起来"，还是"陪你三十天减脂"？承诺越具体，粉丝跟随的理由越扎实。
        </p>

        <CaseBlock title="案例 · 东方甄选直播间为什么扛得住价格质疑">
          <p>
            2022 年东方甄选从教培转型做直播带货时，因为一些农产品定价高于网上同款被一片质疑——同样是袋装大米、同样是几根玉米，凭什么贵这么多？按"流量经济"的逻辑，价格不透明就该被比价比死。但他们的销量并没有掉，反而把直播间的关注度推到了顶点。原因是用户在直播间里听到的，不是单纯的"九块九包邮"，而是
            "为什么这个农户能卖这个价、链路里每一段被谁拿走多少、品控是怎么把的"。粉丝买的从来不是商品，是"愿意把这件事讲清楚的那个人"。流量经济里，价格透明意味着比价；粉丝经济里，价格只是信任的注脚。
          </p>
        </CaseBlock>

        <p>
          这并不意味着粉丝经济就可以漫天要价。粉丝经济的核心是"你给的价值，他相信你给的就值"。一旦你滥用这种信任——卖明显不值的、推自己不用的、为了佣金推坏的——粉丝会比顾客更快地离开，而且不会再回来。
        </p>

        <ToolCard tag="工具 1.4" title="三种经济判定决策树" desc="回答下面四个问题，判断你现在/将来要做的是哪一种经济。">
          <NumberedList
            items={[
              '如果今晚平台把你的账号封了，你的客户还能找到你吗？——找不到 ⇒ 流量经济。能在私域/微信群里联系到 ⇒ 已踏入粉丝经济。',
              '用户买你东西的时候，记得你是"谁"还是"这个号"？——记得号 ⇒ 流量经济。记得人 ⇒ 粉丝经济。',
              '把你的爆款选题给同行，他们能不能复制？——能 ⇒ 流量经济。不能（必须由你这个人讲才有味道）⇒ 粉丝经济。',
              '你现在的收入，主要来自一次性成交还是回头复购/续费？——一次性 ⇒ 流量经济。回头/续费 ⇒ 粉丝经济。',
            ]}
          />
          <p className="mt-4 text-[13.5px] leading-[1.85] text-[#5a4f44]">
            4 条全部偏向粉丝侧 ⇒ 你已在粉丝经济。混合 ⇒ 在过渡中。全部偏向流量侧 ⇒ 短期赚得快，长期会越做越累，该尽快设计三个开关。
          </p>
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-1-5"
        no="1.5"
        tag="赛道与平台"
        title="短视频还能不能做 · 为什么是抖音"
        lead="现在不晚，因为大部分人仍然毫无章法。"
        first
      >
        <p>"短视频还能不能做"是这本书出现得最频繁的问题。问的人通常有两种心态：一种是真的拿不准，想要一个客观判断；另一种是已经下定决心不做，只是想找个理由确认自己的选择。下面是给前者的答案。</p>

        <SubHead>两个反共识结论</SubHead>

        <p>
          <Strong>第一，现在不晚。</Strong>判断"是否还能做"的尺度，不是"赛道里已经有多少账号"，而是"赛道里有多少账号在认真做"。前者是一个唬人的总量，后者才是真正的竞争密度。在抖音上，一个细分领域的账号数量看上去可能是几万、几十万，但
          95% 都没有清晰定位、没有内容结构、没有信任证据、没有产品线。剩下那 5% 才是你的真对手。和 5% 比，5 千人的赛道竞争密度，等同于 500 万人赛道的看似拥挤。
        </p>
        <p>
          <Strong>第二，大部分人仍然毫无章法。</Strong>这本书不是给"已经做了三年的高手"看的，这本书是给"和刚才那 95%
          没有章法的人，处在同一起点"的你看的。你需要做的事，不是和那些已经卷到红海的头部死磕，而是只要比"普通水平"高出一截，就能脱颖而出。普通水平有多低？低到不可置信。这正是你的机会。
        </p>

        <Insight label="反共识结论">
          判断"是否晚了"的不是赛道账号总数，而是认真账号的密度。大部分赛道的"认真竞争密度"，在 2026 年仍然小于 2020 年的杂乱密度。
        </Insight>

        <SubHead>五平台四维评分</SubHead>
        <p>给"做哪个平台"一个客观对比，需要四个维度：流量（总量与活跃度）、变现（变现路径的丰富度与短径）、制度（平台对创作者的友好度与稳定性）、趋势（平台未来 2-3 年是否还在涨）。下面是对当前主流五大平台的四维评分。</p>

        <PlatformsTable
          rows={[
            { name: '抖音', s: [5, 5, 4, 4], total: 18, fit: '绝大多数行业、想要快速测试的人' },
            { name: '视频号', s: [4, 4, 4, 5], total: 17, fit: '偏中老年人群、私域已有沉淀' },
            { name: '小红书', s: [4, 3, 4, 4], total: 15, fit: '女性消费品、医美、本地服务' },
            { name: '快手', s: [4, 4, 3, 3], total: 14, fit: '下沉市场、农产品、本地实体' },
            { name: 'B 站', s: [3, 2, 5, 3], total: 13, fit: '知识深耕、文化创意、长线品牌' },
          ]}
        />

        <p>
          抖音综合分最高，这并不意味着它适合所有人，只意味着它是"上限最高、试错最快"的起跑平台。对于第一次做账号、还没找准方向的人，先在抖音上跑出最小可用版本，然后再向其他平台迁移，是最稳的路径。
        </p>

        <SubHead>为什么尤其是抖音</SubHead>
        <p>第一，抖音的算法是 "去中心化推荐"，对新账号最友好。一个零粉账号发的第一条内容，只要 EDU/选题/完播过关，平台就会立刻给一个小流量池测试，然后逐级放大。这意味着零基础也有公平起跑权。其他平台或多或少都依赖关注关系和粉丝量。</p>
        <p>第二，抖音的变现工具最齐全。橱窗、小店、直播、达人广场、本地推、巨量千川、抖音搜索、星图——所有的变现路径几乎都内置在平台内部，链路最短。你不需要把粉丝引到外部去成交，平台直接把成交在内部完成。</p>
        <p>第三，抖音的内容形态最多元。短视频、中视频、直播、图文笔记、合集、专题——同一个账号可以在不同形态间灵活切换。这给"目的垂直 + 手段多维"的策略提供了执行空间。</p>

        <ToolCard
          tag="工具 1.5"
          title="平台四维评分表（可填空）"
          desc="把你考虑的几个平台填进去，结合自己生意的特点重新打分。同一个平台，不同行业的得分可能完全不同。"
        >
          <Table
            head={['平台', '流量（对你）', '变现（对你）', '制度', '趋势', '合计']}
            rows={[]}
            fillRows={[
              ['/', '/', '/', '/', '/', '/'],
              ['/', '/', '/', '/', '/', '/'],
              ['/', '/', '/', '/', '/', '/'],
            ]}
          />
          <p className="mt-3 text-[13px] leading-[1.85] text-[#8a7e6f]">
            填表注意事项：1) 流量这一项不是看平台日活总量，而是看其中"你的目标用户"密度。2) 变现这一项要看平台对你这个行业的变现路径是否完整（本地、知识、电商各异）。
          </p>
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-1-6"
        no="1.6"
        tag="颠覆性"
        title="信任前置：颠覆传统生意的真正杠杆"
        lead="在他想花钱之前，他已经认识了你。"
        first
      >
        <p>
          前面几节都在讲"为什么短视频值得做"，这一节讲一件被绝大多数人低估的事：
          <Strong>短视频对传统生意的真正颠覆，不在于它带来了新流量，而在于它彻底改变了"信任发生的时间点"。</Strong>
        </p>

        <SubHead>传统生意是信任后置</SubHead>
        <p>看一下任何一个传统行业的标准购买路径。</p>

        <CaseBlock title="场景 · 一个老人买套养老房">
          <p>想象一个常见场景。一个 60 岁的男人想买套房养老。他先在 58 同城上随便看几个房源，然后走进一家中介店面。中介给他倒了杯水，问他什么需求。两个人聊了 10 分钟，中介开始给他推几套盘。第三天，他跟中介一起去看了两套房。第五天，中介又给他打电话，说有新盘上线。一个月之后，他终于下定决心买了一套，中介拿了 1% 的佣金。</p>
          <p>这个过程里，这位老人对中介本人的信任，是在交易开始之后才慢慢建立起来的。他第一次走进店面的时候，对眼前这个中介一无所知——这就是"信任后置"。中介所有的本事，都用在了"成交开始之后"建立信任。这种模式，意味着每一次新客户都要从零开始建立信任，效率永远很低。</p>
        </CaseBlock>

        <p>传统行业的所有获客方式，都是"信任后置"的逻辑。门店——人先走进来才接触你；广告——投出去希望有人记住，但记住的只是商品而不是你这个人；熟人推荐——别人的信任借给你用一次，但每一次都消耗别人的信用。</p>

        <SubHead>短视频颠覆的是信任顺序</SubHead>
        <p>如果一个中介坚持发了一年短视频，讲什么是好户型、什么是雷区学区、什么样的开发商不能选、二手房怎么砍价、装修怎么避坑——那个 60 岁老人在打开抖音的某天晚上刷到了他，觉得这个人讲得对，关注了。三个月之后，老人想买房，第一个想起来的不是 58 同城，而是这个中介。他主动加微信、主动约看房、主动按照对方推荐的标准看了几套——交易开始之前，信任已经满满。</p>
        <p>这就是"信任前置"。</p>

        <PullQuote>在他想花钱之前，他已经认识了你。</PullQuote>

        <p>这个顺序的改变带来的不是"快一点慢一点"的效率差，而是整个生意结构的重组。信任前置的生意里：</p>

        <Checklist
          items={[
            '不需要催单——客户来找你的时候，已经做好了决策。',
            '不需要砍价——客户认的是你这个人，价格只是"信任的注脚"。',
            '不需要重新教育——你在视频里已经讲过的逻辑，客户已经接受了。',
            '转介绍率高——客户会主动把"他认识的某某"推荐给身边的人。',
            '客单价高——同样的产品，信任前置的成交客单可以是信任后置的 2-5 倍。',
          ]}
        />

        <p>这是为什么实体老板、专业人士、手艺人是最适合做自媒体的人群——他们手里已经有成熟的产品和服务，缺的只是"在客户走进店里之前，先在客户脑海里建立信任"这一步。</p>

        <SubHead>三类生意，三种信任前置打法</SubHead>
        <p>
          <Strong>本地实体老板。</Strong>核心策略是"在 5 公里内被认识"。内容上讲门店的真实运营——后厨、选品、服务、过程。变现路径短：看完视频→直接到店/直接团购。
        </p>
        <p>
          <Strong>专业人士。</Strong>核心策略是"在搜索某类问题时被想起"。内容上讲专业判断——什么情况该怎么处理、什么坑要避开。变现路径中：看完视频→咨询/课程/上门服务。
        </p>
        <p>
          <Strong>实物零售/电商。</Strong>核心策略是"在购买某品类时被信任"。内容上讲选品逻辑——为什么选这个、对比什么、什么人适合。变现路径短：看完视频→点橱窗→下单。
        </p>

        <p>
          这三种生意都有同一个特征：<Strong>产品和服务都不缺，缺的是"被认识"这一步。</Strong>短视频不是另开一条赛道，是把原本就有的赛道，加了一个前置环节。
        </p>

        <ToolCard tag="工具 1.6" title="信任前置度自评表" desc='用四个问题判断你的生意是不是该做信任前置。回答"是"的越多，信任前置的杠杆越大。'>
          <Table
            head={['问题', '是/否', '含义']}
            rows={[
              ['你的客户在买单之前，通常需要先建立对你或品牌的信任吗？', '/', '信任决定成交'],
              ['你的产品/服务，客单价是否高到客户不会冲动消费？', '/', '高客单需信任'],
              ['同行的差异，主要靠"专业判断"而不是"产品本身"？', '/', '专业即护城河'],
              ['客户在购买前，通常会进行长时间的搜索和对比？', '/', '信息高度不对称'],
            ]}
            emptyCols={[1]}
          />
          <p className="mt-3 text-[13px] leading-[1.85] text-[#8a7e6f]">
            4 个全是 ⇒ 你属于信任前置杠杆最大的群体，本书内容对你回报极高；3 个是 ⇒ 强烈值得做；1-2 个是 ⇒ 可做，但变现链路要重新设计；0 个是 ⇒ 你可能更适合纯电商而非个人 IP。
          </p>
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-1-7"
        no="1.7"
        tag="本篇练习"
        title="本篇练习 · 写下你的入场判断书"
        lead="读到这里，你应该已经能回答九个问题。回答得越具体，后面越省力。"
        first
      >
        <p>
          前六节给了你六组工具：伪命题速查表（1.1）、风口三要素（1.2）、生意拆解公式（1.3）、三种经济决策树（1.4）、平台四维评分（1.5）、信任前置度自评（1.6）。这一节不再增加新方法，而是把这六组工具收口为一份
          <Strong>入场判断书</Strong>——你正式动手前，应该写在第一页的那份判断。
        </p>
        <p>
          这份判断书不需要漂亮，也不需要给别人看。它只是你给自己签的一张合同：
          <Strong>我清楚我为什么要做、我能做、值得做、能赢、能赚、能赚到何时。</Strong>写得越具体，后面遇到困难时撑得越久。写得越空，遇到第一次低播放就动摇。
        </p>

        <SubHead>九个问题</SubHead>
        <p>每一题对应前面一个或多个工具。请把每题的答案写在一张 A4 纸上，纸的顶部写日期，纸的底部留出三行用于半年后回看时复盘。</p>

        <NumberedList
          items={[
            <>
              <Strong>这个账号，我要解决我什么具体的现实问题？</Strong>不是"我想做自媒体"，而是"我想用这个账号，把我现在生意里某个具体的瓶颈撬开"。是获客太贵？是转介绍太慢？是品类升级？是新业务起步？写一句话。
            </>,
            <>
              <Strong>我的目标用户是谁？他们在哪里聚集？</Strong>不要写"年轻人""女性""中产"这种空泛标签。写一个具体的人：他的年龄、职业、收入、烦恼、消费习惯、最常用的平台。越具体，后面选题越省力。
            </>,
            <>
              <Strong>对这个用户，我能提供的独特价值是什么？</Strong>把你能拿出来的"硬底牌"盘一下：产地（特定地理或资源优势）、供应链（自家工厂或可控成本）、实体（可被走进来的门店/诊所/工作室）、手艺（亲手能干活的功夫）、行业积累（你比同行多干的那几年）、表达力（能把复杂的事讲得人听得懂）——你占了几条？这几条加起来，能不能解释"为什么用户应该选你而不是别人"？
            </>,
            <>
              <Strong>我准备进入哪个平台？它的四维评分对我是多少？</Strong>把工具 1.5 的表格填一遍，选最高分的那个作为主平台，次高分的作为分发平台。
            </>,
            <>
              <Strong>我现在的生意拆解出来，瓶颈在乘号哪一边？</Strong>是流量、是转化、是客单价、还是复购？这决定了你前 90 天该把精力 70% 放在哪里。
            </>,
            <>
              <Strong>我打算做流量经济、粉丝经济，还是品牌经济？</Strong>三种经济的成本和回报曲线不同。最常见的路径是从粉丝经济起步、积累到一定阶段再向品牌经济过渡。你打算停在哪一站？
            </>,
            <>
              <Strong>我的变现链路看上去是什么样的？</Strong>从一条视频出发，用户经过几步可以付钱给你？私域承接是什么？第一个钩子产品是什么？主力产品是什么？如果你回答不上来，先停一周想清楚再开始拍。
            </>,
            <>
              <Strong>我愿意为这件事放弃什么？</Strong>时间、娱乐、社交、短期收入、面子、被亲戚理解……资源是有限的，所有"什么都想要"的人最后都什么都做不深。写下三件你愿意主动放弃的事。
            </>,
            <>
              <Strong>如果前 30 条内容反馈都不好，我会怎么办？</Strong>这是最关键的一题。请你在动手之前先想好：如果前 30 条都不爆，你会复盘、迭代、继续做，还是会换赛道？如果会换赛道，意味着你的目的还不够硬，建议回到第 1 题重写。
            </>,
          ]}
        />

        <Insight label="判断标准">
          <span className="block">九题全部答得上来 ⇒ 你已经具备进场资格。立刻去做第二篇，把定位卡片填出来。</span>
          <span className="block">有 6-8 题答得上来 ⇒ 你的方向大致清晰，缺的几题可以边做边校准。</span>
          <span className="block">少于 5 题答得上来 ⇒ 不要急着拍。再读一遍前六节，把工具一个一个填完，再回来重写这份判断书。</span>
        </Insight>

        <SubHead>入场判断书 · 模板</SubHead>

        <ToolCard tag="工具 1.7" title="九题入场判断书（可打印）" desc="把这张表打印出来或抄一遍到笔记本上。半年后再翻出来回看，你会看见自己的判断在哪一题已经偏了。">
          <Table
            head={['No.', '问题', '你的回答']}
            rows={[
              ['01', '这个账号要解决的具体现实问题', '/'],
              ['02', '目标用户的具体画像', '/'],
              ['03', '我的独特价值（6 大优势占几条）', '/'],
              ['04', '主平台 + 四维评分', '/'],
              ['05', '当前生意的瓶颈在乘号哪一边', '/'],
              ['06', '我想做的经济类型', '/'],
              ['07', '变现链路（钩子产品 → 主力产品 → 高利润产品）', '/'],
              ['08', '我愿意放弃的三件事', '/'],
              ['09', '前 30 条不爆的应对方案', '/'],
            ]}
            emptyCols={[2]}
          />
        </ToolCard>

        <CaseBlock title="案例 · 一个口腔诊所老板的判断书">
          <p>
            ① 解决问题：本地诊所获客成本上涨，需要在 5 公里内被认识。② 目标用户：30-45 岁、有牙周问题、收入中上的女性。③ 独特价值：实体（占）+ 手艺（占）+ 行业积累（占）= 3/6。④ 平台：抖音 17
            分。⑤ 瓶颈：流量端（用户不知道我）。⑥ 经济类型：粉丝经济。⑦ 变现链路：视频→主页留电话→预约洁牙（99 元钩子）→种植牙/正畸（高利润）。⑧
            放弃：周末无效饭局、晚上刷剧、参加同行评比。⑨ 30 条不爆方案：每 10 条做一次系统复盘，调整选题角度而不换赛道。
          </p>
          <p>这张判断书填完，这位老板第二天就开始拍。八个月后，门店新增客户中有 38% 来自抖音。</p>
        </CaseBlock>
      </Chapter>

      <PartEnd />
    </div>
  </div>
)

const PartCover = () => (
  <div className="mb-20 mt-4 border-b border-white/10 pb-16 text-center sm:mb-24 sm:pb-20">
    <div className="mb-7 text-[12px] tracking-[0.7em] text-[#b8aa96]" style={{ paddingLeft: '0.7em' }}>
      第　一　篇
    </div>
    <h1 className="font-serif-zh text-[44px] font-semibold leading-[1.2] tracking-[0.14em] text-[#fffdf7] sm:text-[60px]">
      底层逻辑
    </h1>
    <div className="mt-6 font-mono text-[12px] tracking-[0.4em] text-[#b8693a] sm:text-[13px]">
      PART　Ⅰ　·　FOUNDATIONS
    </div>
    <Ornament className="mx-auto mt-9" />
    <p className="mx-auto mt-12 max-w-[460px] text-[14.5px] leading-[2.05] tracking-[0.03em] text-[#cfc6b8] sm:text-[15px]">
      凭什么能做成。
      <br />
      建立"对错"思维，从公理出发判断这件事值不值得做。
      <br />
      读完后，你应当能独立写出一份"入场判断书"——
      <br />
      不再追问"现在还能不能做"，而是知道自己要不要做、能不能做、为什么是自己。
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

type PlatformRow = {
  name: string
  s: number[]
  total: number
  fit: string
}

const PlatformsTable = ({ rows }: { rows: PlatformRow[] }) => (
  <div className="-mx-1 my-7 overflow-x-auto">
    <table className="w-full border-collapse text-[13.5px] leading-[1.7]">
      <thead>
        <tr>
          {['平台', '流量', '变现', '制度', '趋势', '合计', '适合谁'].map((h) => (
            <th
              key={h}
              className="border-b border-white/10 bg-white/[0.04] px-3 py-3 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b8aa96]"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name}>
            <td className="font-serif-zh border-b border-white/10 px-3 py-3 font-semibold text-[#fffdf7]">
              {r.name}
            </td>
            {r.s.map((v, i) => (
              <td
                key={`${r.name}-${i}`}
                className="border-b border-white/10 px-3 py-3 text-center font-semibold text-[#b8693a] [font-variant-numeric:tabular-nums]"
              >
                {v}
              </td>
            ))}
            <td className="border-b border-white/10 px-3 py-3 text-center font-semibold text-[#fffdf7] [font-variant-numeric:tabular-nums]">
              {r.total}
            </td>
            <td className="border-b border-white/10 px-3 py-3 text-[13px] text-[#cfc6b8]">
              {r.fit}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

type TripleCol = {
  variant: 'flow' | 'fan' | 'brand'
  title: string
  body: string
}

const tripleAccent: Record<TripleCol['variant'], string> = {
  flow: 'border-t-white/20',
  fan: 'border-t-[#8b2e2e]',
  brand: 'border-t-[#b8693a]',
}

const TripleGrid = ({ cols }: { cols: TripleCol[] }) => (
  <div className="my-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
    {cols.map((c) => (
      <div
        key={c.title}
        className={`border border-white/10 border-t-[3px] bg-white/[0.035] px-5 py-6 backdrop-blur-sm ${tripleAccent[c.variant]}`}
      >
        <h5 className="font-serif-zh mb-3 text-[15.5px] font-semibold tracking-[0.08em] text-[#fffdf7]">
          {c.title}
        </h5>
        <p className="m-0 text-[13px] leading-[1.9] text-[#cfc6b8]">{c.body}</p>
      </div>
    ))}
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

type FalseItem = { title: string; verdict: string; body: string }

const NumberedFalseList = ({ items }: { items: FalseItem[] }) => (
  <div className="my-6 space-y-4">
    {items.map((it, i) => (
      <div
        key={it.title}
        className="grid grid-cols-[36px_1fr] gap-3 border-b border-dotted border-white/10 pb-4"
      >
        <span className="pt-1 font-mono text-[13px] font-semibold text-[#b8693a] [font-variant-numeric:tabular-nums]">
          {String(i + 1).padStart(2, '0')}
        </span>
        <div className="text-[14.5px] leading-[1.95] text-[#d6cfc4] sm:text-[15px]">
          <span className="font-semibold text-[#fffdf7]">{it.title}</span>
          <span className="ml-1 text-[#b8693a]">——{it.verdict}</span>
          <span>{it.body}</span>
        </div>
      </div>
    ))}
  </div>
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
    <div>—— 第一篇 完 ——</div>
    <div className="font-serif-zh mt-3 text-[13px] tracking-[0.18em] text-[#b8693a]">
      下一篇 · 定位：你是谁、对谁说话
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
      href="/playbook/positioning"
      className="group flex items-center justify-between border border-white/10 bg-white/[0.04] px-5 py-4 transition-colors hover:border-[#b8693a]/60 hover:bg-white/[0.07]"
    >
      <div className="flex-1">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#8a7e6f]">
          Next
        </div>
        <div className="mt-1.5 font-serif-zh text-[15px] tracking-[0.06em] text-[#fffdf7]">
          第二篇 · 定位 →
        </div>
      </div>
    </Link>
  </nav>
)
