/* eslint-disable no-irregular-whitespace */
import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { requireMembership } from '@/features/membership/server/require-membership'

export const metadata: Metadata = {
  title: '第二篇 · 定位 — 微域生光自媒体运营实战',
  description:
    '你是谁、对谁说话。商业定位、内容定位、人设定位三位一体，写下属于自己的定位卡片。',
  openGraph: {
    title: '第二篇 · 定位 — 微域生光自媒体运营实战',
    description: '画等号 · 九节展开 · 一张定位卡片。',
  },
}

const CHAPTERS = [
  { id: 'ch-2-0', no: '2.0', label: '导读 · 画等号' },
  { id: 'ch-2-1', no: '2.1', label: '6 大优势自检' },
  { id: 'ch-2-2', no: '2.2', label: '商业定位四阶梯' },
  { id: 'ch-2-3', no: '2.3', label: '内容定位三原则' },
  { id: 'ch-2-4', no: '2.4', label: '痛点 + 方案超级公式' },
  { id: 'ch-2-5', no: '2.5', label: '视觉锤与文字钉' },
  { id: 'ch-2-6', no: '2.6', label: '向下兼容' },
  { id: 'ch-2-7', no: '2.7', label: 'IP 前置规划六问' },
  { id: 'ch-2-8', no: '2.8', label: '寻找空白与做跨界' },
  { id: 'ch-2-9', no: '2.9', label: '定位卡片练习' },
]

export default async function PlaybookPositioningPage() {
  await requireMembership('/playbook/positioning')
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
        Part Ⅱ
      </div>
      <div className="font-serif-zh mb-6 text-[20px] font-semibold tracking-[0.06em] text-[#fffdf7]">
        定位
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
        预计阅读 · 42 分钟
      </div>
    </div>
  </aside>
)

const Manuscript = () => (
  <div className="relative isolate">
    <div className="flex items-baseline justify-between border-b border-white/10 pb-5 font-mono text-[10px] uppercase tracking-[0.28em] text-[#8a7e6f] sm:text-[11px]">
      <Link
        href="/playbook/foundations"
        className="border-b border-dotted border-white/15 text-[#b8aa96] transition-colors hover:border-[#b8693a] hover:text-[#fffdf7]"
      >
        ← 第一篇 · 底层逻辑
      </Link>
      <span className="hidden sm:inline">《微域生光自媒体运营实战》</span>
      <span>第二篇 · 共九篇</span>
    </div>

    <div className="mx-auto max-w-[720px] pb-20 pt-10 sm:pb-24 sm:pt-14">
      <PartCover />

      <Chapter
        id="ch-2-0"
        no="2.0 · 导读"
        tag="Positioning"
        title="画等号：让一类需求等于你"
        lead="想到怕上火，人脑里出现的是王老吉。这就是定位真正想要做成的事。"
        first
      >
        <p>
          中国凉茶品牌不止王老吉一个。加多宝、和其正、邓老凉茶，配方接近、价格接近、铺货渠道也接近。但只要在街边问"上火了喝什么"，几乎没人会答这四个并列的名字，绝大多数人脱口而出的还是同一个三字答案。这个答案怎么来的？不是配方更好喝、不是价格更便宜、不是广告投得更多——是有一个先到位的等号，被钉在了每个消费者的脑子里：怕上火，等于，王老吉。
        </p>
        <p>
          这就是定位真正想做成的事——<Strong>在用户的认知里，让一类需求"等于"你这一个名字。</Strong>等号一旦画上，后面所有的获客、转化、复购都开始顺。等号画不上，再多的内容、再大的预算，最后只是不断地从零开始向陌生人重新解释一遍自己。
        </p>

        <Insight label="本章主张">
          定位的本质，是画等号。<br />
          你不用让全世界认识你，你要做的，是让某一类需求被想起来的时候，第一个被想起的就是你。这一篇会从商业定位、内容定位、人设定位三个层面，帮你写下属于自己的等号。
        </Insight>

        <SubHead>定位 = 商业 × 内容 × 人设</SubHead>
        <p>
          很多人讲定位，讲的只是其中一层——"我做什么类目"或者"我视频风格是什么"，然后就停了。这不够。一个能跑起来的账号，定位必须在三个层面同时立住，缺一个都会塌。
        </p>

        <TripleGrid
          cols={[
            {
              variant: 'flow',
              title: '商业定位',
              body:
                '解决"你卖什么"。要从一个具体的单品起步，逐步往单品类、赛道、全品类延伸。一上来就什么都卖，是大部分账号活不过 30 条的根本原因。',
            },
            {
              variant: 'fan',
              title: '内容定位',
              body:
                '解决"你怎么讲"。要遵循多维、原生、高频三条原则——既不能只讲一类成交理由，也不能像数字人一样没有真人感，更不能三天打鱼两天晒网。',
            },
            {
              variant: 'brand',
              title: '人设定位',
              body:
                '解决"你是谁"。要有视觉锤（人脸 + 标志符号），要有文字钉（一句话说清你解决什么问题），还要有一个清晰、能被传播的 IP 名字。',
            },
          ]}
        />

        <SubHead>"适合所有人"等于所有人都不适合</SubHead>
        <p>
          这一章会反复回到一个反共识：<Strong>越是想覆盖所有人，越是没有人会真正记住你。</Strong>这件事在传统媒体时代或许成立——一个电视台可以兼顾儿童、青少年、中年、老年——但在算法时代彻底失效。今天平台分发流量靠的是兴趣聚类，账号要被理解，靠的是一个明确的"它在帮谁解决什么问题"的标签。模糊就等于稀释，稀释就等于无人记住。
        </p>
        <p>
          这一篇之后所有的工具——6 大优势自检、超级公式、视觉锤设计、向下兼容矩阵、IP 前置六问——都在为一件事服务：把"<Strong>对谁、说什么、解决什么</Strong>"的等号写得越来越窄、越来越深。窄不可怕，浅才可怕。
        </p>
      </Chapter>

      <Chapter
        id="ch-2-1"
        no="2.1"
        tag="优势盘点"
        title="6 大优势自检：占任意 2 项就能做起来"
        lead='不是"我有热情"，不是"我有想法"，而是这六条里你占了几条。'
        first
      >
        <p>
          所有定位工作都建立在一个前提之上——<Strong>你必须先知道自己手里有什么。</Strong>但大多数人盘点自己的资源时，会陷入两种相反的偏误：要么妄自菲薄（觉得自己什么也没有，干脆不做），要么虚高（把"我对这个感兴趣""我朋友说我适合"也算上）。两种偏误最终走到同一个结果——选了一条自己其实托不住的赛道，三个月就发现拍不动了。
        </p>
        <p>
          要避开这个坑，需要一份硬标准。下面这份"6 大优势清单"，是把"能不能做成"分成六块可以独立勾选的拼图。<Strong>占其中任意两块，这件事就值得做；占四块以上，你应该立刻开始。</Strong>
        </p>

        <SubHead>三客观三主观</SubHead>
        <p>
          六大优势中，前三条是客观条件（外部资源），后三条是主观条件（个人特质）。客观三条解决"你和别人比有什么差异化资源"，主观三条解决"你能不能把这件事做下去并讲好"。
        </p>

        <NumberedList
          items={[
            <>
              <Strong>① 原产地。</Strong>你身处某类产品的源头——产蒜的乡、产茶的山、出海鲜的码头、出柚子的果园。原产地的特殊地理本身就是不可复制的内容，"我就在地里给你拍"远胜于任何摆拍。
            </>,
            <>
              <Strong>② 生产工厂。</Strong>你有自己的厂、或长期为某个厂代工、或对某类产品的工艺链条门儿清。能把"为什么这道工序必须这么走""为什么这个料贵在哪儿"讲得有条有理，用户一眼就能看出你不是二道贩子。
            </>,
            <>
              <Strong>③ 实体店。</Strong>你已经有线下生意——餐馆、口腔诊所、装修工作室、健身房、培训机构。线下场景是天然的内容现场，员工、客户、流程都可以入镜，信任建立的速度比纯线上账号快一个数量级。
            </>,
            <>
              <Strong>④ 会干活。</Strong>你在这个行业是真懂手艺、真能下场操作的人。区别在于："说一遍能听懂"和"做一遍能教会"是两件事。会干活的人讲东西，每一个细节都有具体的指代物，用户的脑海里会自动浮现画面。
            </>,
            <>
              <Strong>⑤ 行业有厚度。</Strong>别人随便问你一个问题，你不需要查就能答出来，且能继续往下展开三层。这意味着你在这个行业泡的年头够、踩的坑够、见的案例够。厚度无法速成，但它是粉丝从"看一条"变成"长期跟随"的最关键开关。
            </>,
            <>
              <Strong>⑥ 说话大大方方。</Strong>嗓门不需要大，气场不需要凶，但说话时的眼神、停顿、节奏要让人觉得"这个人不怵镜头"。这条主观条件最容易被低估——但镜头前不畏缩的人，账号几乎都能跑起来；镜头前别别扭扭的人，无论选题多巧、画质多高，转化都会卡在一个看不见的天花板上。
            </>,
          ]}
        />

        <Insight label="判读标准">
          占任意 2 项 = 可以做。<br />
          占任意 4 项 = 立刻开始，几乎不会失败。<br />
          特别提示：客观条件（①②③）和主观条件（④⑤⑥）能各占一条，叠加效果最稳——一类回答"我能拍什么"，一类回答"我能不能讲下去"，缺哪一边都会卡住。
        </Insight>

        <SubHead>占两条是怎么撑起一个账号的</SubHead>

        <CaseBlock title="案例 · 卖蒜苔大哥的两条优势">
          <p>
            一位在山东产蒜区做电商的大哥，没有读过任何运营课，也没有团队。他的全部优势只占了两块：<Strong>原产地</Strong>（人在地里）+ <Strong>说话大大方方</Strong>（嗓门大、热情、不怕镜头）。视频内容也极朴素——他站在地里、捧着一把刚拔出的蒜苔，告诉镜头今天什么价、为什么便宜、要不要囤。
          </p>
          <p>
            他每天拍三十条左右、三天能拍出近一百条。四年下来，发了 5120 条以上的视频，做到 50 万粉。当蒜苔销量起来之后，他顺势把同一套人设迁移到下一个单品——卖馒头。同样是原产地内拍、同样是热情大嗓门、同样是低单价高频次。两条优势看似单薄，但只要纯度足够高，撑起一个长期账号是足够的。
          </p>
        </CaseBlock>

        <p>
          这个案例的反共识在于：他没有去补"我画质不行""我不会剪辑""我没有专业摄影机"这些短板。他选择把自己已经占住的两条优势用到极限，让客观条件和主观条件叠成一个无法被同行复制的小护城河。
        </p>

        <ToolCard
          tag="工具 2.1"
          title="6 大优势自检打分表"
          desc="逐条勾选并打分（每条 0-3 分：0 = 没有；1 = 有一点；2 = 比较明显；3 = 同行公认）。总分 ≥ 6 强烈建议做；总分 4-5 可做但要选准赛道；总分 ≤ 3 先补短板再说。"
        >
          <Table
            head={['优势', '类型', '我的得分（0-3）', '可作为内容的具体抓手']}
            rows={[
              ['① 原产地', '客观', '/', '（例：每天在地里拍 / 在港口拍 / 在工坊拍）'],
              ['② 生产工厂', '客观', '/', '（例：拆解某道工序 / 走一遍流水线 / 讲一次报废处理）'],
              ['③ 实体店', '客观', '/', '（例：员工查岗 / 客户回访 / 后厨直播）'],
              ['④ 会干活', '主观', '/', '（例：实操演示 / 把别人讲的概念做出来）'],
              ['⑤ 行业有厚度', '主观', '/', '（例：连答三层 / 拆爆款 / 复盘失败案例）'],
              ['⑥ 说话大大方方', '主观', '/', '（例：口播 / 现场互动 / 出镜带场）'],
            ]}
            emptyCols={[2, 3]}
          />
          <p className="mt-3 text-[13px] leading-[1.85] text-[#8a7e6f]">
            填表后请把"得分 ≥ 2 的两条"圈出来——这两条就是你账号未来 6 个月所有内容的核心抓手。其他条款不必勉强补齐。
          </p>
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-2-2"
        no="2.2"
        tag="商业定位"
        title="商业定位四阶梯：从单品到全品类"
        lead='上来就"什么都卖"的人，几乎没有一个跑出来。'
        first
      >
        <p>
          很多人在动手前会做一件很自然但很危险的事——把所有"我可能能卖的东西"都列在一张纸上。"我家有原产地，所以蒜苔、姜、辣椒、红薯、面粉都能卖""我做装修，所以设计、施工、家具、软装、家电都能接""我开口腔诊所，所以洁牙、补牙、种植、矫正、儿牙都做"。听上去逻辑通顺：我都能做，所以我都讲。
        </p>
        <p>
          但落到执行上，这条路几乎走不通。原因是：<Strong>用户的认知是窄的，不是宽的。</Strong>同一个账号既讲蒜苔又讲面粉，用户在脑海里形成不了一个清晰的等号；同一个账号既讲洁牙又讲种植，用户买洁牙时心里那把信任的尺子，不会自动延伸到种植牙这个十倍客单的决策上去。
        </p>

        <PullQuote>定位的本质是画等号，不是建货架。</PullQuote>

        <SubHead>四阶梯：单品 → 单品类 → 赛道 → 全品类</SubHead>
        <p>
          先把"卖什么"这件事拆成一个递进的阶梯。每一层都是上一层做扎实之后才能延伸的——跳级几乎一定会摔。
        </p>

        <NumberedList
          items={[
            <>
              <Strong>第 1 层 · 单品。</Strong>选一个最具体、最聚焦的产品作为起点。不是"卖海鲜"，是"卖一种特定虾"；不是"做口腔"，是"做无痛洁牙"；不是"教英语"，是"教职场人三分钟开口"。单品做久了，用户脑海里的等号就被画清楚了。
            </>,
            <>
              <Strong>第 2 层 · 单品类。</Strong>当用户对你的单品已经建立信任，他会自然好奇你还有什么。这时你可以在同一类目内扩展——卖蒜苔的扩到卖姜、蒜、葱，卖洁牙的扩到补牙、洗牙包年卡。同一品类，决策门槛低、信任可迁移。
            </>,
            <>
              <Strong>第 3 层 · 赛道。</Strong>同一目标人群、不同品类。比如"职场女性"这条赛道，可以从职场穿搭做到通勤包、护肤、办公好物。赛道延伸的核心是<Strong>用户重合而不是品类重合</Strong>。
            </>,
            <>
              <Strong>第 4 层 · 全品类。</Strong>带货大主播阶段——李佳琦、罗永浩这一档。这一层不是普通人的起点，是几年沉淀之后的可选项，且必须依靠强 IP + 团队 + 供应链同时到位。
            </>,
          ]}
        />

        <Insight label="反共识结论">
          <span className="block">单品类成功率几乎接近一倍；全品类成功率几乎为零。</span>
          <span className="block">几乎所有跑出来的全品类账号，都不是从全品类做起来的，而是从单品做出 IP 之后才扩展到全品类。</span>
        </Insight>

        <SubHead>为什么不能跳级</SubHead>
        <p>
          跳级的本质，是想绕过"建立信任"这一关。但建立信任没有捷径，它只能通过"在同一个具体场景里被反复看到、被反复印证"才能完成。
        </p>
        <p>
          想象一个新账号上来就发"早上推荐你戴这块表、中午教你买这套西装、晚上带你买这瓶酒"。这三条视频每一条单独看都没问题，但摆在一起，用户脑海里建不起任何一个清晰的等号——他不知道你究竟在哪一件事上是行家。等号建不起来，信任就建不起来；信任建不起来，变现就不存在。
        </p>

        <CaseBlock title="案例 · 蒜苔到馒头的渐进升级">
          <p>
            还是前一节那位卖蒜苔的大哥。前几年他只死磕一个单品——蒜苔。同样的拍法、同样的地里、同样的嗓门，4 年 5000 多条视频，做到 50 万粉。等"蒜苔 = 这个大哥"的等号已经被钉死，他才把同一套人设迁移到下一个单品——馒头。次序上是<Strong>同一套人设、换下一个具体单品</Strong>，而不是上来就铺一整张货架。
          </p>
          <p>
            反过来看：如果他第一年就同时卖蒜苔 + 馒头 + 调味料 + 农具，用户从他的视频里就读不出"他到底在哪件事上是个行家"——大概率连第一桶金都拿不到。
          </p>
        </CaseBlock>

        <SubHead>三个"不能卖"的劝退原则</SubHead>
        <p>
          除了阶梯顺序，还有三种产品在新账号阶段就该立刻划掉，不要因为眼热而往里钻。
        </p>

        <Checklist
          items={[
            '高决策门槛 + 低复购的品类（豪宅、整形手术、长期保险）——单笔大但极低频，信任无法靠几条视频建立。',
            '强标准化 + 透明比价的品类（手机、家电、3C 配件）——平台和大主播挤压利润空间，你赚不到差价。',
            '靠擦边 / 灰色玩法跑量的品类（暴利保健品、来路不明的减肥产品、所谓"内部资源"）——平台一旦清查，账号清零。',
          ]}
        />

        <ToolCard
          tag="工具 2.2"
          title="商业定位 5 步走"
          desc="按顺序填写，每一步不能跳。第 1 步和第 2 步是新账号 0-6 个月的全部内容焦点。"
        >
          <Table
            head={['步骤', '问题', '我的答案']}
            rows={[
              ['Step 1', '我的第一个具体单品是什么？（限定到 SKU 级）', '/'],
              ['Step 2', '这个单品的目标用户是谁、解决他什么问题？', '/'],
              ['Step 3', '这个单品做透之后，最自然的扩展品类是什么？', '/'],
              ['Step 4', '同一群用户还有哪些重合需求（赛道延伸）？', '/'],
              ['Step 5', '5 年后理想的全品类形态是什么？（仅作远景，不作起点）', '/'],
            ]}
            emptyCols={[2]}
          />
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-2-3"
        no="2.3"
        tag="内容定位"
        title="内容定位三原则：多维 · 原生 · 高频"
        lead='"垂直"被理解错了。账号要的不是单一形式，是单一目的。'
        first
      >
        <p>
          上一节解决了"卖什么"，这一节解决"怎么讲"。这是大多数账号做不起来的真正瓶颈——商业定位选对了，但内容做出来不像"自己人"、不能让人记住、不能持续供给。三条原则一条都不能违反。
        </p>

        <SubHead>原则一 · 多维：成交理由是多维的</SubHead>
        <p>
          太多人被"账号要垂直"这条口号洗脑，结果做成了"账号要单调"。一个口腔医生只敢拍洁牙、一个装修师傅只敢拍工地、一个律师只敢念法条。看上去专业，实际上没人愿意一直看——因为现实里，一个人决定买你的理由从来都不只有一个。
        </p>
        <p>
          这就是<Strong>多维</Strong>原则。你的视频，应该轮流展现这几个不同维度的成交理由：
        </p>

        <Checklist
          items={[
            '专业维度 — 我懂这个行业的事（讲知识、拆门道、避坑指南）',
            '案例维度 — 我做过哪些真实活儿（晒过程、晒结果、晒口碑）',
            '人设维度 — 我是个什么样的人（讲故事、讲经历、讲价值观）',
            '观点维度 — 我对行业怎么看（聊观点、聊争议、给情绪共鸣）',
          ]}
        />

        <p>
          四个维度可以轮着拍。同一个账号一会儿讲、一会儿演、一会儿测评、一会儿吐槽，看上去"杂"，但所有内容都在为同一个目的服务——让用户对"在这件事上信任你"的等号画得越来越粗。
        </p>

        <Insight label="重申第一篇的真命题">
          "账号要垂直"的正确版本是：<Strong>目的垂直，手段多维。</Strong>目的层不能漂（你解决一类问题），但执行层不必死守一种形式。
        </Insight>

        <SubHead>原则二 · 原生：越像数字人越不变现</SubHead>
        <p>
          很多新账号一拍出来就给人一种"AI 播报"的感觉——念稿子的语气、绿幕背景、统一字幕模板、面无表情。这种内容平台或许会推，但用户极少会"买"。原因是：用户买的从来都不是产品，是<Strong>产品背后那个具体的人</Strong>。一个让人觉得"假"的账号，连让人下单的最低门槛都跨不过。
        </p>

        <PullQuote>越像数字人，越不变现。</PullQuote>

        <p>
          原生感的本质是：<Strong>你的真人是什么样的，呈现出来就是什么样。</Strong>说话有口音不要去抹掉，背景就是自家厨房不必再去铺绿幕，手势不需要培训成节目主持人。原生感不是"接地气"的装饰，它是用户在第一秒判断"这条视频是不是值得我看下去"的核心信号。
        </p>

        <CaseBlock title="案例 · 150 万粉丝 vs 15 万粉丝的对照">
          <p>
            一个 150 万粉的账号专讲"人生哲理"，每条视频灯光、字幕、配乐都精心调过，文案像被打磨过的散文。这个账号流量很大，但变现极差——粉丝下不了单，因为他们记住的是"这个账号说得真有道理"，但没有记住"这是个具体的什么人"。
          </p>
          <p>
            另一个 15 万粉的账号，主理人是个讲两性话题的男主播，话直接、背景就是日常房间，把"为什么大多数男生在恋爱里自我认同感太低"这种问题直戳到人心里。播放量小很多，但每条带货视频都能跑出可观的转化。差异不在选题——在于<Strong>第二个账号让人感觉"是个活人在跟我说话"</Strong>，而第一个像看小红书图文。
          </p>
        </CaseBlock>

        <SubHead>原则三 · 高频：被记住的方式是反复出现</SubHead>
        <p>
          一个最朴素的真理：<Strong>用户记住你的方式，是你反复出现。</Strong>不是"我做一个特别好的内容大家就记住了"——你越是把希望寄托在这一条，越容易越拖越久。
        </p>
        <p>
          想想你为什么记得家楼下卖早点的大姐？不是因为她做过什么了不起的事，只是她天天在那儿。算法平台上也一样，账号的更新频次决定了你被同一个用户刷到的次数。一周一条没人记得住你，一周三到五条才能形成"哎，又是这个人"的认知锚。
        </p>
        <p>
          关于频次，有两条具体建议：第一，<Strong>起号期保 5 条/周</Strong>，宁可降低单条精度也要保住频次，让算法和用户都能建立"这个账号是活的"的预期；第二，<Strong>过了起号期，频次可以降到 3 条/周</Strong>但密度要往上提，把宝贵的算力放到爆款选题上。
        </p>

        <ToolCard
          tag="工具 2.3"
          title="内容定位三原则自检表"
          desc="每条原则下，你的内容现状打几分（0-5 分）。三项任一 ≤ 2，停下来先补这条。"
        >
          <Table
            head={['原则', '现状打分', '当前的问题', '下一步改动']}
            rows={[
              ['多维 — 四个维度都有覆盖吗', '/', '/', '/'],
              ['原生 — 镜头里真的是"自己"吗', '/', '/', '/'],
              ['高频 — 每周稳定在 3 条以上吗', '/', '/', '/'],
            ]}
            emptyCols={[1, 2, 3]}
          />
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-2-4"
        no="2.4"
        tag="超级公式"
        title="痛点 + 方案：定位的超级公式"
        lead="撕开他的痛，再递给他你的方案。"
        first
      >
        <p>
          前面两节是从"你"出发——你有什么、你怎么讲。这一节翻过来，从"用户"出发。用户买你东西的真正原因不是因为"你好"，是因为"他有问题、你正好能解"。把这两端连起来，就是一句"用户认得出、记得住、想到就用"的定位语。
        </p>
        <p>
          这句定位语有一个统一的结构，叫超级公式：
        </p>

        <PullQuote>痛点　+　方案　=　你的定位语</PullQuote>

        <p>
          中国市场上能跑十年的广告语，几乎都遵循这个公式。你回忆任意一个，都能把它拆成"痛 + 解"两半。
        </p>

        <SubHead>痛点的三种模型</SubHead>
        <p>
          所有的痛点，归根结底可以归为三种心理动作：
        </p>

        <TripleGrid
          cols={[
            {
              variant: 'flow',
              title: '怕 — 损失型',
              body:
                '用户怕失去某种状态：怕生病、怕被骗、怕亏损、怕错过。这一组痛点最尖锐、决策最快——"怕"字一出来，多数人会立刻为消除恐惧买单。',
            },
            {
              variant: 'fan',
              title: '想 — 欲望型',
              body:
                '用户向往某种状态：想皮肤好、想拍好照、想孩子优秀、想被认可。这一组痛点更日常、更高频，但单次决策门槛较低。',
            },
            {
              variant: 'brand',
              title: '怎么办 — 解决型',
              body:
                '用户已经处于一个让自己不舒服的状态，要找出路：累了困了怎么办、灰指甲怎么办、牙齿黄怎么办。这一组痛点最务实，方案契合度直接决定转化。',
            },
          ]}
        />

        <SubHead>三类公式 × 三个经典样本</SubHead>
        <p>把超级公式套到三种痛点上，得到下面这一组在中国市场被反复印证的案例：</p>

        <Table
          head={['痛点类型', '痛点表述', '方案表述', '完整定位语']}
          rows={[
            ['怕（损失）', '怕上火', '喝王老吉', '怕上火 喝王老吉'],
            ['想（欲望）', '收礼送长辈', '送脑白金', '收礼只收 脑白金'],
            ['怎么办（解决）', '累了困了', '喝红牛', '累了困了 喝红牛'],
          ]}
        />

        <p>
          这三句广告语，在过去 20 年里几乎没怎么变过。它们之所以能稳坐头部，靠的不是创意，是<Strong>把用户脑海里"那一个特定的痛点情境"和"自己的产品名"画上了等号</Strong>。等号一旦画上，往后所有的广告投放都不是在"教育用户"，而只是在"提醒用户那个等号还在"。
        </p>

        <Insight label="给个人 IP 的版本">
          王老吉的公式同样适用于个人 IP。你的"广告语"就是你账号简介里那一句话——它必须能让一个完全不认识你的人，在三秒内读懂"在什么场景下应该来找你"。任何写不出这一句话的账号，定位都还没完成。
        </Insight>

        <SubHead>给自己的账号画三组等号</SubHead>
        <p>
          下面这套填空，是这一节最该交付给读者的东西。你的账号在每一个层级都应该有一个清晰的等号。
        </p>

        <ToolCard
          tag="工具 2.4"
          title="超级公式填空表"
          desc="按三种痛点类型各写一条候选定位语，然后挑选最能落到具体业务上的那一条作为最终定位。"
        >
          <Table
            head={['痛点类型', '我的用户的痛', '我提供的方案', '完整定位语候选']}
            rows={[
              ['怕（损失）', '（例：怕装修被坑）', '（例：跟着 XX 验房）', '（例：怕装修被坑，跟 XX 验房）'],
              ['想（欲望）', '/', '/', '/'],
              ['怎么办（解决）', '/', '/', '/'],
            ]}
            emptyCols={[1, 2, 3]}
          />
          <p className="mt-3 text-[13px] leading-[1.85] text-[#8a7e6f]">
            三条候选写完后，强制自己挑出最具体、最能落到一个明确动作上的那一条作为最终定位语。这句话要短到能放进抖音简介那一行里、也要简到能被路人复述。
          </p>
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-2-5"
        no="2.5"
        tag="心智占领"
        title="视觉锤与文字钉：左右脑同时进攻"
        lead="一个让人记住你长什么样，一个让人记住你解决什么。"
        first
      >
        <p>
          人脑处理信息的两个通道，是这一节所有方法的物理基础：<Strong>右脑处理图像和情感，左脑处理文字和逻辑。</Strong>这两条通道的处理速度不在一个量级——图像几乎是本能反应，文字则要先扫一遍再翻译成意义。这就是为什么红绿灯不写字、品牌花重金做 logo、所有让你"过目不忘"的广告都同时印在你左右脑两侧。
        </p>

        <SubHead>视觉锤：让人一眼记住你长什么样</SubHead>
        <p>
          视觉锤，是用户在 0.5 秒内识别出"哦，是他"的那个图像信号。它可以是某个人的脸 + 标志服饰、某个 logo、某种独家配色、某种特殊背景。视觉锤的目标，是把"看到这个画面"和"想到这个账号"画上等号。
        </p>

        <Checklist
          items={[
            '一张脸 + 一件标志衣物（蓝衬衫 + 圆框眼镜 + 书房 / 围裙 + 厨刀 / 牛仔裤 + 实验室白大褂）',
            '一种品牌色（红十字、柯达黄、老干妈红、可口可乐红）',
            '一个 logo 形象（耐克的钩、京东的狗、天猫的猫、企鹅的腾讯）',
            '一个标志手势 / 道具（某个动作 / 某个常出现的小物件，被反复使用直到成为记忆点）',
          ]}
        />

        <CaseBlock title="案例 · 一位经济学讲师的视觉锤选型">
          <p>
            一位经济学讲师在做账号前，面临三个候选视觉锤方案。
          </p>
          <p>
            <Strong>方案 A · 爱因斯坦风格：</Strong>白色假发 + 圆框眼镜 + 黑板粉笔，模仿爱因斯坦在课堂上的样子讲经济。专业感强但成本高（需要每次拍前做造型，时间久了会疲惫）。
          </p>
          <p>
            <Strong>方案 B · 古装方案：</Strong>汉服 + 长发 + 折扇 + 茶具 + 袅袅青烟。氛围足，但与"经济学"的现代感冲突，且穿脱不便。
          </p>
          <p>
            <Strong>方案 C · 蓝衬衫 + 蓝色帽子 + 书房：</Strong>每天换一件相似剪裁的蓝色衬衫即可，帽子永远是同一顶，背景永远是同一面书墙。<Strong>性价比最高、可执行性最强、识别度最强。</Strong>最终他选了方案 C，几百条视频下来全网都能在缩略图里一眼把他认出来。
          </p>
        </CaseBlock>

        <p>
          选视觉锤有三个判据：<Strong>独特</Strong>（不能和你赛道里现存账号撞）、<Strong>可执行</Strong>（每次拍摄都能稳定复现，不要靠特效或化妆）、<Strong>不阻碍内容</Strong>（不能为了视觉锤而牺牲拍摄机动性）。三个都满足的方案，才是性价比最高的视觉锤。
        </p>

        <SubHead>文字钉：让人记住你解决什么</SubHead>
        <p>
          视觉锤回答"你是谁"，文字钉回答"你做什么"。一个完整的认知锚，必须两个都有。文字钉的形态，就是上一节那条"痛点 + 方案"的超级公式——它要短到能塞进 12 个字以内，简到能被复述。
        </p>

        <p>
          下面是几个汽车品牌的文字钉。它们的产品其实重合度不低，但用户一提到对应需求，脑子里冒出来的就是各自那一个名字：
        </p>

        <Table
          head={['品牌', '文字钉', '锚定的需求']}
          rows={[
            ['宝马', '操控', '驾驶乐趣'],
            ['奥迪', '舒适', '商务出行'],
            ['沃尔沃', '安全', '一家老小'],
            ['兰博基尼', '极致性能', '社交炫耀'],
            ['吉普', '越野', '户外探险'],
            ['劳斯莱斯', '尊贵', '社交身份'],
          ]}
        />

        <p>
          这些文字钉不是一年两年钉进用户脑子里的，是反复重复的结果。
          <Strong>反复重复的本质，是让用户放弃思考——不需要权衡、不需要比价，听到那个需求，就想到那个名字。</Strong>
        </p>

        <SubHead>两者必须同时存在</SubHead>
        <p>
          只有视觉锤、没有文字钉的账号，会变成"颜值号"——粉丝看一眼觉得"挺好看的"，但根本没记住你是干嘛的。只有文字钉、没有视觉锤的账号，会变成"听上去懂行但记不住脸"——爆款一过气就什么都没剩。两者必须同时存在，且必须互相印证。
        </p>

        <PullQuote>
          一有这个需求，马上想到你；
          <br />
          一提到你，马上知道你解决什么。
        </PullQuote>

        <ToolCard
          tag="工具 2.5"
          title="视觉锤候选三方案打分表"
          desc="按三个判据（独特 / 可执行 / 不阻碍内容）各打 0-5 分。总分最高的那一套，作为接下来 6 个月固定执行的视觉锤。"
        >
          <Table
            head={['候选方案', '独特性', '可执行性', '不阻碍内容', '总分', '决策']}
            rows={[
              ['方案 A：（描述）', '/', '/', '/', '/', '/'],
              ['方案 B：（描述）', '/', '/', '/', '/', '/'],
              ['方案 C：（描述）', '/', '/', '/', '/', '/'],
            ]}
            emptyCols={[1, 2, 3, 4, 5]}
          />
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-2-6"
        no="2.6"
        tag="错位竞争"
        title="向下兼容：找比你弱的人"
        lead="不要去和比你强的人卷专业度，要去找还没入门的人讲常识。"
        first
      >
        <p>
          很多创作者陷入一个直觉陷阱：因为自己是某领域的专业人士，就以为内容应该做给同行看，要"显得专业"。但真正能跑量的账号，几乎都做了相反的事——<Strong>把内容做给比自己弱的人看</Strong>。
        </p>

        <SubHead>向下兼容的本质</SubHead>
        <p>
          向下兼容的逻辑很简单：你的<Strong>同行</Strong>不是你账号的目标用户——他们不会因为你的视频去下单。真正会下单的人，是那些"对这个领域感兴趣、但没你懂"的潜在用户。同行看你的视频可能会评论"太基础了"，但这些"太基础"的内容，对小白来说每一条都是顿悟。
        </p>
        <p>
          向下兼容做得越深，你的护城河越宽。原因是同行不愿意去做"科普级别"的内容（觉得跌份），但小白市场远远比专业圈子大。一旦你愿意一直在那个层级讲，你会发现这个层级的供给极度稀缺。
        </p>

        <SubHead>三类反差案例</SubHead>

        <CaseBlock title="案例 · 教成人识字">
          <p>
            有一个叫"金金十字"的账号，做的是"教成年人识字 + 教成年人用手机打字"——服务那些因为各种原因没读完书、识字量停留在小学水平，但又因为社保、医保、看病、找工作不得不识字的成年人。这是一个被几乎所有教育账号忽视的群体。一条把生活常用字一个一个读给镜头看的视频，跑出了 4.2 万点赞、200 万播放；账号顺势把这套方法做成 99 元的入门课，已有几千人报名。
          </p>
        </CaseBlock>

        <CaseBlock title="案例 · 热水器避坑">
          <p>
            一位刚装修完自家房子的普通人，自己并不是家电从业者，但因为踩过几个坑，他做了一个短视频系列叫"热水器安装的坑我踩了就不允许你们再踩了"。后来又延伸出"以为安装热水器踩坑，没想到选热水器踩才是最大的坑"。整条线没用任何"专业老师傅"人设，靠的就是"我懂这一点你不懂"的纯信息差——装修完这门"技能"对他自己就作废了，但对从没装修过房子的人就是高价值课程，账号顺势把它做成一份小课程做变现。
          </p>
        </CaseBlock>

        <CaseBlock title="案例 · 天津选房日记">
          <p>
            一位叫"柯尔"的北漂决定落户天津，没有去和讲房地产宏观大势的财经博主竞争，而是把镜头对准和自己一样"刚到天津、不熟规则、不知道该怎么落户、怎么挑首付够得着的盘"的同类人群。账号干脆叫"北漂去天津选房创业日记"，每条视频就讲自己的下一步：怎么落户、看了哪套房、踩了哪个坑。视角是和观众平视的"过来人"，不是高高在上的中介——这本身就是一种最舒服的向下兼容。
          </p>
        </CaseBlock>

        <SubHead>怎么找你"向下兼容"的对象</SubHead>
        <p>
          有三个层次可以挨着挑——从最容易做起：
        </p>

        <NumberedList
          items={[
            <>
              <Strong>① 五年前的自己。</Strong>你刚入门时困惑过什么、被坑过什么、走过哪些弯路？这是最容易获取的素材库，因为你自己经历过、记得每一处的具体痛苦。
            </>,
            <>
              <Strong>② 比你晚 1-3 年入行的人。</Strong>他们已经知道一些事，但还没拿到全部经验。给他们讲，既不会"显得太基础"、也不会"超纲"，是最甜的位置。
            </>,
            <>
              <Strong>③ 完全不懂但又必须用到你这门手艺的普通人。</Strong>这一档最大、最长尾——租房买电器的、第一次买房的、刚怀孕的、孩子刚上学的、第一次创业的——他们对你专业领域的"小白困惑"，是平台上最稳的需求池。
            </>,
          ]}
        />

        <ToolCard
          tag="工具 2.6"
          title="向下兼容对象清单"
          desc={'按三个层次分别写下你"向下兼容"的具体对象，并各举三个他们最关心的问题。账号前 30 条视频，就从这张表里抽题。'}
        >
          <Table
            head={['层次', '具体对象描述', '他们最关心的 3 个问题']}
            rows={[
              ['① 五年前的自己', '/', '/'],
              ['② 比你晚 1-3 年入行的人', '/', '/'],
              ['③ 完全不懂但要用到你这门手艺的普通人', '/', '/'],
            ]}
            emptyCols={[1, 2]}
          />
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-2-7"
        no="2.7"
        tag="IP 规划"
        title="IP 前置规划六问"
        lead="动手之前不写完这六问，后面要走很多回头路。"
        first
      >
        <p>
          所有账号在动手之后都会遇到的同一类困境——拍着拍着发现没素材、拍着拍着发现人设漂了、拍着拍着发现不知道这个账号最后要变成什么样——绝大多数都不是"执行问题"，是"规划问题"。一个能跑长线的账号，必须在按下第一次开机键之前，先把六个最容易后期改不动的决定钉死。
        </p>

        <SubHead>六问</SubHead>

        <NumberedList
          items={[
            <>
              <Strong>① 自己出镜，还是他人出镜？</Strong>自己出镜是最高级别的信任锚，几乎所有能长期跑下来的高客单账号都是真人出镜。让别人出镜适合两类情况：你本身不擅长面对镜头、但有团队成员擅长；或者你做的是矩阵号、需要拼数量而不是拼质量。两种路径的天花板和成长曲线完全不同——决定之后，几乎无法中途切换。
            </>,
            <>
              <Strong>② 露脸还是不露脸？</Strong>不露脸（仅手部 / 仅声音 / 仅动画）会让账号的识别度打三折——画面、运镜、节奏都可以被同行复制，但"你这张脸"无法被复制。除非你是非常少数的例外（动画解说、宠物号、纯产品评测），否则强烈建议露脸。这是建立长期粉丝经济的第一个开关。
            </>,
            <>
              <Strong>③ 视觉锤是什么？</Strong>把上一节的工具 2.5 落到这里——你的视觉锤候选方案，最终选哪一套？视觉锤要求<Strong>六个月内不变</Strong>，且每次出镜都尽量保持一致。
            </>,
            <>
              <Strong>④ IP 名字叫什么？</Strong>取名字有五条硬规则：不能太 low 也不能太晦涩（既不像微商号又不像论文标题）、别人用过的就别用（同行重名或近名直接淘汰）、能表达定位（一看就知道你做什么）、有独特识别（让别人帮你转介绍时不打磕巴）、带一点人文温度（"XX 老师"、"XX 工"、"老 XX"等比纯企业名好得多）。<Strong>不要用你的公司名当 IP 名</Strong>——人是有温度的，企业没有。
            </>,
            <>
              <Strong>⑤ 主平台 + 分发平台。</Strong>把第一篇工具 1.5 的四维评分结果放进来。主平台选总分最高的那个，重点投入；分发平台 1-2 个，剪辑成本接近为零的内容直接搬运，多平台冗余。第一年的资源 80% 必须押在主平台上。
            </>,
            <>
              <Strong>⑥ 每周时间投入分布。</Strong>具体到拍摄、剪辑、运营、复盘各占多少小时？这一项最容易被低估——大多数新手把全部时间花在"拍"，几乎不留时间给"复盘"。建议比例是 40% 拍摄 + 30% 剪辑 + 15% 选题 + 15% 复盘与对手研究。
            </>,
          ]}
        />

        <Insight label="为什么要前置">
          <span className="block">这六问，每一项都可以中途调整，但调整成本极高——视觉锤改一次，粉丝认知重启一次；名字改一次，所有搜索流量归零一次；主平台改一次，前 6 个月的算法标签作废一次。</span>
          <span className="block">在第一条视频发出去之前花一晚上把它们想清楚，比拍 100 条之后再回炉重做便宜得多。</span>
        </Insight>

        <ToolCard
          tag="工具 2.7"
          title="IP 前置规划六问回答表"
          desc="一项一项填完，每一项不能写空。回答不上来的那一项，意味着这个账号还没准备好开机。"
        >
          <Table
            head={['No.', '问题', '我的决定', '理由 / 备选方案']}
            rows={[
              ['01', '自己出镜 vs 他人出镜', '/', '/'],
              ['02', '露脸 vs 不露脸', '/', '/'],
              ['03', '视觉锤方案', '/', '/'],
              ['04', 'IP 名字', '/', '/'],
              ['05', '主平台 + 分发平台', '/', '/'],
              ['06', '每周时间分布', '/', '/'],
            ]}
            emptyCols={[2, 3]}
          />
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-2-8"
        no="2.8"
        tag="差异化"
        title="差异化：寻找空白与做跨界"
        lead={'不是要做"更好的"，是要做"不一样的"。'}
        first
      >
        <p>
          做账号最致命的策略是"和头部一样，只是没他出名"。这条路一定走不通——用户没有第二次记住同一类账号的认知带宽。要在一个已有头部的赛道里出来，只有两条真正能跑通的路径：<Strong>寻找空白</Strong>（在已有竞争中找出别人没占的位置）、<Strong>做跨界</Strong>（把两个已有的标签叠在一起，产生新细分）。
        </p>

        <SubHead>路径 A · 寻找空白</SubHead>
        <p>
          所有看似"红海"的赛道，仔细拆都还有空白。空白的位置，往往不是在"更专业 / 更便宜 / 更高级"这种主流维度上，而是在"被头部账号忽略的次要人群"或"被认为不够 sexy 的细分场景"里。
        </p>

        <Checklist
          items={[
            '把宽泛领域切到更窄（教唱歌 → 只教高音 / 只教转音 / 只教中老年学唱歌）',
            '把同一品类做到极致一个维度（卖咖啡 → 只讲手冲水温 / 只讲冷萃 / 只讲日式炭烧）',
            '把头部不愿做的小众场景做透（健身 → 只针对孕妇 / 只针对腰间盘突出 / 只针对久坐上班族）',
            '把已有产品做"反向"（讲怎么减肥的太多 → 讲怎么不要再减肥伤身的）',
          ]}
        />

        <CaseBlock title='案例 · 一个"教成年人补识字"的账号'>
          <p>
            语文教育赛道极度内卷——考研政治、高考语文、小学拼音、外语翻译，每一个细分都被头部占满。但有一个明显的空白：<Strong>已经成年但识字量不足的人</Strong>。这群人因为各种原因没读完书，今天又因为社保、医保、工作合同需要识字。整条赛道几乎没有账号专门服务他们。
          </p>
          <p>
            前面 2.6 提到的"金金十字"就把这个空白做透——单条视频跑到 200 万播放、4.2 万点赞，付费课直接转化成几千份报名。它的护城河不是讲得比别人好，是<Strong>"它在这个空白位置上"</Strong>——头部不愿意下沉，新手没意识到这个空白存在。
          </p>
        </CaseBlock>

        <SubHead>路径 B · 做跨界</SubHead>
        <p>
          跨界是把两个原本独立的标签叠在一起，生成一个全新的细分。每多叠一层，就把目标人群切窄一档，把竞争密度降低一档。
        </p>

        <p>
          下面这些都是"跨界生成新标签"的真实案例：
        </p>

        <Table
          head={['账号定位', '跨界叠加', '生成的新细分']}
          rows={[
            ['暴躁财经', '财经 + 经验讲得最好 + 脾气最暴', '能听懂的财经 + 情绪宣泄'],
            ['何清林', '讲金融术语 + 讲术语里做家务最贤惠', '专业财经 + 反差人设'],
            ['大能', '玩表 + 说相声最好 + 身子最虚', '高端表评测 + 反英雄人设'],
            ['刘燃修车号', '懂车 + 演技最好 + 最懂电影语言', '汽车科普 + 短剧体验'],
          ]}
        />

        <SubHead>找你的"差异化两栏"</SubHead>
        <p>
          要找到自己的差异化点，可以做一张极简的两栏对照表：
        </p>

        <p>
          <Strong>左栏写"借鉴"：</Strong>你赛道里跑出来的头部账号，证明了哪些事是行得通的——某种节奏、某种结构、某种选题方向。这些你可以拿来用，避开他们已经踩过的弯路。
        </p>
        <p>
          <Strong>右栏写"突破"：</Strong>这些头部有什么没做？有什么不愿做？有什么做不到？你能不能在他们的盲区里，给同一类用户提供一个新的角度？
        </p>

        <Insight label="一个反直觉的提醒">
          做对手研究的时候，不要被数据迷惑。数据告诉你"什么作品火了"，但火的原因常常不是数据本身能解释的。你需要看完三千条视频之后，闭着眼睛能说出对手的每一个特点——再去判断他的优劣，比拉表算播放量有用得多。
        </Insight>

        <ToolCard
          tag="工具 2.8"
          title="差异化矩阵图"
          desc="在你的赛道里挑出 3 个头部对手，把他们和自己放进同一张表。"
        >
          <Table
            head={['对手 / 自己', '一句话定位', '他做了什么（借鉴）', '他没做什么（突破）']}
            rows={[
              ['对手 A', '/', '/', '/'],
              ['对手 B', '/', '/', '/'],
              ['对手 C', '/', '/', '/'],
              ['我', '/', '/', '（这一栏是你的护城河所在）'],
            ]}
            emptyCols={[1, 2, 3]}
          />
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-2-9"
        no="2.9"
        tag="本篇练习"
        title="本篇练习 · 写下你的定位卡片"
        lead="一张 A4，七个模块。填完你才算真的把第二篇读懂了。"
        first
      >
        <p>
          这一篇前八节给了你七组工具：6 大优势自检（2.1）、商业定位 5 步走（2.2）、内容三原则（2.3）、超级公式（2.4）、视觉锤候选打分（2.5）、向下兼容清单（2.6）、IP 前置六问（2.7）、差异化矩阵（2.8）。这一节不增加新方法，而是把这八张表收口为一张<Strong>定位卡片</Strong>——你今后做选题、写文案、谈合作时，要回看的唯一参照。
        </p>
        <p>
          这张卡片是给自己看的，不是给别人看的。但它必须经得起一个最朴素的考验——半年之后再打开，你看着上面写的字，仍然认得出那是你想做的那个账号；并且如果一条新选题和卡片上的某一项冲突，你愿意把那条选题划掉而不是去改卡片。
        </p>

        <SubHead>定位卡片 · 七大模块</SubHead>

        <NumberedList
          items={[
            <>
              <Strong>商业定位（第 1 单品）。</Strong>限定到 SKU 级别的具体产品 / 服务名。不允许写"我做装修"——只能写"我做老破小一房改一房半的隔断设计"。
            </>,
            <>
              <Strong>内容定位（四个维度的选题占比）。</Strong>专业 / 案例 / 人设 / 观点四类内容，未来 30 条视频里各占多少？比例上不必平均，但每一类都不能为零。
            </>,
            <>
              <Strong>视觉锤（具体描述）。</Strong>把人脸 + 标志服饰 + 背景 + 道具一行话写清楚。例：<i>"短发 + 浅蓝衬衫 + 圆框眼镜 + 木质书架背景 + 黑色咖啡杯"</i>。
            </>,
            <>
              <Strong>文字钉（一句广告语）。</Strong>套用超级公式：痛点 + 方案。要短到能放进 28 字简介，简到能被外人复述。
            </>,
            <>
              <Strong>6 大优势中我占住的 2 条。</Strong>明确写出是哪两条，并各举一个能反复出现在视频里的具体素材抓手。
            </>,
            <>
              <Strong>痛点 + 方案的三组等号。</Strong>从工具 2.4 里挑出的三种痛点（怕 / 想 / 怎么办）各对应一组具体定位语。
            </>,
            <>
              <Strong>三大忌讳。</Strong>写下这个账号未来 6 个月内，绝对不会去碰的三件事——这是<Strong>负向定位</Strong>，比正向定位更难写、也更能锁住注意力。
            </>,
          ]}
        />

        <SubHead>六条不通过审核的红线</SubHead>
        <p>
          以下六条，是从大量"看上去合规但实际上跑不出来"的定位卡片里反复总结出的。任何一条命中，回到对应的工具表重做一遍——不要急着开机。
        </p>

        <Checklist
          items={[
            '红线 ①：商业定位写的是"赛道"或"品类"——必须细化到具体单品。',
            '红线 ②：内容定位只有一个维度——四个维度都必须各有 ≥ 1 条视频规划。',
            '红线 ③：视觉锤"以后再说"——必须在开机前确定，且 6 个月不变。',
            '红线 ④：文字钉抽象到无法被复述——你妈复述不出来就不行。',
            '红线 ⑤：6 大优势勾选了 0-1 条——回去补优势再开机，硬撑下去几乎没有例外地失败。',
            '红线 ⑥：三大忌讳空着——意味着你还没想清楚不做什么，等于什么都会做。',
          ]}
        />

        <CaseBlock title="案例 · 一位口腔医生的定位卡片">
          <p>
            <Strong>商业定位：</Strong>30-45 岁中产女性的隐形矫正。<Strong>内容定位：</Strong>专业 40% + 案例 30% + 人设 20% + 观点 10%。<Strong>视觉锤：</Strong>白大褂 + 短发 + 诊所专属木色背景 + 永远手里拿一个牙模。<Strong>文字钉：</Strong>怕矫正难看，做隐形矫正找 X 医生。
          </p>
          <p>
            <Strong>6 大优势占 3 条：</Strong>实体店（自营诊所）+ 会干活（亲自接诊）+ 行业有厚度（业内 12 年）。<Strong>三组等号：</Strong>怕牙黄→隐形矫正、想笑得自然→隐形矫正、矫正过程要见人怎么办→隐形矫正。<Strong>三大忌讳：</Strong>不接广告、不点名同行、不讲与口腔无关的内容。
          </p>
          <p>这张卡片填完，她第二周就开机。卡片的价值不在"开拍前少花几小时填表"，而在半年后每一条选题都能回看这张卡——发现新选题与卡片冲突时，先划掉选题而不是改卡片。<i>（卡片字段为示意，账号数据按个人情况而定。）</i></p>
        </CaseBlock>

        <ToolCard
          tag="工具 2.9"
          title="定位卡片模板（可打印 A4）"
          desc='把这张表打印出来或抄一遍到笔记本上。半年后回头看，你才能判断"我有没有跑偏"。'
        >
          <Table
            head={['模块', '我的回答']}
            rows={[
              ['① 商业定位（第 1 单品）', '/'],
              ['② 内容定位（四维度占比）', '/'],
              ['③ 视觉锤（具体描述）', '/'],
              ['④ 文字钉（一句广告语）', '/'],
              ['⑤ 6 大优势我占住的 2 条', '/'],
              ['⑥ 三组等号（怕 / 想 / 怎么办）', '/'],
              ['⑦ 三大忌讳（绝不碰的三件事）', '/'],
            ]}
            emptyCols={[1]}
          />
        </ToolCard>
      </Chapter>

      <PartEnd />
    </div>
  </div>
)

const PartCover = () => (
  <div className="mb-20 mt-4 border-b border-white/10 pb-16 text-center sm:mb-24 sm:pb-20">
    <div className="mb-7 text-[12px] tracking-[0.7em] text-[#b8aa96]" style={{ paddingLeft: '0.7em' }}>
      第　二　篇
    </div>
    <h1 className="font-serif-zh text-[44px] font-semibold leading-[1.2] tracking-[0.14em] text-[#fffdf7] sm:text-[60px]">
      定位
    </h1>
    <div className="mt-6 font-mono text-[12px] tracking-[0.4em] text-[#b8693a] sm:text-[13px]">
      PART　Ⅱ　·　POSITIONING
    </div>
    <Ornament className="mx-auto mt-9" />
    <p className="mx-auto mt-12 max-w-[460px] text-[14.5px] leading-[2.05] tracking-[0.03em] text-[#cfc6b8] sm:text-[15px]">
      你是谁、对谁说话。
      <br />
      商业定位、内容定位、人设定位三位一体，
      <br />
      写下一张属于自己的定位卡片——
      <br />
      让一类需求被想起来的时候，第一个被想起的就是你。
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
    <div>—— 第二篇 完 ——</div>
    <div className="font-serif-zh mt-3 text-[13px] tracking-[0.18em] text-[#b8693a]">
      下一篇 · 选题与素材库：今天发什么不再焦虑
    </div>
  </div>
)

const ChapterEndNav = () => (
  <nav className="mt-12 grid gap-3 sm:grid-cols-2">
    <Link
      href="/playbook/foundations"
      className="group flex items-center justify-between border border-white/10 bg-white/[0.04] px-5 py-4 transition-colors hover:border-[#b8693a]/60 hover:bg-white/[0.07]"
    >
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#8a7e6f]">
          Previous
        </div>
        <div className="mt-1.5 font-serif-zh text-[15px] tracking-[0.06em] text-[#fffdf7]">
          ← 第一篇 · 底层逻辑
        </div>
      </div>
    </Link>
    <Link
      href="/playbook/topics"
      className="group flex items-center justify-between border border-white/10 bg-white/[0.04] px-5 py-4 transition-colors hover:border-[#b8693a]/60 hover:bg-white/[0.07]"
    >
      <div className="flex-1">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#8a7e6f]">
          Next
        </div>
        <div className="mt-1.5 font-serif-zh text-[15px] tracking-[0.06em] text-[#fffdf7]">
          第三篇 · 选题与素材库 →
        </div>
      </div>
    </Link>
  </nav>
)
